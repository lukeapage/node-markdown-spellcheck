import fs from 'fs';
import markdownParser from './markdown-parser';
import wordParser from './word-parser';
import spellcheck from './spellcheck';
import filters from './filters';

function spell(src, options) {
  if (typeof src !== "string") {
    throw new Error("spell takes a string");
  }
  const ignoreAcronyms = options && options.ignoreAcronyms;
  let errors = spellcheck(wordParser(markdownParser(src)));

  if (ignoreAcronyms) {
    errors = filters.acronyms(errors);
  }
  errors = filters.numbers(errors);
  return errors;
}

function spellFile(filename, options) {
  const src = fs.readFileSync(filename, 'utf-8');
  return {
    errors: spell(src, options),
    src
  };
}

export default { spell, spellFile };