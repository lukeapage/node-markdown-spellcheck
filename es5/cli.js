'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cliInteractive = require('./cli-interactive');

var _cliInteractive2 = _interopRequireDefault(_cliInteractive);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _multiFileProcessor = require('./multi-file-processor');

var _multiFileProcessor2 = _interopRequireDefault(_multiFileProcessor);

var _spellcheck = require('./spellcheck');

var _reportGenerator = require('./report-generator');

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion)
// default cli behaviour will be an interactive walkthrough each error, with suggestions,
// options to replace etc.
.option('-r, --report', 'Outputs a full report which details the unique spelling errors found.').option('-n, --ignore-numbers', 'Ignores numbers.').option('--en-us', 'American english dictionary.').option('--en-gb', 'British english dictionary.').option('-d, --dictionary [file]', 'specify a custom dictionary file - it should not include the file extension and will load .dic and .aiff.').option('-a, --ignore-acronyms', 'Ignores acronyms.').option('-x, --no-suggestions', 'Do not suggest words (can be slow)').usage("[options] source-file source-file").parse(process.argv);

var options = {
  ignoreAcronyms: _commander2['default'].ignoreAcronyms,
  ignoreNumbers: _commander2['default'].ignoreNumbers,
  suggestions: _commander2['default'].suggestions,
  dictionary: {
    language: _commander2['default'].enUs ? "en-us" : _commander2['default'].enGb ? "en-gb" : undefined,
    file: _commander2['default'].dictionary
  }
};

if (!_commander2['default'].args.length) {
  _commander2['default'].outputHelp();
  process.exit();
} else {

  _spellcheck.initialise(options);

  var inputPatterns = _commander2['default'].args;
  _multiFileProcessor2['default'](inputPatterns, options, function (filename, src, fileProcessed) {

    if (_commander2['default'].report) {
      var errors = _index2['default'].spell(src, options);
      if (errors.length > 0) {
        console.log(_reportGenerator.generateFileReport(filename, { errors: errors, src: src }));
        process.exitCode = 1;
      }
      fileProcessed(null, errors);
    } else {
      console.log("Spelling - " + _chalk2['default'].bold(filename));
      _cliInteractive2['default'](filename, src, options, fileProcessed);
    }
  }, function (e, results) {
    console.log(_reportGenerator.generateSummaryReport(results));
  });
}