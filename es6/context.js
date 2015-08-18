import chalk from 'chalk';

function getLines(src, index, noBefore, noAfter) {
  const beforeLines = [];
  const afterLines = [];
  let thisLineStart,
    line,
    column;
  let lastCutIndex = index;

  for (let i = index - 1; i >= 0; i--) {
    if (src[i] === '\n') {
      if (thisLineStart === undefined) {
        thisLineStart = i + 1;
        column = index - (i + 1);
      }
      else {
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
  for (let i = index; i < src.length; i++) {
    if (src[i] === '\n') {
      if (line === undefined) {
        line = src.substr(thisLineStart, i - thisLineStart);
      }
      else {
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
  return {
    line,
    beforeLines,
    afterLines,
    column
  };
}

export default {
  getBlock(src, index, length) {
    const lineInfo = getLines(src, index, 2, 2);
    let lineStart = 0;
    let lineEnd = lineInfo.line.length;
    if (lineInfo.column > 30) {
      lineStart = lineInfo.column - 30;
    }
    if ((lineEnd - (lineInfo.column + length)) > 30) {
      lineEnd = lineInfo.column + length + 30;
    }
    let info = lineInfo.line.substring(lineStart, lineInfo.column) +
      chalk.red(lineInfo.line.substr(lineInfo.column, length)) +
      lineInfo.line.substring(lineInfo.column + length, lineEnd);
    return {
      info
    };
  }
};