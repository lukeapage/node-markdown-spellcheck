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

function spell(src, options) {
  if (typeof src !== "string") {
    throw new Error("spell takes a string");
  }
  var ignoreAcronyms = options && options.ignoreAcronyms;
  var errors = _spellcheck2['default'](_wordParser2['default'](_markdownParser2['default'](src)));

  if (ignoreAcronyms) {
    errors = _filters2['default'].acronyms(errors);
  }
  errors = _filters2['default'].numbers(errors);
  return errors;
}

function spellFile(filename, options) {
  var src = _fs2['default'].readFileSync(filename, 'utf-8');
  return {
    errors: spell(src, options),
    src: src
  };
}

exports['default'] = { spell: spell, spellFile: spellFile };
module.exports = exports['default'];