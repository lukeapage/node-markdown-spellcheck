'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _spellConfig = require('./spell-config');

var _spellConfig2 = _interopRequireDefault(_spellConfig);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

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
      return _index2['default'].spellcheck.addWord(word);
    });

    _async2['default'].mapSeries(allFiles, function (file, fileProcessed) {

      _spellConfig2['default'].getFileWords(file).forEach(function (word) {
        return _index2['default'].spellcheck.addWord(word, true);
      });

      fileCallback(file, fileProcessed);
    }, resultCallback);
  });
};

module.exports = exports['default'];