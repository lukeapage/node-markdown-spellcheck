const fs = require('fs');
const { replace } = require('./word-replacer');

module.exports = function writeCorrections(
  src,
  file,
  corrections,
  onCorrected
) {
  const correctedSrc = replace(src, corrections);
  fs.writeFile(file, correctedSrc, err => {
    if (err) {
      console.error('Failed to write corrections to :', file);
      process.exitCode = 1;
    }
    onCorrected();
  });
};
