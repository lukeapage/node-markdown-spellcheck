const { Nodehun } = require('nodehun');
const fs = require('fs');
const path = require('path');

let spellchecker;

function initialise(options) {
  const dictionaryOptions = options && options.dictionary;

  let baseFile = path.join(require.resolve('dictionary-en-gb'), '../index');
  if (dictionaryOptions && dictionaryOptions.file) {
    baseFile = dictionaryOptions.file;
  } else if (dictionaryOptions && dictionaryOptions.language) {
    switch (dictionaryOptions.language) {
      case 'en-us':
        baseFile = path.join(require.resolve('dictionary-en-us'), '../index');
        break;
      case 'en-gb':
        // default - do nothing
        break;
      case 'en-au':
        baseFile = path.join(require.resolve('dictionary-en-au'), '../index');
        break;
      case 'es-es':
        baseFile = path.join(require.resolve('dictionary-es'), '../index');
        break;
      default:
        throw new Error('unsupported language:' + dictionaryOptions.language);
    }
  }

  const affix = fs.readFileSync(baseFile + '.aff');
  const dictionary = fs.readFileSync(baseFile + '.dic');
  spellchecker = new Nodehun(affix, dictionary);
}

function normaliseApos(word) {
  return word.replace(/\u2019/, "'");
}

function checkWord(word, options) {
  if (!spellchecker) {
    initialise(options);
  }
  word = normaliseApos(word);
  if (spellchecker.spellSync(word)) {
    return true;
  }

  if (word.match(/'s$/)) {
    const wordWithoutPlural = word.substr(0, word.length - 2);
    if (spellchecker.spellSync(wordWithoutPlural)) {
      return true;
    }
  }

  // for etc. as we cannot tell if it ends in "." as that is stripped
  const wordWithDot = word + '.';
  if (spellchecker.spellSync(wordWithDot)) {
    return true;
  }

  if (word.indexOf('-')) {
    const subWords = word.split('-');

    if (subWords.every(subWord => spellchecker.spellSync(subWord))) {
      return true;
    }
  }

  return false;
}

function checkWords(words, options) {
  const mistakes = [];
  for (const wordInfo of words) {
    if (!checkWord(wordInfo.word, options)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}

function _addWord(word) {
  spellchecker.add(word);
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
  } else {
    needsReset = true;
  }
  _addWord(word);
}

function resetTemporaryCustomDictionary() {
  if (needsReset) {
    if (!spellchecker) {
      initialise();
    }
    customDictionary.forEach(word => _addWord(word));
  }
}

function suggest(word) {
  return spellchecker.suggestSync(word);
}

module.exports = {
  initialise,
  checkWords,
  checkWord,
  addWord,
  resetTemporaryCustomDictionary,
  suggest
};
