export default function (tokens) {
  const wordList = [];
  for(let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let text = token.text;
    let index = token.index;
    while(true) {
      let nextWord = text.match(/[\w`']+/);
      if (!nextWord) {
        break;
      }
      const word = nextWord[0].replace(/[`']$/, "");
      index += nextWord.index;
      wordList.push({ word: word, index: index });
      index += nextWord[0].length;
      text = text.slice(nextWord.index + nextWord[0].length);
    }
  }
  return wordList;
}