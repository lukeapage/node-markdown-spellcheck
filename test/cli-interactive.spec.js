const fs = require('fs');
const mockUtils = require('./utils/mock');

const spellcheck = require('../lib/spellcheck');
const spellConfig = require('../lib/spell-config');
const writeCorrections = require('../lib/write-corrections');
const cliInteractive = require('../lib/cli-interactive');

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
    mockUtils.mockSpellCallback();
    mockUtils.mockPrompt();
    const fileProcessed = jest.fn();
    await makeAsyncCLI(fileProcessed);

    expect(fileProcessed).toBeCalledTimes(1);
  });

  it('should work with a single ignore', async () => {
    mockUtils.mockSpellCallback(['mispelt']);
    mockUtils.mockPrompt([{ action: 'ignore' }]);

    const fileProcessed = jest.fn();
    await makeAsyncCLI(fileProcessed);

    expect(fileProcessed).toBeCalledTimes(1);
    expect(spellcheck.checkWord).toBeCalledTimes(0);
    expect(spellcheck.addWord).toBeCalledTimes(1);
  });

  it('correct word with 2 words', async () => {
    mockUtils.mockSpellCallback(['twowords']);
    mockUtils.mockPrompt([{ action: 'enter' }, { word: 'two words' }]);

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
    mockUtils.mockSpellCallback(['incorect']);
    mockUtils.mockPrompt([
      { action: 'enter' },
      { word: 'incorret' },
      { action: 'enter' },
      { word: 'incorrect' }
    ]);

    const fileProcessed = jest.fn();
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
    mockUtils.mockSpellCallback(['incorect']);
    mockUtils.mockPrompt([{ action: 'enter' }, { word: 'ABS' }]);

    const fileProcessed = jest.fn();
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
