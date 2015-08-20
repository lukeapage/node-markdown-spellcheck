import glob from 'glob';
import async from'async';
import spellConfig from './spell-config';
import spellcheck from "./spellcheck";

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

      spellConfig.getGlobalWords()
        .forEach((word) => spellcheck.addWord(word));

      async.mapSeries(allFiles, (file, fileProcessed) => {

        spellConfig.getFileWords(file)
          .forEach((word) => spellcheck.addWord(word, true));

        fileCallback(file, () => {
          spellcheck.resetTemporaryCustomDictionary();
          fileProcessed();
        });
      }, resultCallback);
    });
}
