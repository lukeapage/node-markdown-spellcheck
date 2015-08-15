'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _markdownParser = require('./markdown-parser');

var _markdownParser2 = _interopRequireDefault(_markdownParser);

var _wordParser = require('./word-parser');

var _wordParser2 = _interopRequireDefault(_wordParser);

var _spellcheck = require('./spellcheck');

var _spellcheck2 = _interopRequireDefault(_spellcheck);

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function getWords(src, options) {
  var ignoreAcronyms = options && options.ignoreAcronyms;
  var words = _wordParser2['default'](_markdownParser2['default'](src));

  if (ignoreAcronyms) {
    words = _filters2['default'].acronyms(words);
  }
  words = _filters2['default'].numbers(words);
  return words;
}

function spell(src, options) {
  if (typeof src !== "string") {
    throw new Error("spell takes a string");
  }
  var words = getWords(src, options);
  return _spellcheck2['default'].checkWords(words);
}

function spellFile(filename, options) {
  var src = _fs2['default'].readFileSync(filename, 'utf-8');
  return {
    errors: spell(src, options),
    src: src
  };
}

function spellCallback(src, options, callback, done) {
  var words = getWords(src, options);

  _async2['default'].eachSeries(words, function (wordInfo, onWordProcessed) {
    if (!_spellcheck2['default'].checkWord(wordInfo.word)) {
      callback(wordInfo, onWordProcessed);
    } else {
      onWordProcessed();
    }
  }, done);
}

function suggest(wordInfo) {
  return _spellcheck2['default'].suggest(wordInfo.word);
}

exports['default'] = { spell: spell, spellFile: spellFile, spellCallback: spellCallback, suggest: suggest };
module.exports = exports['default'];