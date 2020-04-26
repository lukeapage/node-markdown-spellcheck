function filterFactory(regexp) {
  return (errors) =>
    errors.filter((e) => !e.word.match(regexp));
}

const numbers = filterFactory(/^[\w\W]*[0-9,\.\-#]+[\w\W]*$/);
const acronyms = filterFactory(/^[A-Z0-9]{2,}(['\u2018-\u2019]s)?$/);

export default {
  acronyms,
  numbers,
  filter(words, options) {
    const ignoreAcronyms = options && options.ignoreAcronyms;
    const ignoreNumbers = options && options.ignoreNumbers;

    if (ignoreAcronyms) {
      words = acronyms(words);
    }
    if (ignoreNumbers) {
      words = numbers(words);
    }
    return words;
  }
};
