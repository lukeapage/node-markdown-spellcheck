export default function generateSummary(spellingErrors) {
  return spellingErrors.map((e) => e.word)
    .filter((value, index, self) => self.indexOf(value) === index);
}