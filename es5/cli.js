'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _summaryGenerator = require('./summary-generator');

var _summaryGenerator2 = _interopRequireDefault(_summaryGenerator);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion)
// default cli behaviour will be an interactive walkthrough each error, with suggestions,
// options to replace etc.
.option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.').option('-r, --report', 'Outputs a full report which details the unique spelling errors found.')
//  .option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
.option('-a, --ignore-acronyms', 'Ignores acronyms.').usage("[options] source-file source-file");

function spellAndFixFile(file, options, onFinishedFile) {
  var src = _fs2['default'].readFileSync(file, 'utf-8');

  function onSpellingMistake(wordInfo, done) {
    var displayBlock = _context2['default'].getBlock(src, wordInfo.index, wordInfo.word.length);
    console.log(displayBlock.info);
    var suggestions = _index2['default'].suggest(wordInfo);
    if (suggestions) {
      suggestions.forEach(function (suggestion, index) {
        return console.log(index + ": " + suggestion);
      });
    }
    _inquirer2['default'].prompt([{
      type: "expand",
      name: "action",
      message: "message",
      choices: [{ key: "i", name: "Ignore", value: "ignore" }, { key: "f", name: "Add to file ignores", value: "fileignore" }, { key: "a", name: "Add to dictionary", value: "add" }, { key: "s", name: "Use suggestion", value: "suggestion" }, { key: "e", name: "Enter correct spelling", value: "enter" }] /*{
                                                                                                                                                                                                                                                                                                               "i": "Ignore",
                                                                                                                                                                                                                                                                                                               "f": "Add to file ignores",
                                                                                                                                                                                                                                                                                                               "a": "Add to dictionary",
                                                                                                                                                                                                                                                                                                               "s": "use suggestion",
                                                                                                                                                                                                                                                                                                               "e": "Enter correct spelling"
                                                                                                                                                                                                                                                                                                               }*/
    }], function (answer) {
      console.log(answer);
      done();
    });
  }

  _index2['default'].spellCallback(src, options, onSpellingMistake, function () {
    return onFinishedFile();
  });
}

_commander2['default'].parse(process.argv);

if (!_commander2['default'].args.length) {
  _commander2['default'].outputHelp();
  process.exit();
} else {
  (function () {

    var options = {
      ignoreAcronyms: _commander2['default'].ignoreAcronyms
    };

    var inputPatterns = _commander2['default'].args;
    var allFiles = [];
    _async2['default'].each(inputPatterns, function (inputPattern, inputPatternProcessed) {
      _glob2['default'](inputPattern, function (err, files) {
        allFiles.push.apply(allFiles, files);
        inputPatternProcessed();
      });
    }, function () {
      _async2['default'].eachSeries(allFiles, function (file, fileProcessed) {
        try {
          console.log("Spelling - " + _chalk2['default'].bold(file));

          if (_commander2['default'].report) {
            var spellingInfo = _index2['default'].spellFile(file, options);

            if (_commander2['default'].summary) {
              var summary = _summaryGenerator2['default'](spellingInfo.errors);
              console.log(summary);
            } else {
              for (var k = 0; k < spellingInfo.errors.length; k++) {
                var error = spellingInfo.errors[k];

                var displayBlock = _context2['default'].getBlock(spellingInfo.src, error.index, error.word.length);
                console.log(displayBlock.info);
              }
              console.log();
            }
            fileProcessed();
          } else {
            spellAndFixFile(file, options, fileProcessed);
          }
        } catch (e) {
          console.log("Error in " + files[j]);
          console.error(e);
          console.error(e.stack);
        }
      });
    });
  })();
}
//default: "e"