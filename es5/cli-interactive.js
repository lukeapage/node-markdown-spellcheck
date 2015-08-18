'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _wordReplacer = require('./word-replacer');

var _spellConfig = require('./spell-config');

var _spellConfig2 = _interopRequireDefault(_spellConfig);

var ACTION_IGNORE = "ignore";
var ACTION_FILE_IGNORE = "fileignore";
var ACTION_ADD = "add";
var ACTION_ADD_CASED = "add-cased";
var ACTION_CORRECT = "enter";

var CHOICE_IGNORE = { name: "Ignore", value: ACTION_IGNORE };
var CHOICE_FILE_IGNORE = { name: "Add to file ignores", value: ACTION_FILE_IGNORE };
var CHOICE_ADD = { name: "Add to dictionary - case insensitive", value: ACTION_ADD };
var CHOICE_ADD_CASED = { name: "Add to dictionary - case sensitive", value: ACTION_ADD_CASED };
var CHOICE_CORRECT = { name: "Enter correct spelling", value: ACTION_CORRECT };

var previousChoices = Object.create(null);

function incorrectWordChoices(word, message, filename, options, done) {
  var suggestions = options.suggestions ? _index2['default'].spellcheck.suggest(word) : [];

  var choices = [CHOICE_IGNORE, CHOICE_FILE_IGNORE, CHOICE_ADD, CHOICE_CORRECT];

  if (word.match(/[A-Z]/)) {
    choices.splice(3, 0, CHOICE_ADD_CASED);
  }

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
        word = word.toLowerCase();
      /* fallthrough */
      case ACTION_ADD_CASED:
        _index2['default'].spellcheck.addWord(word);
        _spellConfig2['default'].addToGlobalDictionary(word);
        done();
        break;
      case ACTION_CORRECT:
        getCorrectWord(word, filename, options, done);
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

function getCorrectWord(word, filename, options, done) {
  _inquirer2['default'].prompt([{
    type: "input",
    name: "word",
    message: "correct word >",
    'default': word
  }], function (answer) {
    var newWord = answer.word;
    if (_filters2['default'].filter([answer], options).length > 0 && _index2['default'].spellcheck.checkWord(newWord)) {
      done(newWord);
    } else {
      incorrectWordChoices(newWord, "Corrected word is not in dictionary..", filename, options, function (newNewWord) {
        var finalNewWord = newNewWord || newWord;
        previousChoices[word] = { newWord: finalNewWord };
        done(finalNewWord);
      });
    }
  });
}

function writeCorrections(src, file, corrections, onCorrected) {
  var correctedSrc = _wordReplacer.replace(src, corrections);
  _fs2['default'].writeFile(file, correctedSrc, function (err) {
    if (err) {
      console.error("Failed to write corrections to :", file);
      process.exitCode = 1;
    }
    onCorrected();
  });
}

function spellAndFixFile(file, options, onFinishedFile) {
  _fs2['default'].readFile(file, 'utf-8', function (err, src) {

    if (err) {
      console.error("Failed to open file:" + file);
      console.error(err);
      process.exitCode = 1;
      return onFinishedFile();
    }

    var corrections = [];

    function onSpellingMistake(wordInfo, done) {
      var displayBlock = _context2['default'].getBlock(src, wordInfo.index, wordInfo.word.length);
      console.log(displayBlock.info);
      incorrectWordChoices(wordInfo.word, " ", file, options, function (newWord) {
        if (newWord) {
          corrections.push({ wordInfo: wordInfo, newWord: newWord });
        }
        done();
      });
    }

    _index2['default'].spellCallback(src, options, onSpellingMistake, function () {
      function onCorrected() {
        _index2['default'].spellcheck.resetTemporaryCustomDictionary();
        onFinishedFile();
      }
      if (corrections.length) {
        writeCorrections(src, file, corrections, onCorrected);
      } else {
        onCorrected();
      }
    });
  });
}

exports['default'] = function (file, options, fileProcessed) {
  spellAndFixFile(file, options, function () {
    _spellConfig2['default'].writeFile(fileProcessed);
  });
};

module.exports = exports['default'];