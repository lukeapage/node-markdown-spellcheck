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

      if (!nextWord[0].match(/^[0-9,\.]+$/)) {
        let word = nextWord[0];
        const isQuoted = word.match(/^'.*'$/);
        let thisWordIndex = index + nextWord.index;

        if (isQuoted) {
          thisWordIndex += 1;
          word = word.substr(1, word.length - 2);
        }
        if (word.match(/'$/)) {
          word = word.substr(0, word.length - 1);
        }
        wordList.push({word: word, index: thisWordIndex});
      }
      index += nextWord.index + nextWord[0].length;
      text = text.slice(nextWord.index + nextWord[0].length);
    }
  }
  return wordList;
}