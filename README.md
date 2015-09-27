# grunt-onesky-export

> Export translations from your OneSky projects

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-onesky-export --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-onesky-export');
```

## The "oneskyExport" task

### Overview
In your project's Gruntfile, add a section named `oneskyExport` to the data object passed into `grunt.initConfig()`.

### Options

#### options.authFile
Type: `String`
Default value: `onesky.json`

A JSON file with your OneSky API keys.
```
{
    "publicKey": "YOUR_PUBLIC_KEY",
    "secretKey": "YOUR_SECRET_KEY"
}
```

#### options.dest
Type: `String`
Default value: `/`

The destination of the exported translation file(s).

#### options.projectId
Type: `String`

Your OneSky project ID

#### options.sourceFile
Type: `String`

The filename of the imported translation document. You can find a list of your uploaded files at "Projects > _YOUR-PROJECT-NAME_ > Phrases Management > Manage Files", when logged in as a project admin in your OneSky account.

#### options.locale
Type: `String`

The specific translation language you wish to export. This option is only **required** when options.exportType is set to `locale`

#### options.fileFormat
Type: `String`

The file format for OneSky to assume when exporting translations (if different from source file format). See list of available [file formats](https://github.com/onesky/api-documentation-platform/blob/master/reference/format.md). This option is only valid when options.exportType is set to `multilingual`.

NOTE: It is recommended to only convert from a source file with format: `I18NEXT_HIERARCHICAL_JSON`. Otherwise, leave this unset to maintain the original source file format.

#### options.output (optional)
Type: `String`

The filename for the exported translation file(s).

#### options.exportType (optional)
Type: `String` Default: `multilingual` Allowed values: `locale`, `multilingual`

The export method to generate translation documents.

* `locale` fetches a specified language translation and exports to a single file.
* `multilingual` fetches all language translations and exports to a single file.

#### options.readyToPublish (optional)
Type: `Boolean` Default: `false`

Checks whether the specified locale is flagged _isReadyToPublish_ in your OneSky project. This options is only valid when options.exportType is set to `locale`.

NOTE: Enabling this option triggers an additional call to the OneSky API to first check the status of the locale before downloading the translations.

#### options.sortKeys (optional)
Type: `Boolean`
Default value: `false`

Sort exported translation keys alphabetically.

#### options.indent (optional)
Type: `Integer`
Default value: `4`

Number of whitespaces to indent the output JSON

### Usage Examples

```js
grunt.initConfig({
    oneskyExport: {
        options: {
            authFile: 'onesky.json',
            dest: 'translations/',
            projectId: '12345',
            indent: 4,
            sortKeys: true
        },
        exportMedia: {
            options: {
                sourceFile: 'media.json',
                output: 'media.json',
                exportType: 'multilingual'
            }
        },
        exportUser: {
            options: {                
                sourceFile: 'user.json',
                output: 'user/en.json',
                exportType: 'locale',
                locale: 'en'
            }
        }
    },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style via eslint. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
