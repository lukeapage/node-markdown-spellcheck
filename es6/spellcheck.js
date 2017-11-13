import SpellChecker from "hunspell-spellchecker";
import fs from 'fs';
import path from 'path';

let spellchecker, dict;

function initialise(options) {

  const dictionaryOptions = options && options.dictionary;

  let baseFile = path.join(__dirname, '../data/en-GB');
  if (dictionaryOptions && dictionaryOptions.file) {
    baseFile = dictionaryOptions.file;
  }
  else if (dictionaryOptions && dictionaryOptions.language) {
    switch (dictionaryOptions.language) {
      case 'en-us':
        baseFile = path.join(__dirname, '../data/en_US-large');
        break;
      case 'en-gb':
        // default - do nothing
        break;
      case 'en-au':
        baseFile = path.join(__dirname, '../data/en_AU');
        break;
      case 'es-es':
        baseFile = path.join(__dirname, '../data/es_ANY');
        break;
      default:
        throw new Error("unsupported language:" + dictionaryOptions.language);
    }
  }

  spellchecker = new SpellChecker();
  dict = spellchecker.parse({
    aff: fs.readFileSync(baseFile + '.aff'),
    dic: fs.readFileSync(baseFile + '.dic')
  });
  spellchecker.use(dict);
}

function normaliseApos(word) {
  return word.replace(/\u2019/, "'");
}

function checkWord(word, options) {
  if (!spellchecker) {
    initialise(options);
  }
  word = normaliseApos(word);
  if (spellchecker.check(word)) {
    return true;
  }

  if (word.match(/'s$/)) {
    const wordWithoutPlural = word.substr(0, word.length - 2);
    if (spellchecker.check(wordWithoutPlural)) {
      return true;
    }
  }

  // for etc. as we cannot tell if it ends in "." as that is stripped
  const wordWithDot = word + ".";
  if (spellchecker.check(wordWithDot)) {
    return true;
  }

  if (word.indexOf('-')) {
    const subWords = word.split('-');

    if (subWords.every((subWord) => spellchecker.check(subWord))) {
      return true;
    }
  }

  return false;
}

function checkWords(words, options) {
  const mistakes = [];
  for (let i = 0; i < words.length; i++) {
    const wordInfo = words[i];
    if (!checkWord(wordInfo.word, options)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}

function _addWord(word) {
  dict.dictionaryTable[word] = [[]];
}

const customDictionary = [];
let needsReset = false;
function addWord(word, temporary) {
  if (!spellchecker) {
    initialise();
  }

  word = normaliseApos(word);

  if (!temporary) {
    customDictionary.push(word);
  }
  else {
    needsReset = true;
  }
  _addWord(word);
}

function resetTemporaryCustomDictionary() {
  if (needsReset) {
    if (!spellchecker) {
      initialise();
    }
    customDictionary.forEach((word) => _addWord(word));
  }
}

function suggest(word) {
  return spellchecker.suggest(word);
}

export default {
  initialise,
  checkWords,
  checkWord,
  addWord,
  resetTemporaryCustomDictionary,
  suggest
};
