"use strict";

exports.__esModule = true;
exports["default"] = filterAcronyms;

function filterAcronyms(spellingErrors) {
  return spellingErrors.filter(function (e) {
    return !e.word.match(/[A-Z0-9]{2,}/);
  });
}

module.exports = exports["default"];