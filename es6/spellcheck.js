import SpellChecker from "hunspell-spellchecker";
import fs from 'fs';
import path from 'path';

var spellchecker = new SpellChecker();


try {
  var dict = spellchecker.parse({
    aff: fs.readFileSync(path.join(__dirname, '../data/en_GB.aff')),
    dic: fs.readFileSync(path.join(__dirname, '../data/en_GB.dic'))
  });
  spellchecker.use(dict);
}
catch(e) {
  console.log("Error");
  console.log(e);
}

export default function(words) {
  const mistakes = [];
  for(let i = 0; i < words.length; i++) {
    const wordInfo = words[i];
    const word = wordInfo.word.replace(/\u2019/, "'");
    if (!spellchecker.check(word)) {
      mistakes.push(wordInfo);
    }
  }
  return mistakes;
}