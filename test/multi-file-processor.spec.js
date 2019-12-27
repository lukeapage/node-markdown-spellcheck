const fs = require('fs');
const fileProcessor = require('../lib/file-processor');
const spellcheck = require('../lib/spellcheck');
const spellConfig = require('../lib/spell-config');
const utils = require('../lib/utils');

function mockSpellConfig(globalWords, fileWords) {
  jest
    .spyOn(spellConfig, 'getGlobalWords')
    .mockImplementation(() => globalWords || []);
  jest
    .spyOn(spellConfig, 'getFileWords')
    .mockImplementation(() =>
      fileWords && fileWords.length > 0 ? fileWords.shift() : []
    );
}

describe('multi-file processor', () => {
  beforeEach(() => {
    // Spy on spellcheck
    jest.spyOn(spellcheck, 'addWord').mockImplementation(() => jest.fn());
    jest
      .spyOn(spellcheck, 'resetTemporaryCustomDictionary')
      .mockImplementation(() => jest.fn());

    // spellConfig override
    jest.spyOn(spellConfig, 'initialise').mockReturnValue(() => jest.fn());

    // Do not write files to drive
    jest.spyOn(fs, 'writeFile').mockImplementation((name, options, cb) => {
      cb();
    });
    jest.spyOn(fs, 'readFile').mockImplementation((name, options, cb) => {
      cb(null, '');
    });
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should work with empty patterns', async () => {
    jest.spyOn(utils, 'getFiles').mockImplementation(() => Promise.resolve([]));
    mockSpellConfig();

    const fileCallSpy = jest.fn().mockImplementation((file, src, cb) => cb());
    const finishedSpy = jest.fn();

    await fileProcessor.multiFileProcessor([], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy).not.toHaveBeenCalled();
    expect(finishedSpy).toBeCalledTimes(1);
    expect(spellConfig.initialise).toBeCalledTimes(1);
  });

  it('should work with multiple patterns', async () => {
    jest
      .spyOn(utils, 'getFiles')
      .mockImplementation(() => Promise.resolve(['1', '2', '3', '4']));
    mockSpellConfig(
      ['global-word'],
      [['word-1'], ['word-2-a', 'word-2-b'], [], ['word-4']]
    );

    const fileCallSpy = jest.fn().mockImplementation((file, src, cb) => cb());
    const finishedSpy = jest.fn();

    await fileProcessor.multiFileProcessor(
      ['a', 'b'],
      {},
      fileCallSpy,
      finishedSpy
    );

    expect(fileCallSpy).toBeCalledTimes(4);
    expect(fileCallSpy.mock.calls[0][0]).toEqual('1');
    expect(fileCallSpy.mock.calls[1][0]).toEqual('2');
    expect(fileCallSpy.mock.calls[2][0]).toEqual('3');
    expect(fileCallSpy.mock.calls[3][0]).toEqual('4');
    expect(finishedSpy).toBeCalledTimes(1);
    expect(spellConfig.initialise).toBeCalledTimes(1);

    expect(spellcheck.addWord).toBeCalledTimes(5);
    expect(spellcheck.resetTemporaryCustomDictionary).toBeCalledTimes(4);
  });
});
