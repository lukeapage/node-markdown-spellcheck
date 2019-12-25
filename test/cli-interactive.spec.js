const { PassThrough } = require('stream');
const fs = require('fs');

const { expect } = require('chai');
const inquirer = require('inquirer');
const sandbox = require('sinon').createSandbox();
const bddStdin = require('bdd-stdin');

const index = require('../lib');
const spellcheck = require('../lib/spellcheck');
const spellConfig = require('../lib/spell-config');
const writeCorrections = require('../lib/write-corrections');
const cliInteractive = require('../lib/cli-interactive');

function applyMocks(mistakes) {
  // Mock mistakes
  sandbox
    .stub(index, 'spellCallback')
    .callsFake(function(src, file, callback, done) {
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
    sandbox.spy(writeCorrections, 'writeCorrections');

    // Spy on spellcheck
    sandbox.stub(spellcheck, 'addWord');
    sandbox.spy(spellcheck, 'checkWord');

    // Override default config to disable console output, this is not affecting errors
    // You can disable it while modifying tests
    sandbox.stub(inquirer, 'prompt').get(() =>
      inquirer.createPromptModule({
        output: new PassThrough()
      })
    );

    // spellConfig override
    sandbox.stub(spellConfig, 'addToGlobalDictionary');
    sandbox.stub(spellConfig, 'addToFileDictionary');

    // Do not write files to drive
    sandbox.stub(fs, 'writeFile').callsArgWith(2, null);
    sandbox.stub(fs, 'readFile').callsArgWith(2, null, '');
  });

  afterEach(() => {
    writeCorrections.writeCorrections.restore();
    spellcheck.checkWord.restore();
    sandbox.restore();
  });

  it('should work with no mistakes', () => {
    applyMocks();
    const fileProcessed = sandbox.spy();
    cliInteractive('myfile', '', {}, fileProcessed);

    expect(fileProcessed.calledOnce).to.equal(true);
  });

  it('should work with a single ignore', async () => {
    applyMocks(['mispelt']);
    const fileProcessed = sandbox.spy();

    bddStdin(bddStdin.keys.down, '\n');
    await makeAsyncCLI(fileProcessed);

    expect(fileProcessed.calledOnce).to.equal(true);
    expect(spellcheck.addWord.calledOnce).to.equal(true);
  });

  it('correct word with 2 words', async () => {
    applyMocks(['twowords']);

    const fileProcessed = sandbox.spy();

    bddStdin('\n', 'two words', '\n');
    await makeAsyncCLI(fileProcessed);

    expect(spellcheck.checkWord.calledTwice).to.equal(true);

    expect(writeCorrections.writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.writeCorrections.firstCall.args[2]).to.deep.equal([
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
    applyMocks(['incorect']);
    const fileProcessed = sandbox.spy();

    bddStdin('\n', 'incorret', '\n', '\n', 'incorrect', '\n');
    await makeAsyncCLI(fileProcessed);

    expect(writeCorrections.writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.writeCorrections.firstCall.args[2]).to.deep.equal([
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
    applyMocks(['dadadsasd']);
    const fileProcessed = sandbox.spy();

    bddStdin('\n', 'ABS', '\n');
    await makeAsyncCLI(fileProcessed, { ignoreAcronyms: true });

    expect(writeCorrections.writeCorrections.calledOnce).to.equal(true);
    expect(writeCorrections.writeCorrections.firstCall.args[2]).to.deep.equal([
      {
        newWord: 'ABS',
        wordInfo: {
          index: 0,
          word: 'dadadsasd'
        }
      }
    ]);
    expect(fileProcessed.calledOnce).to.equal(true);
  });
  // todo more tests
});
