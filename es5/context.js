'use strict';

exports.__esModule = true;

require('colors');

function getLines(src, index, noBefore, noAfter) {
  var beforeLines = [],
      afterLines = [];
  var thisLineStart = undefined,
      line = undefined,
      column = undefined,
      lastCutIndex = index;

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
  return {
    line: line,
    beforeLines: beforeLines,
    afterLines: afterLines,
    column: column
  };
}

exports['default'] = {
  getBlock: function getBlock(src, index, length) {
    var lineInfo = getLines(src, index, 2, 2);
    var lineStart = 0,
        lineEnd = lineInfo.line.length;
    if (lineInfo.column > 30) {
      lineStart = lineInfo.column - 30;
    }
    if (lineEnd - (lineInfo.column + length) > 30) {
      lineEnd = lineInfo.column + length + 30;
    }
    var info = lineInfo.line.substring(lineStart, lineInfo.column) + lineInfo.line.substr(lineInfo.column, length).red + lineInfo.line.substring(lineInfo.column + length, lineEnd);
    return {
      info: info
    };
  }
};
module.exports = exports['default'];