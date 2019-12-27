const fs = require('fs');
const inquirer = require('inquirer');

const index = require('../lib');
const spellcheck = require('../lib/spellcheck');
const spellConfig = require('../lib/spell-config');
const writeCorrections = require('../lib/write-corrections');
const cliInteractive = require('../lib/cli-interactive');

function applyMocks(mistakes) {
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
}

/**
 * @param {Record<string, any>[]} fills
 */
function mockPrompt(fills = []) {
  jest.spyOn(inquirer, 'prompt').mockImplementation(fields => {
    let mocks = fills.shift() || {};
    let answers = {};

    for (const field of fields) {
      // Uncomment this if you want to see ~console
      // console.log(
      //   `name: ${field.name}\n` +
      //     `response: ${mocks[field.name]}\n` +
      //     (field.choices || [])
      //       .map(choice => `- ${choice.name} (${choice.value})`)
      //       .join('\n')
      // );
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

async function makeAsyncCLI(cb, options = {}) {
  await new Promise(fileProcessed => {
    cliInteractive('myfile', '', options, () => {
      cb();
      fileProcessed();
    });
  });
}

describe('cli interactive', () => {
  beforeEach(() => {
    // Spy on writeCorrections
    jest.spyOn(writeCorrections, 'writeCorrections');

    // Spy on spellcheck
    jest.spyOn(spellcheck, 'addWord').mockReturnValue(() => jest.fn());
    jest.spyOn(spellcheck, 'checkWord');

    // spellConfig override
    jest
      .spyOn(spellConfig, 'addToGlobalDictionary')
      .mockReturnValue(() => jest.fn());
    jest
      .spyOn(spellConfig, 'addToFileDictionary')
      .mockReturnValue(() => jest.fn());

    // Do not write files to drive
    jest.spyOn(fs, 'writeFile').mockImplementation((name, options, cb) => {
      cb();
    });
    jest.spyOn(fs, 'readFile').mockImplementation((name, options, cb) => {
      cb(null, '');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should work with no mistakes', async () => {
    applyMocks();
    mockPrompt();
    const fileProcessed = jest.fn();
    await makeAsyncCLI(fileProcessed);

    expect(fileProcessed).toBeCalledTimes(1);
  });

  it('should work with a single ignore', async () => {
    applyMocks(['mispelt']);
    mockPrompt([{ action: 'ignore' }]);

    const fileProcessed = jest.fn();
    await makeAsyncCLI(fileProcessed);

    expect(fileProcessed).toBeCalledTimes(1);
    expect(spellcheck.checkWord).toBeCalledTimes(0);
    expect(spellcheck.addWord).toBeCalledTimes(1);
  });

  it('correct word with 2 words', async () => {
    applyMocks(['twowords']);
    mockPrompt([{ action: 'enter' }, { word: 'two words' }]);

    const fileProcessed = jest.fn();
    await makeAsyncCLI(fileProcessed);

    expect(spellcheck.checkWord).toBeCalledTimes(2);
    expect(writeCorrections.writeCorrections).toBeCalledTimes(1);
    expect(writeCorrections.writeCorrections.mock.calls[0][2]).toEqual([
      {
        newWord: 'two words',
        wordInfo: {
          index: 0,
          word: 'twowords'
        }
      }
    ]);
    expect(fileProcessed).toBeCalledTimes(1);
  });

  it('correct word with incorrect word', async () => {
    applyMocks(['incorect']);
    const fileProcessed = jest.fn();

    mockPrompt([
      { action: 'enter' },
      { word: 'incorret' },
      { action: 'enter' },
      { word: 'incorrect' }
    ]);
    await makeAsyncCLI(fileProcessed);

    expect(writeCorrections.writeCorrections).toBeCalledTimes(1);
    expect(writeCorrections.writeCorrections.mock.calls[0][2]).toEqual([
      {
        newWord: 'incorrect',
        wordInfo: {
          index: 0,
          word: 'incorect'
        }
      }
    ]);
  });

  it('correct word with filtered word', async () => {
    applyMocks(['incorect']);
    const fileProcessed = jest.fn();

    mockPrompt([{ action: 'enter' }, { word: 'ABS' }]);
    await makeAsyncCLI(fileProcessed, { ignoreAcronyms: true });

    expect(writeCorrections.writeCorrections).toBeCalledTimes(1);
    expect(writeCorrections.writeCorrections.mock.calls[0][2]).toEqual([
      {
        newWord: 'ABS',
        wordInfo: {
          index: 0,
          word: 'incorect'
        }
      }
    ]);
    expect(fileProcessed).toBeCalledTimes(1);
  });
  // todo more tests
});
