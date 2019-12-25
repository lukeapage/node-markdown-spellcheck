const fs = require('fs');
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();

const spellConfig = require('../lib/spell-config');

describe('spell config', () => {
  beforeEach(() => {
    // Do not write files to drive
    sandbox.stub(fs, 'writeFile').callsArgWith(2, null);
    sandbox.stub(fs, 'readFile').callsArgWith(2, null, '');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialise correctly and call done', async () => {
    const initDone = sandbox.stub();
    await spellConfig.initialise('./.spelling', initDone);
    expect(initDone.calledOnce).to.equal(true);
  });

  it('should add global words into array', async () => {
    const initDone = sandbox.stub();
    await spellConfig.initialise('./.spelling', initDone);
    spellConfig.addToGlobalDictionary('aaaaa');
    expect(spellConfig.getGlobalWords().length).to.equal(1);
    expect(spellConfig.getGlobalWords()[0]).to.equal('aaaaa');
    expect(initDone.calledOnce).to.equal(true);
  });

  it('should add global words from relative or shared into array', async () => {
    const initDone = sandbox.stub();
    await spellConfig.initialise('/relative/.spelling', initDone);
    spellConfig.addToGlobalDictionary('aaaaa', false);
    spellConfig.addToGlobalDictionary('bbbbb', true);
    expect(spellConfig.getGlobalWords().length).to.equal(2);
    expect(spellConfig.getGlobalWords()[1]).to.equal('bbbbb');
    expect(initDone.calledOnce).to.equal(true);
  });

  it('should add file words into array', async () => {
    const FILE = '/relative/blog.md';
    const initDone = sandbox.stub();
    await spellConfig.initialise('./.spelling', initDone);
    spellConfig.addToFileDictionary(FILE, 'aaaaa', false);
    expect(spellConfig.getFileWords(FILE).length).to.equal(1);
    expect(initDone.calledOnce).to.equal(true);
  });

  it('should add file words from relative or shared into array', async () => {
    const FILE = '/relative/blog.md';
    const initDone = sandbox.stub();
    await spellConfig.initialise('/relative/.spelling', initDone);
    spellConfig.addToFileDictionary(FILE, 'aaaaa', false);
    spellConfig.addToFileDictionary(FILE, 'bbbbb', true);
    expect(spellConfig.getFileWords(FILE).length).to.equal(2);
    expect(initDone.calledOnce).to.equal(true);
  });

  it('should call done after writeFile when spelling file is dirty or clean', async () => {
    const initDone = sandbox.stub();
    await spellConfig.initialise('./.spelling', initDone);
    expect(initDone.calledOnce).to.equal(true);

    const writeCleanFileDone = sandbox.stub();
    spellConfig.writeFile(writeCleanFileDone);
    expect(writeCleanFileDone.calledOnce).to.equal(true);

    const writeDirtyFileDone = sandbox.stub();
    spellConfig.addToGlobalDictionary('aaaaa', false);
    spellConfig.writeFile(writeDirtyFileDone);
    expect(writeDirtyFileDone.calledOnce).to.equal(true);
  });
});
