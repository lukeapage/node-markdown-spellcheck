const fs = require('fs');

const spellConfig = require('../lib/spell-config');

describe('spell config', () => {
  beforeEach(() => {
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

  it('should initialise correctly and call done', async () => {
    const promise = await spellConfig.initialise('./.spelling');
    expect(promise).toEqual(true);
  });

  it('should add global words into array', async () => {
    const promise = await spellConfig.initialise('./.spelling');
    expect(promise).toEqual(true);

    spellConfig.addToGlobalDictionary('aaaaa');
    expect(spellConfig.getGlobalWords().length).toEqual(1);
    expect(spellConfig.getGlobalWords()).toEqual(['aaaaa']);
  });

  it('should add global words from relative or shared into array', async () => {
    const promise = await spellConfig.initialise('/relative/.spelling');
    expect(promise).toEqual(true);

    spellConfig.addToGlobalDictionary('aaaaa', false);
    spellConfig.addToGlobalDictionary('bbbbb', true);
    expect(spellConfig.getGlobalWords().length).toEqual(2);
    expect(spellConfig.getGlobalWords()).toEqual(['aaaaa', 'bbbbb']);
  });

  it('should add file words into array', async () => {
    const FILE = '/relative/blog.md';
    const promise = await spellConfig.initialise('./.spelling');
    expect(promise).toEqual(true);

    spellConfig.addToFileDictionary(FILE, 'aaaaa', false);
    expect(spellConfig.getFileWords(FILE).length).toEqual(1);
  });

  it('should add file words from relative or shared into array', async () => {
    const FILE = '/relative/blog.md';
    const promise = await spellConfig.initialise('/relative/.spelling');
    expect(promise).toEqual(true);

    spellConfig.addToFileDictionary(FILE, 'aaaaa', false);
    spellConfig.addToFileDictionary(FILE, 'bbbbb', true);
    expect(spellConfig.getFileWords(FILE).length).toEqual(2);
  });

  it('should call done after writeFile when spelling file is dirty or clean', async () => {
    const promise = await spellConfig.initialise('./.spelling');
    expect(promise).toEqual(true);

    const writeCleanFileDone = jest.fn();
    spellConfig.writeFile(writeCleanFileDone);
    expect(writeCleanFileDone).toBeCalledTimes(1);

    const writeDirtyFileDone = jest.fn();
    spellConfig.addToGlobalDictionary('aaaaa', false);
    spellConfig.writeFile(writeDirtyFileDone);
    expect(writeDirtyFileDone).toBeCalledTimes(1);
  });
});
