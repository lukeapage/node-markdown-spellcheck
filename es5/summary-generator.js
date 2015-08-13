"use strict";

exports.__esModule = true;
exports["default"] = generateSummary;

function generateSummary(spellingErrors) {
  return spellingErrors.map(function (e) {
    return e.word;
  }).filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

module.exports = exports["default"];