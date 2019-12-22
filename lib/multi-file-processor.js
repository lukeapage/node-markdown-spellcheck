const globby = require('globby');
const async = require('async');
const spellConfig = require('./spell-config');
const spellcheck = require('./spellcheck');
const fs = require('fs');

module.exports = function(
  inputPatterns,
  options,
  fileCallback,
  resultCallback
) {
  let allFiles = [];

  async.parallel(
    [
      spellConfig.initialise.bind(spellConfig, './.spelling'),
      processed => {
        globby(inputPatterns)
          .then(files => {
            allFiles = files;
            processed();
          })
          .catch(() => {
            console.error('Error globbing:', inputPatterns);
            process.exitCode = 1;
            processed();
          });
      }
    ],
    () => {
      // finished callback - config loaded and glob has returned all files

      spellConfig.getGlobalWords().forEach(word => spellcheck.addWord(word));

      async.mapSeries(
        allFiles,
        (file, fileProcessed) => {
          fs.readFile(file, 'utf-8', (err, src) => {
            if (err) {
              console.error('Failed to open file:' + file);
              console.error(err);
              process.exitCode = 1;
              return fileProcessed();
            }

            spellConfig
              .getFileWords(file)
              .forEach(word => spellcheck.addWord(word, true));

            fileCallback(file, src, (err, result) => {
              spellcheck.resetTemporaryCustomDictionary();
              fileProcessed(err, result);
            });
          });
        },
        resultCallback
      );
    }
  );
};
