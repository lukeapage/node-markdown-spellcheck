import SpellChecker from "hunspell-spellchecker";
import fs from 'fs';
import path from 'path';

let spellchecker, dict;

function initialise() {
  spellchecker = new SpellChecker();
  dict = spellchecker.parse({
    aff: fs.readFileSync(path.join(__dirname, '../data/en_GB.aff')),
    dic: fs.readFileSync(path.join(__dirname, '../data/en_GB.dic'))
  });
  spellchecker.use(dict);
}

function checkWord(word) {
  if (!spellchecker) {
    initialise();
  }
  word = word.replace(/\u2019/, "'");
  return spellchecker.check(word);
}

function checkWords(words) {
  const mistakes = [];
  for (let i = 0; i < words.length; i++) {
    const wordInfo = words[i];
    if (!checkWord(wordInfo.word)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}

function addWord(word) {
  dict.dictionaryTable[word] = [[]];
}

function suggest(word) {
  try {
    return spellchecker.suggest(word);
  } catch(e) {
    // https://github.com/GitbookIO/hunspell-spellchecker/pull/4
    return [];
  }
}

export default {
  initialise,
  checkWords,
  checkWord,
  addWord,
  suggest
};