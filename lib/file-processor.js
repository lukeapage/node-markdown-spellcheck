const path = require('path');
const fs = require('fs');
const spellConfig = require('./spell-config');
const spellcheck = require('./spellcheck');
const utils = require('./utils');

async function processFile(file, fileCallback) {
  try {
    const src = fs.readFileSync(file, 'utf-8');
    spellConfig
      .getFileWords(file)
      .forEach(word => spellcheck.addWord(word, true));

    return await new Promise((resolve, reject) => {
      fileCallback(file, src, (err, result) => {
        spellcheck.resetTemporaryCustomDictionary();
        if (err) reject(err);
        else resolve(result);
      });
    });
  } catch (e) {
    e.message = `Failed to open file: ${file}`;
    throw e;
  }
}

module.exports = {
  async multiFileProcessor(
    inputPatterns,
    options,
    fileCallback,
    resultCallback
  ) {
    const [, allFiles] = await Promise.all([
      spellConfig.initialise('./.spelling'),
      utils.getFiles(inputPatterns)
    ]);

    for (const word of spellConfig.getGlobalWords()) {
      spellcheck.addWord(word);
    }

    const processed = [];
    for (const file of allFiles) {
      processed.push(await processFile(file, fileCallback));
    }

    resultCallback(null, processed);
  },

  async relativeFileProcessor(
    inputPatterns,
    options,
    fileCallback,
    resultCallback
  ) {
    const allFiles = await utils.getFiles(inputPatterns);

    for (const file of allFiles) {
      const relativeSpellingFile = path.join(path.dirname(file), '.spelling');
      await spellConfig.initialise(relativeSpellingFile);

      for (const word of spellConfig.getGlobalWords()) {
        spellcheck.addWord(word);
      }

      await processFile(file, fileCallback);
    }

    resultCallback();
  }
};
