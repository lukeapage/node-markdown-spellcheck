"use strict";

exports.__esModule = true;

exports["default"] = function (tokens) {
  var wordList = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var text = token.text;
    var index = token.index;
    while (true) {
      var nextWord = text.match(/(\w(\.\w)+\.?)|[\w'\u2018-\u2019]+/);
      if (!nextWord) {
        break;
      }

      if (!nextWord[0].match(/^[0-9,\.]+$/)) {
        var word = nextWord[0];
        var thisWordIndex = index + nextWord.index;

        if (word.match(/^['\u2018]/)) {
          thisWordIndex += 1;
          word = word.substr(1, word.length - 1);
        }
        if (word.match(/['\u2019]$/)) {
          word = word.substr(0, word.length - 1);
        }
        wordList.push({ word: word, index: thisWordIndex });
      }
      index += nextWord.index + nextWord[0].length;
      text = text.slice(nextWord.index + nextWord[0].length);
    }
  }
  return wordList;
};

module.exports = exports["default"];