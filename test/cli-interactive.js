const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const bddStdin = require('bdd-stdin');

function getCliInteractive(spellConfig, spellcheck, writeCorrections, index) {
  return proxyquire('../lib/cli-interactive', {
    './write-corrections': writeCorrections,
    './spell-config': spellConfig,
    './spellcheck': spellcheck,
    './index': index
  });
}

function mockSpellConfig() {
  return {
    addToGlobalDictionary: sinon.stub(),
    addToFileDictionary: sinon.stub(),
    writeFile: sinon.stub().callsArg(0)
  };
}

function mockSpellcheck() {
  return {
    addWord: sinon.stub(),
    checkWord: sinon.stub()
  };
}

function mockWriteCorrections() {
  return sinon.stub().callsArg(3);
}

function mockIndex(mistakes) {
  return {
    spellCallback(ignore, ignore2, perMistake, endOfFile) {
      if (mistakes) {
        const next = () => {
          if (mistakes.length) {
            const wordInfo = { word: mistakes.pop(), index: 0 };
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

async function makeAsyncCLI(cliInteractive, cb, options = {}) {
  await new Promise(fileProcessed => {
    cliInteractive('myfile', '', options, () => {
      cb();
      fileProcessed();
    });
  });
}

describe('cli interactive', () => {
  it('should work with no mistakes', () => {
    const cliInteractive = getCliInteractive(
      mockSpellConfig(),
      mockSpellcheck(),
      mockWriteCorrections(),
      mockIndex()
    );
    const fileProcessed = sinon.spy();
    cliInteractive('myfile', '', {}, fileProcessed);

    expect(fileProcessed.calledOnce).to.equal(true);
  });

  it('should work with a single ignore', async () => {
    const spellcheck = mockSpellcheck();
    const cliInteractive = getCliInteractive(
      mockSpellConfig(),
      spellcheck,
      mockWriteCorrections(),
      mockIndex(['mispelt'])
    );
    const fileProcessed = sinon.spy();

    bddStdin(bddStdin.keys.down, '\n');
    await makeAsyncCLI(cliInteractive, fileProcessed);

    expect(fileProcessed.calledOnce).to.equal(true);
    expect(spellcheck.addWord.calledOnce).to.equal(true);
  });

  it('correct word with 2 words', async () => {
    const spellcheck = mockSpellcheck();
    const writeCorrections = mockWriteCorrections();
    const cliInteractive = getCliInteractive(
      mockSpellConfig(),
      spellcheck,
      writeCorrections,
      mockIndex(['twowords'])
    );
    const fileProcessed = sinon.spy();

    bddStdin('\n', 'two words', '\n');
    spellcheck.checkWord.onCall(0).returns(true);
    spellcheck.checkWord.onCall(1).returns(true);
    await makeAsyncCLI(cliInteractive, fileProcessed);

    expect(spellcheck.checkWord.calledTwice).to.equal(true);

    expect(writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.firstCall.args[2]).to.deep.equal([
      {
        newWord: 'two words',
        wordInfo: {
          index: 0,
          word: 'twowords'
        }
      }
    ]);
    expect(fileProcessed.calledOnce).to.equal(true);
  });

  it('correct word with incorrect word', async () => {
    const spellcheck = mockSpellcheck();
    const writeCorrections = mockWriteCorrections();
    const cliInteractive = getCliInteractive(
      mockSpellConfig(),
      spellcheck,
      writeCorrections,
      mockIndex(['incorect'])
    );
    const fileProcessed = sinon.spy();

    bddStdin('\n', 'incorret', '\n', '\n', 'incorrect', '\n');
    spellcheck.checkWord.onCall(0).returns(false);
    spellcheck.checkWord.onCall(1).returns(true);
    await makeAsyncCLI(cliInteractive, fileProcessed);

    expect(writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.firstCall.args[2]).to.deep.equal([
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
    const spellcheck = mockSpellcheck();
    const writeCorrections = mockWriteCorrections();
    const cliInteractive = getCliInteractive(
      mockSpellConfig(),
      spellcheck,
      writeCorrections,
      mockIndex(['incorect'])
    );
    const fileProcessed = sinon.spy();

    bddStdin('\n', 'ABS', '\n');
    spellcheck.checkWord.onCall(0).returns(false);
    await makeAsyncCLI(cliInteractive, fileProcessed, { ignoreAcronyms: true });

    expect(writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.firstCall.args[2]).to.deep.equal([
      {
        newWord: 'ABS',
        wordInfo: {
          index: 0,
          word: 'incorect'
        }
      }
    ]);
    expect(fileProcessed.calledOnce).to.equal(true);
  });
  // todo more tests
});
