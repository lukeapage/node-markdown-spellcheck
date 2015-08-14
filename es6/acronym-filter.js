export default function filterAcronyms(spellingErrors) {
  return spellingErrors.filter(e => !e.word.match(/[A-Z0-9]{2,}/));
}