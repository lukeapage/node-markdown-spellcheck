function filterFactory(regexp) {
  return (errors) =>
    errors.filter(e => !e.word.match(regexp));
}

export default {
  acronyms: filterFactory(/^[A-Z0-9]{2,}(['\u2018-\u2019]s)?$/),
  numbers: filterFactory(/^[0-9,\.\-#]+(th|st|nd|rd)?$/)
};