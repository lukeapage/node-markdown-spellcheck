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

function checkWords(words) {
  if (!spellchecker) {
    initialise();
  }
  const mistakes = [];
  for (let i = 0; i < words.length; i++) {
    const wordInfo = words[i];
    const word = wordInfo.word.replace(/\u2019/, "'");
    if (!spellchecker.check(word)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}

function addWord() {
  // TODO to add to dictionary
  //dict.dictionaryTable["UIs"] = [[]];
}

function suggest() {
}

export default {
  initialise,
  checkWords,
  addWord,
  suggest
};