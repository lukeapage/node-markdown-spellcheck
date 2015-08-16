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

var _wordReplacer = require('./word-replacer');

var _spellConfig = require('./spell-config');

var _spellConfig2 = _interopRequireDefault(_spellConfig);

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion)
// default cli behaviour will be an interactive walkthrough each error, with suggestions,
// options to replace etc.
.option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.').option('-r, --report', 'Outputs a full report which details the unique spelling errors found.').option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
.option('-a, --ignore-acronyms', 'Ignores acronyms.').option('-x, --no-suggestions', 'Do not suggest words (can be slow)').usage("[options] source-file source-file");

var ACTION_IGNORE = "ignore",
    ACTION_FILE_IGNORE = "fileignore",
    ACTION_ADD = "add",
    ACTION_CORRECT = "enter";

var CHOICE_IGNORE = { key: "i", name: "Ignore", value: ACTION_IGNORE },
    CHOICE_FILE_IGNORE = { key: "f", name: "Add to file ignores", value: ACTION_FILE_IGNORE },
    CHOICE_ADD = { key: "a", name: "Add to dictionary", value: ACTION_ADD },
    CHOICE_CORRECT = { key: "e", name: "Enter correct spelling", value: ACTION_CORRECT };

var previousChoices = Object.create(null);

function incorrectWordChoices(word, message, filename, done) {
  var suggestions = _commander2['default'].noSuggestions ? [] : _index2['default'].spellcheck.suggest(word);

  var choices = [CHOICE_IGNORE, CHOICE_FILE_IGNORE, CHOICE_ADD, CHOICE_CORRECT];

  var defaultAction = ACTION_CORRECT;
  if (previousChoices[word]) {
    var previousAction = previousChoices[word];
    if (previousAction.newWord) {
      var suggestionIndex = suggestions.indexOf(previousAction.newWord);
      if (suggestions.indexOf(previousAction.newWord) >= 0) {
        defaultAction = suggestionIndex.toString();
      } else {
        suggestions.unshift(previousAction.newWord);
        defaultAction = "0";
      }
    } else {
      defaultAction = previousAction.action;
    }
  }

  suggestions.forEach(function (suggestion, index) {
    choices.push({
      key: index,
      name: suggestion,
      value: index.toString()
    });
  });

  _inquirer2['default'].prompt([{
    type: "list",
    name: "action",
    message: message,
    choices: choices,
    'default': defaultAction
  }], function (answer) {
    switch (answer.action) {
      case ACTION_ADD:
        _index2['default'].spellcheck.addWord(word);
        _spellConfig2['default'].addToGlobalDictionary(word);
        done();
        break;
      case ACTION_CORRECT:
        getCorrectWord(word, filename, done);
        break;
      case ACTION_FILE_IGNORE:
        _index2['default'].spellcheck.addWord(word, true);
        _spellConfig2['default'].addToFileDictionary(filename, word);
        previousChoices[word] = answer;
        done();
        break;
      case ACTION_IGNORE:
        _index2['default'].spellcheck.addWord(word);
        done();
        break;
      default:
        previousChoices[word] = { newWord: suggestions[Number(answer.action)] };
        done(suggestions[Number(answer.action)]);
        break;
    }
  });
}

function getCorrectWord(word, filename, done) {
  _inquirer2['default'].prompt([{
    type: "input",
    name: "word",
    message: "correct word >",
    'default': word
  }], function (answer) {
    var newWord = answer.word;
    if (_index2['default'].spellcheck.checkWord(newWord)) {
      done(newWord);
    } else {
      incorrectWordChoices(newWord, "Corrected word is not in dictionary..", filename, function (newNewWord) {
        var finalNewWord = newNewWord || newWord;
        previousChoices[word] = { newWord: finalNewWord };
        done(finalNewWord);
      });
    }
  });
}

function spellAndFixFile(file, options, onFinishedFile) {
  _fs2['default'].readFile(file, 'utf-8', function (err, src) {
    var corrections = [];

    function onSpellingMistake(wordInfo, done) {
      var displayBlock = _context2['default'].getBlock(src, wordInfo.index, wordInfo.word.length);
      console.log(displayBlock.info);
      incorrectWordChoices(wordInfo.word, " ", file, function (newWord) {
        if (newWord) {
          corrections.push({ wordInfo: wordInfo, newWord: newWord });
        }
        console.log("on spelling mistake finished");
        done();
      });
    }

    _index2['default'].spellCallback(src, options, onSpellingMistake, function () {
      console.log("file done");
      function onCorrected() {
        _index2['default'].spellcheck.resetTemporaryCustomDictionary();
        console.log("on finished file");
        onFinishedFile();
      }
      if (corrections.length) {
        var correctedSrc = _wordReplacer.replace(src, corrections);
        console.log("writing file");
        _fs2['default'].writeFile(file, correctedSrc, function (err) {
          console.log("written");
          onCorrected();
        });
      } else {
        onCorrected();
      }
    });
  });
}

_commander2['default'].parse(process.argv);

if (!_commander2['default'].args.length) {
  _commander2['default'].outputHelp();
  process.exit();
} else {
  (function () {

    //chalk.red("red"); // fix very weird bug

    var options = {
      ignoreAcronyms: _commander2['default'].ignoreAcronyms,
      ignoreNumbers: _commander2['default'].ignoreNumbers
    };

    var inputPatterns = _commander2['default'].args;
    var allFiles = [];
    _async2['default'].parallel([_spellConfig2['default'].initialise.bind(_spellConfig2['default'], './.spelling'), _async2['default'].each.bind(_async2['default'], inputPatterns, function (inputPattern, inputPatternProcessed) {
      _glob2['default'](inputPattern, function (err, files) {
        allFiles.push.apply(allFiles, files);
        inputPatternProcessed();
      });
    })], function () {
      _spellConfig2['default'].getGlobalWords().forEach(function (word) {
        return _index2['default'].spellcheck.addWord(word);
      });
      _async2['default'].eachSeries(allFiles, function (file, fileProcessed) {
        try {
          console.log("Spelling - " + _chalk2['default'].bold(file));

          _spellConfig2['default'].getFileWords(file).forEach(function (word) {
            return _index2['default'].spellcheck.addWord(word, true);
          });

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
            spellAndFixFile(file, options, function () {
              _spellConfig2['default'].writeFile(fileProcessed);
            });
          }
        } catch (e) {
          console.log("Error in " + file);
          console.error(e);
          console.error(e.stack);
        }
      });
    });
  })();
}