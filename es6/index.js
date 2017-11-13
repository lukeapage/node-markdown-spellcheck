import fs from 'fs';
import markdownParser from './markdown-parser';
import wordParser from './word-parser';
import spellcheck from './spellcheck';
import filters from './filters';
import async from 'async';
import { generateSummaryReport, generateFileReport } from './report-generator';

function getWords(src, options) {
  let words = wordParser(markdownParser(src));

  return filters.filter(words, options);
}

function spell(src, options) {
  if (typeof src !== "string") {
    throw new Error("spell takes a string");
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

  async.eachSeries(words, async.ensureAsync(function(wordInfo, onWordProcessed) {
    if (!spellcheck.checkWord(wordInfo.word, options)) {
      callback(wordInfo, onWordProcessed);
    }
    else {
      onWordProcessed();
    }
  }), done);
}

export default { spell, spellFile, spellCallback, spellcheck, generateSummaryReport, generateFileReport };