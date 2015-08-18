import glob from 'glob';
import async from'async';
import spellConfig from './spell-config';
import markdownSpellcheck from "./index";

export default function(inputPatterns, options, fileCallback) {
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
        .forEach((word) => markdownSpellcheck.spellcheck.addWord(word));

      async.mapSeries(allFiles, function(file, fileProcessed) {

        spellConfig.getFileWords(file)
          .forEach((word) => markdownSpellcheck.spellcheck.addWord(word, true));

        fileCallback(file, fileProcessed);
      });
    });
}
