const inquirer = require('inquirer');

const index = require('../../lib');

module.exports = {
  /**
   * @param {string[]|undefined} mistakes
   */
  mockSpellCallback(mistakes = undefined) {
    // Mock mistakes
    jest
      .spyOn(index, 'spellCallback')
      .mockImplementation(function(src, file, callback, done) {
        if (mistakes) {
          const next = () => {
            if (mistakes.length) {
              const wordInfo = { word: mistakes.pop(), index: 0 };
              callback(wordInfo, next);
            } else {
              done();
            }
          };
          next();
        } else {
          done();
        }
      });
  },
  /**
   * @param {Record<string, any>[]} fills
   * @param {Boolean} debug
   */
  mockPrompt(fills = [], debug = false) {
    jest.spyOn(inquirer, 'prompt').mockImplementation(fields => {
      let mocks = fills.shift() || {};
      let answers = {};

      for (const field of fields) {
        if (debug) {
          console.log(
            `name: ${field.name}\n` +
              `response: ${mocks[field.name]}\n` +
              (field.choices || [])
                .map(choice => `- ${choice.name} (${choice.value})`)
                .join('\n')
          );
        }
        if (
          field.when === undefined ||
          (field.when &&
            (typeof field.when !== 'function' || field.when(answers)))
        ) {
          if (field.validate && typeof field.validate === 'function') {
            if (field.validate(mocks[field.name]) !== true) {
              throw new Error(`Validation failed for field ${field.name}`);
            }
          }

          if (mocks.hasOwnProperty(field.name)) {
            answers[field.name] = mocks[field.name];
          } else {
            throw new Error(`Missing response for ${field.message}`);
          }
        }
      }

      return Promise.resolve(answers);
    });
  }
};
