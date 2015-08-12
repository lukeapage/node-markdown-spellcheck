"use strict";

exports.__esModule = true;

exports["default"] = function (tokens) {
  var wordList = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var text = token.text;
    var index = token.index;
    while (true) {
      var nextWord = text.match(/[\w`']+/);
      if (!nextWord) {
        break;
      }
      var word = nextWord[0].replace(/[`']$/, "");
      index += nextWord.index;
      wordList.push({ word: word, index: index });
      index += nextWord[0].length;
      text = text.slice(nextWord.index + nextWord[0].length);
    }
  }
  return wordList;
};

module.exports = exports["default"];