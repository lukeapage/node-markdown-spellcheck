'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _spellConfig = require('./spell-config');

var _spellConfig2 = _interopRequireDefault(_spellConfig);

var _spellcheck = require("./spellcheck");

var _spellcheck2 = _interopRequireDefault(_spellcheck);

exports['default'] = function (inputPatterns, options, fileCallback, resultCallback) {
  var allFiles = [];
  _async2['default'].parallel([_spellConfig2['default'].initialise.bind(_spellConfig2['default'], './.spelling'), _async2['default'].each.bind(_async2['default'], inputPatterns, function (inputPattern, inputPatternProcessed) {
    _glob2['default'](inputPattern, function (err, files) {
      if (err) {
        console.error("Error globbing:", inputPattern);
        process.exitCode = 1;
      } else {
        allFiles.push.apply(allFiles, files);
      }
      inputPatternProcessed();
    });
  })], function () {

    _spellConfig2['default'].getGlobalWords().forEach(function (word) {
      return _spellcheck2['default'].addWord(word);
    });

    _async2['default'].mapSeries(allFiles, function (file, fileProcessed) {

      _spellConfig2['default'].getFileWords(file).forEach(function (word) {
        return _spellcheck2['default'].addWord(word, true);
      });

      fileCallback(file, function () {
        _spellcheck2['default'].resetTemporaryCustomDictionary();
        fileProcessed();
      });
    }, resultCallback);
  });
};

module.exports = exports['default'];