import fs from 'fs';
import markdownParser from './markdown-parser';
import wordParser from './word-parser';
import spellcheck from './spellcheck';

function spell(src) {
  if (typeof src !== "string") {
    throw new Error("spell takes a string");
  }
  return spellcheck(wordParser(markdownParser(src)));
}

function spellFile(filename) {
  const src = fs.readFileSync(filename, 'utf-8');
  return {
    errors: spell(src),
    src
  };
}

export default { spell, spellFile };