import { expect } from 'chai';
import sinon from "sinon";
import proxyquire from "proxyquire";

function getSpellConfig() {
  return proxyquire('../es5/spell-config', {
    'fs': {
      readFile: sinon.stub().callsArgWith(2, null, ""),
      writeFile: sinon.stub().callsArgWith(2, null)
    }
  }).default;
}

describe("Spell-Config", () => {

  it("should initialise correctly and call done", () => {
    const spellConfig = getSpellConfig();
    const initDone = sinon.stub();
    spellConfig.initialise("./.spelling", initDone);
    expect(initDone.calledOnce).to.equal(true);
  });

  it("should add global words into array", () => {
    const spellConfig = getSpellConfig();
    const initDone = sinon.stub();
    spellConfig.initialise("./.spelling", initDone);
    spellConfig.addToGlobalDictionary("aaaaa");
    expect(spellConfig.getGlobalWords().length).to.equal(1);
    expect(spellConfig.getGlobalWords()[0]).to.equal("aaaaa");
    expect(initDone.calledOnce).to.equal(true);
  });

  it("should add global words from relative or shared into array", () => {
    const spellConfig = getSpellConfig();
    const initDone = sinon.stub();
    spellConfig.initialise("/relative/.spelling", initDone);
    spellConfig.addToGlobalDictionary("aaaaa", false);
    spellConfig.addToGlobalDictionary("bbbbb", true);
    expect(spellConfig.getGlobalWords().length).to.equal(2);
    expect(spellConfig.getGlobalWords()[1]).to.equal("bbbbb");
    expect(initDone.calledOnce).to.equal(true);
  });

  it("should add file words into array", () => {
    const FILE = "/relative/blog.md";
    const initDone = sinon.stub();
    const spellConfig = getSpellConfig();
    spellConfig.initialise("./.spelling", initDone);
    spellConfig.addToFileDictionary(FILE, "aaaaa", false);
    expect(spellConfig.getFileWords(FILE).length).to.equal(1);
    expect(initDone.calledOnce).to.equal(true);
  });

  it("should add file words from relative or shared into array", () => {
    const FILE = "/relative/blog.md";
    const initDone = sinon.stub();
    const spellConfig = getSpellConfig();
    spellConfig.initialise("/relative/.spelling", initDone);
    spellConfig.addToFileDictionary(FILE, "aaaaa", false);
    spellConfig.addToFileDictionary(FILE, "bbbbb", true);
    expect(spellConfig.getFileWords(FILE).length).to.equal(2);
    expect(initDone.calledOnce).to.equal(true);
  });

  it("should call done after writeFile when spelling file is dirty or clean", () => {
    const spellConfig = getSpellConfig();
    const initDone = sinon.stub();
    spellConfig.initialise("./.spelling", initDone);
    expect(initDone.calledOnce).to.equal(true);

    const writeCleanFileDone = sinon.stub();
    spellConfig.writeFile(writeCleanFileDone);
    expect(writeCleanFileDone.calledOnce).to.equal(true);

    const writeDirtyFileDone = sinon.stub();
    spellConfig.addToGlobalDictionary("aaaaa", false);
    spellConfig.writeFile(writeDirtyFileDone);
    expect(writeDirtyFileDone.calledOnce).to.equal(true);
  });

});