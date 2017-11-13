import globby from 'globby';
import async from 'async';
import path from 'path';
import spellConfig from './spell-config';
import spellcheck from "./spellcheck";
import fs from 'fs';

export default function(inputPatterns, options, fileCallback, resultCallback) {
  let allFiles = [];

  globby(inputPatterns)
    .then((files) => {
      allFiles = files;
      spellCheckFiles();
    })
    .catch(() => {
      console.error("Error globbing:", inputPatterns);
      process.exitCode = 1;
    });

  function spellCheckFiles() {
    async.mapSeries(allFiles, (file, fileProcessed) => {
      const relativeSpellingFile = path.join(path.dirname(file), ".spelling");
      spellConfig.initialise(relativeSpellingFile, () => {
        processFile(file, fileProcessed);
      });
    }, resultCallback);
  }

  function processFile(file, fileProcessed) {
    spellConfig.getGlobalWords().forEach((word) => spellcheck.addWord(word));

    fs.readFile(file, 'utf-8', (err, src) => {
      if (err) {
        console.error("Failed to open file:" + file);
        console.error(err);
        process.exitCode = 1;
        return fileProcessed();
      }

      spellConfig.getFileWords(file).forEach((word) => spellcheck.addWord(word, true));

      fileCallback(file, src, (err, result) => {
        spellcheck.resetTemporaryCustomDictionary();
        fileProcessed(err, result);
      });
    });
  }

}
