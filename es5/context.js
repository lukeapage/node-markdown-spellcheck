'use strict';

exports.__esModule = true;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLines(src, index, noBefore, noAfter) {
  var beforeLines = [];
  var afterLines = [];
  var thisLineStart = void 0,
      line = void 0,
      column = void 0;
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
  for (var _i = index; _i < src.length; _i++) {
    if (src[_i] === '\n') {
      if (line === undefined) {
        line = src.substr(thisLineStart, _i - thisLineStart);
      } else {
        afterLines.push(src.substr(lastCutIndex, _i - lastCutIndex));
      }
      lastCutIndex = _i;
      if (afterLines.length >= noAfter) {
        break;
      }
    }
  }
  if (line === undefined) {
    line = src.slice(thisLineStart);
  }
  var lineNumber = 1;
  for (var _i2 = index - 1; _i2 >= 0; _i2--) {
    if (src[_i2] === '\n') {
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

exports.default = {
  getBlock: function getBlock(src, index, length, options) {
    var lineInfo = getLines(src, index, 2, 2);
    var lineStart = 0;
    var lineEnd = lineInfo.line.length;
    if (lineInfo.column > 30) {
      lineStart = lineInfo.column - 30;
    }
    if (lineEnd - (lineInfo.column + length) > 30) {
      lineEnd = lineInfo.column + length + 30;
    }

    var info =  lineInfo.line.substring(lineStart, lineInfo.column) +
                ( options.colour ? "" : "[[[") +
                _chalk2.default.red(lineInfo.line.substr(lineInfo.column, length)) +
                ( options.colour ? "" : "]]]") +
                lineInfo.line.substring(lineInfo.column + length, lineEnd);

    return {
      info: info,
      lineNumber: lineInfo.lineNumber
    };
  }
};
