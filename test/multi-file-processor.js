const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

function getMultiFileProcessor(globby, spellConfig, spellcheck) {
  return proxyquire('../lib/file-processor', {
    globby: globby,
    './spell-config': spellConfig,
    './spellcheck': spellcheck,
    fs: {
      readFileSync: () => {
        return Promise.resolve();
      },
      readFile: sinon.stub().callsArg(2)
    }
  }).multiFileProcessor;
}

function mockGlobby(files) {
  return function() {
    return Promise.resolve(files);
  }
}

function mockSpellConfig(globalWords, fileWords) {
  const mockedSpellConfig = {
    initialise: sinon.stub(),
    getGlobalWords: sinon.stub().returns(globalWords || []),
    getFileWords: sinon.stub()
  };

  if (fileWords) {
    fileWords.forEach((fileWord, index) => {
      mockedSpellConfig.getFileWords.onCall(index).returns(fileWord);
    });
  } else {
    mockedSpellConfig.getFileWords.returns([]);
  }

  return mockedSpellConfig;
}

function mockSpellcheck() {
  return {
    addWord: sinon.stub(),
    resetTemporaryCustomDictionary: sinon.stub(),
    resetDictionary: sinon.stub()
  };
}

describe('multi-file-processor', () => {
  it('should work with empty patterns', async () => {
    const spellConfig = mockSpellConfig();
    const multiFileProcessor = getMultiFileProcessor(
      mockGlobby([]),
      spellConfig,
      mockSpellcheck()
    );
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(1);
    const finishedSpy = sinon.spy();

    await multiFileProcessor([], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.notCalled).to.equal(true);
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(true);
  });

  it('should work with multiple patterns', async () => {
    const spellConfig = mockSpellConfig(
      ['global-word'],
      [['word-1'], ['word-2-a', 'word-2-b'], [], ['word-4']]
    );
    const spellcheck = mockSpellcheck();
    const multiFileProcessor = getMultiFileProcessor(
      mockGlobby(['1', '2', '3', '4']),
      spellConfig,
      spellcheck
    );
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(2);
    const finishedSpy = sinon.spy();

    await multiFileProcessor(['a', 'b'], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.callCount).to.equal(4);
    expect(fileCallSpy.getCall(0).args[0]).to.equal('1');
    expect(fileCallSpy.getCall(1).args[0]).to.equal('2');
    expect(fileCallSpy.getCall(2).args[0]).to.equal('3');
    expect(fileCallSpy.getCall(3).args[0]).to.equal('4');
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(true);

    expect(spellcheck.addWord.callCount).to.equal(5);
    expect(spellcheck.resetTemporaryCustomDictionary.callCount).to.equal(4);
  });
});
