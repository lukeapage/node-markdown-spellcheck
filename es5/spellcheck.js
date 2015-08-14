'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _hunspellSpellchecker = require("hunspell-spellchecker");

var _hunspellSpellchecker2 = _interopRequireDefault(_hunspellSpellchecker);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var spellchecker = new _hunspellSpellchecker2['default']();

try {
  var dict = spellchecker.parse({
    aff: _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../data/en_GB.aff')),
    dic: _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../data/en_GB.dic'))
  });
  spellchecker.use(dict);
} catch (e) {
  console.log("Error");
  console.log(e);
}

exports['default'] = function (words) {
  var mistakes = [];
  for (var i = 0; i < words.length; i++) {
    var wordInfo = words[i];
    var word = wordInfo.word.replace(/\u2019/, "'");
    if (!spellchecker.check(word)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
};

module.exports = exports['default'];