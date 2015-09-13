import fs from 'fs';
import { replace } from './word-replacer';

export default function writeCorrections(src, file, corrections, onCorrected) {
  const correctedSrc = replace(src, corrections);
  fs.writeFile(file, correctedSrc, (err) => {
    if (err) {
      console.error("Failed to write corrections to :", file);
      process.exitCode = 1;
    }
    onCorrected();
  });
}