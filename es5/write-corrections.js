'use strict';

exports.__esModule = true;
exports['default'] = writeCorrections;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _wordReplacer = require('./word-replacer');

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

module.exports = exports['default'];