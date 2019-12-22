const fs = require('fs');
const markdownParser = require('./markdown-parser');
const wordParser = require('./word-parser');
const spellcheck = require('./spellcheck');
const filters = require('./filters');
const async = require('async');
const {
  generateSummaryReport,
  generateFileReport
} = require('./report-generator');

function getWords(src, options) {
  let words = wordParser(markdownParser(src));

  return filters.filter(words, options);
}

function spell(src, options) {
  if (typeof src !== 'string') {
    throw new Error('spell takes a string');
  }
  const words = getWords(src, options);
  return spellcheck.checkWords(words, options);
}

function spellFile(filename, options) {
  const src = fs.readFileSync(filename, 'utf-8');
  return {
    errors: spell(src, options),
    src
  };
}

function spellCallback(src, options, callback, done) {
  const words = getWords(src, options);

  async.eachSeries(
    words,
    async.ensureAsync(function(wordInfo, onWordProcessed) {
      if (!spellcheck.checkWord(wordInfo.word, options)) {
        callback(wordInfo, onWordProcessed);
      } else {
        onWordProcessed();
      }
    }),
    done
  );
}

module.exports = {
  spell,
  spellFile,
  spellCallback,
  spellcheck,
  generateSummaryReport,
  generateFileReport
};
