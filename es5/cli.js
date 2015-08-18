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

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _summaryGenerator = require('./summary-generator');

var _summaryGenerator2 = _interopRequireDefault(_summaryGenerator);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _multiFileProcessor = require('./multi-file-processor');

var _multiFileProcessor2 = _interopRequireDefault(_multiFileProcessor);

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion)
// default cli behaviour will be an interactive walkthrough each error, with suggestions,
// options to replace etc.
.option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found (implies -r).').option('-r, --report', 'Outputs a full report which details the unique spelling errors found.').option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
.option('-a, --ignore-acronyms', 'Ignores acronyms.').option('-x, --no-suggestions', 'Do not suggest words (can be slow)').usage("[options] source-file source-file").parse(process.argv);

var options = {
  ignoreAcronyms: _commander2['default'].ignoreAcronyms,
  ignoreNumbers: _commander2['default'].ignoreNumbers,
  suggestions: _commander2['default'].suggestions
};

if (!_commander2['default'].args.length) {
  _commander2['default'].outputHelp();
  process.exit();
} else {

  _chalk2['default'].red("red"); // fix very weird bug - https://github.com/chalk/chalk/issues/80

  var inputPatterns = _commander2['default'].args;
  _multiFileProcessor2['default'](inputPatterns, options, function (file, fileProcessed) {
    console.log("Spelling - " + _chalk2['default'].bold(file));

    if (_commander2['default'].report || _commander2['default'].summary) {
      var spellingInfo = _index2['default'].spellFile(file, options);

      if (spellingInfo.errors.length) {
        process.exitCode = 1;
      }

      if (_commander2['default'].summary) {
        var summary = _summaryGenerator2['default'](spellingInfo.errors);
        console.log(summary);
      } else {
        for (var i = 0; i < spellingInfo.errors.length; i++) {
          var error = spellingInfo.errors[i];

          var displayBlock = _context2['default'].getBlock(spellingInfo.src, error.index, error.word.length);
          console.log(displayBlock.info);
        }
        console.log();
      }
      fileProcessed(null, spellingInfo.errors);
    } else {
      _cliInteractive2['default'](file, options, fileProcessed);
    }
  });
}