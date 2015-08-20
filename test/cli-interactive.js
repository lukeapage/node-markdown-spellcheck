import { expect } from 'chai';
import proxyquire from "proxyquire";
import sinon from "sinon";
import async from 'async';

function getCliInteractive(spellConfig, spellcheck, inquirer, writeCorrections, index) {
  return proxyquire('../es5/cli-interactive',
    {
      'inquirer': inquirer,
      './writeCorrections': writeCorrections,
      './spell-config': spellConfig,
      './spellcheck': spellcheck,
      './index': index
    });
}

function mockSpellConfig(globalWords, fileWords) {
  return {
    addToGlobalDictionary: sinon.stub(),
    addToFileDictionary: sinon.stub(),
    writeFile: sinon.stub().callsArg(0)
  };
}

function mockSpellcheck() {
  return {
    addWord: sinon.stub()
  };
}

function mockInquirer() {
  return {
    prompt: sinon.stub(),
    respond(answer) {
      const cb = this.prompt.lastCall.args[1];
      cb(answer);
    }
  };
}

function mockWriteCorrections() {
  return sinon.stub.callsArg(3);
}

function mockIndex(mistakes) {
  return {
    spellCallback(ignore, ignore2, perMistake, endOfFile) {
      if (mistakes) {
        const next = () => {
          if (mistakes.length) {
            const wordInfo = {word: mistakes.pop(), index: 0};
            perMistake(wordInfo, next);
          } else {
            endOfFile();
          }
        };
        next();
      } else {
        endOfFile();
      }
    }
  };
}


describe("cli interactive", () => {

  it("should work with no mistakes", () => {
    const cliInteractive = getCliInteractive(mockSpellConfig(), mockSpellcheck(), mockInquirer(), mockWriteCorrections(), mockIndex());
    const fileProcessed = sinon.spy();
    cliInteractive("myfile", "", {}, fileProcessed);

    expect(fileProcessed.calledOnce).to.equal(true);
  });

  it("should work with a single ignore", () => {
    const inquirer = mockInquirer();
    const cliInteractive = getCliInteractive(mockSpellConfig(), mockSpellcheck(), inquirer, mockWriteCorrections(), mockIndex(["mispelt"]));
    const fileProcessed = sinon.spy();
    cliInteractive("myfile", "", {}, fileProcessed);

    inquirer.respond("ignore");
    // todo test it ignores the word

    expect(fileProcessed.calledOnce).to.equal(true);
  });

  // todo more tests
});