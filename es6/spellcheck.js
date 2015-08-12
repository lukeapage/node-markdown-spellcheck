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
    var word = words[i];
    if (!spellchecker.check(word.word)) {
      mistakes.push(word);
    }
  }
  return mistakes;
}