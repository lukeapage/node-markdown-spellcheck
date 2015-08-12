"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _marked = require("marked");

var _marked2 = _interopRequireDefault(_marked);

exports["default"] = function (src) {
  var textTokens = [];
  var currentIndex = 0;
  var currentLength = 0;

  var options = {
    gfm: true,
    renderer: {
      strong: function strong() {},
      em: function em() {},
      codespan: function codespan() {},
      br: function br() {},
      del: function del() {},
      link: function link() {},
      image: function image() {},
      text: function text(_text) {
        var newIndex = src.indexOf(_text, currentIndex);
        if (newIndex === -1 || newIndex > currentLength + currentIndex) {
          throw new Error("Could not find index of text");
        }
        currentLength -= currentIndex - newIndex;
        currentIndex = newIndex;
        textTokens.push({ text: _text, index: newIndex });
      }
    }
  };

  var tokens = _marked2["default"].lexer(src, options);
  var inlineLexer = new _marked2["default"].InlineLexer(tokens.links, options);

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token.text && token.type !== "code") {
      currentIndex = src.indexOf(token.text, currentIndex);
      currentLength = token.text.length;
      inlineLexer.output(token.text);
    }
  }

  return textTokens;
};

;
module.exports = exports["default"];