/*
 * grunt-onesky-export
 * https://github.com/howardhenry/grunt-onesky-export
 *
 * Copyright (c) 2015 Howard Henry
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var q = require('q');
var request = require('request');
var sortObject = require('deep-sort-object');

var apiRoot = 'https://platform.api.onesky.io/1/';

module.exports = function (grunt) {
    grunt.registerMultiTask('oneskyExport', 'Export translations from OneSky', function () {

        var done = this.async();

        var options = this.options({
            authFile: 'onesky.json',
            dest: '/',
            projectId: '',
            sourceFile: '',
            output: '',
            sortKeys: false,
            indent: 4,
            exportType: 'multilingual',

            // Required only for exportType === 'multilingual'
            fileFormat: '',

            // Required only for exportType === 'locale'
            locale: '',
            readyToPublish: false
        });

        return fetchTranslations();

        ///////////////////////////


        function fetchTranslations() {
            var api = getApi();
            var url = api.baseUrl + api.path;
            var requestOptions;
            var queryParams = { 'source_file_name': options.sourceFile };

            if (options.exportType === 'multilingual') {
                url = url + 'translations/multilingual';

                if (options.fileFormat) {
                    queryParams = _.extend(queryParams, { 'file_format': options.fileFormat });
                } else {
                    grunt.fail.warn('Export type "multilingual" requires options.fileFormat to be set');
                }
            }

            if (options.exportType === 'locale') {
                url = url + 'translations';

                if (options.locale) {
                    queryParams = _.extend(queryParams, { 'locale': options.locale });
                } else {
                    grunt.fail.warn('Export type "locale" requires options.locale to be set');
                }
            }

            requestOptions = {
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json' },
                qs: {
                    'api_key': api.publicKey,
                    'timestamp': api.timestamp,
                    'dev_hash': api.devHash
                }
            };
            requestOptions.qs = _.extend(requestOptions.qs, queryParams);

            if (options.readyToPublish && options.exportType === 'locale' && options.locale) {
                isReadyToPublish(options.locale)
                    .then(function () {
                        request(requestOptions, onFetchTranslations);
                    })
                    .catch(function () {
                        grunt.log.error('Translation download aborted. ' +
                        'Locale: "' + options.locale + '" is not ready to be published');

                        done();
                    });
            } else {
                request(requestOptions, onFetchTranslations);
            }

            function onFetchTranslations(error, response, body) {
                if (error) { throw error; }

                switch (response.statusCode) {
                    case 200:
                        onFetchTranslationSuccess(body);
                        break;
                    case 204:
                        onFetchTranslationSuccess(null);
                        break;
                    default:
                        onFetchTranslationError(body);
                        break;
                }

                done();
            }

            function onFetchTranslationSuccess(body) {
                var fileName;
                var jsonData;
                var data = {};

                if (body) { data = JSON.parse(body); }

                if (options.sortKeys) { data = sortObject(data); }

                jsonData = JSON.stringify(data, null, options.indent) + '\n';

                if (options.exportType === 'multilingual') {
                    fileName = options.output || options.sourceFile;
                    grunt.file.write(options.dest + fileName, jsonData);
                }

                if (options.exportType === 'locale') {
                    fileName = options.output || options.locale + '_' + options.sourceFile;
                    grunt.file.write(options.dest + fileName, jsonData);
                }

                grunt.log.ok('Translation downloaded: ' + options.dest + fileName);
            }

            function onFetchTranslationError(body) {
                var error = JSON.parse(body);
                var errorMsg;
                var statusCode;

                if (_.has(error, 'meta.status')) {
                    statusCode = error.meta.status;
                }
                if (_.has(error, 'meta.message')) {
                    errorMsg = error.meta.message;
                }

                grunt.fail.warn(statusCode + ': ' + errorMsg);
            }
        }

        function isReadyToPublish(locale) {
            var deferred = q.defer();
            var isReady = false;

            getLanguages()
                .then(function (languages) {
                    _.forEach(languages, function (language) {
                        if (language['locale'] === locale && language['is_ready_to_publish']) { isReady = true; }
                    });
                })
                .finally(function () {
                    if (isReady) {
                        deferred.resolve(isReady);
                    } else {
                        deferred.reject(isReady);
                    }
                });

            return deferred.promise;
        }


        function getLanguages() {
            var deferred = q.defer();
            var api = getApi();
            var url = api.baseUrl + api.path + 'languages';

            var requestOptions = {
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json' },
                qs: {
                    'api_key': api.publicKey,
                    'timestamp': api.timestamp,
                    'dev_hash': api.devHash
                }
            };

            request(requestOptions, onGetLanguages);

            function onGetLanguages(error, response, body) {
                if (error) { throw error; }

                body = JSON.parse(body);

                if (response.statusCode === 200) {
                    onGetLanguagesSuccess(body);
                } else {
                    onGetLanguagesError(body);
                }
            }

            function onGetLanguagesSuccess(data) {
                deferred.resolve(data.data);
            }

            function onGetLanguagesError(error) {
                var errorMsg;
                var statusCode;

                if (_.has(error, 'meta.status')) { statusCode = error.meta.status; }
                if (_.has(error, 'meta.message')) { errorMsg = error.meta.message; }

                throw statusCode + ': ' + errorMsg;
            }

            return deferred.promise;
        }


        function getApi() {
            var oneSkyKeys = grunt.file.readJSON(options.authFile);
            var timestamp = Math.floor(Date.now() / 1000);
            var devHash;

            if (!oneSkyKeys.publicKey || !oneSkyKeys.secretKey) {
                grunt.fail.warn('Auth file requires both publicKey and secretKey');
            } else {
                devHash = crypto.createHash('md5').update(timestamp + oneSkyKeys.secretKey).digest('hex');
            }

            return {
                baseUrl: apiRoot,
                path: 'projects/' + options.projectId + '/',
                publicKey: oneSkyKeys.publicKey,
                timestamp: timestamp,
                devHash: devHash
            };
        }
    });
};
