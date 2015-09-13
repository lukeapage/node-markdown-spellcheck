'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function getLines(src, index, noBefore, noAfter) {
  var beforeLines = [];
  var afterLines = [];
  var thisLineStart = undefined,
      line = undefined,
      column = undefined;
  var lastCutIndex = index;

  for (var i = index - 1; i >= 0; i--) {
    if (src[i] === '\n') {
      if (thisLineStart === undefined) {
        thisLineStart = i + 1;
        column = index - (i + 1);
      } else {
        beforeLines.push(src.substr(i, lastCutIndex - i));
      }
      lastCutIndex = i;
      if (beforeLines.length >= noBefore) {
        break;
      }
    }
  }
  if (thisLineStart === undefined) {
    thisLineStart = 0;
    column = index;
  }
  for (var i = index; i < src.length; i++) {
    if (src[i] === '\n') {
      if (line === undefined) {
        line = src.substr(thisLineStart, i - thisLineStart);
      } else {
        afterLines.push(src.substr(lastCutIndex, i - lastCutIndex));
      }
      lastCutIndex = i;
      if (afterLines.length >= noAfter) {
        break;
      }
    }
  }
  if (line === undefined) {
    line = src.slice(thisLineStart);
  }
  var lineNumber = 1;
  for (var i = index - 1; i >= 0; i--) {
    if (src[i] === '\n') {
      lineNumber++;
    }
  }
  return {
    line: line,
    beforeLines: beforeLines,
    afterLines: afterLines,
    column: column,
    lineNumber: lineNumber
  };
}

exports['default'] = {
  getBlock: function getBlock(src, index, length) {
    var lineInfo = getLines(src, index, 2, 2);
    var lineStart = 0;
    var lineEnd = lineInfo.line.length;
    if (lineInfo.column > 30) {
      lineStart = lineInfo.column - 30;
    }
    if (lineEnd - (lineInfo.column + length) > 30) {
      lineEnd = lineInfo.column + length + 30;
    }
    var info = lineInfo.line.substring(lineStart, lineInfo.column) + _chalk2['default'].red(lineInfo.line.substr(lineInfo.column, length)) + lineInfo.line.substring(lineInfo.column + length, lineEnd);
    return {
      info: info,
      lineNumber: lineInfo.lineNumber
    };
  }
};
module.exports = exports['default'];