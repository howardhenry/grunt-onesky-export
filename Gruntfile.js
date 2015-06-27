/*
 * grunt-onesky-export
 * https://github.com/howardhenry/grunt-onesky-export
 *
 * Copyright (c) 2015 Howard Henry
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: [
                '**/*.js',
                '!Gruntfile.js',
                '!node_modules/**/*.js',
                '!test/**/*.js'
            ]
        }

    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', ['eslint']);

};
