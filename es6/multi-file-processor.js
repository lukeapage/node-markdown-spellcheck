import glob from 'glob';
import async from'async';
import spellConfig from './spell-config';
import spellcheck from "./spellcheck";
import fs from 'fs';

export default function(inputPatterns, options, fileCallback, resultCallback) {
  const allFiles = [];
  async.parallel([spellConfig.initialise.bind(spellConfig, './.spelling'),
    async.each.bind(async, inputPatterns, (inputPattern, inputPatternProcessed) => {
      glob(inputPattern, (err, files) => {
        if (err) {
          console.error("Error globbing:", inputPattern);
          process.exitCode = 1;
        }
        else {
          allFiles.push.apply(allFiles, files);
        }
        inputPatternProcessed();
      });
    })], () => {

      // finished callback - config loaded and glob has returned all files

      spellConfig.getGlobalWords()
        .forEach((word) => spellcheck.addWord(word));

      async.mapSeries(allFiles, (file, fileProcessed) => {

        fs.readFile(file, 'utf-8', (err, src) => {

          if (err) {
            console.error("Failed to open file:" + file);
            console.error(err);
            process.exitCode = 1;
            return fileProcessed();
          }

          spellConfig.getFileWords(file)
            .forEach((word) => spellcheck.addWord(word, true));

          fileCallback(file, src, () => {
            spellcheck.resetTemporaryCustomDictionary();
            fileProcessed();
          });
        });
      }, resultCallback);
    });
}
