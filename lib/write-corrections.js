const fs = require('fs');
const { replace } = require('./word-replacer');

module.exports = {
  writeCorrections(src, file, corrections, onCorrected) {
    const correctedSrc = replace(src, corrections);
    fs.writeFile(file, correctedSrc, err => {
      if (err) {
        throw new Error(`Failed to write corrections to : ${file}`);
      }
      onCorrected();
    });
  }
};
