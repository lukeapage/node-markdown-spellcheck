import { expect } from 'chai';
import proxyquire from "proxyquire";
import sinon from "sinon";
import async from 'async';

function getRelativeFileProcessor(globby, spellConfig, spellcheck) {
  return proxyquire('../es5/relative-file-processor',
    {
      'globby': globby,
      './spell-config': { default: spellConfig },
      './spellcheck': { default: spellcheck },
      'fs': {
        readFile: sinon.stub().callsArg(2)
      }
    }).default;
}

function mockGlobby(files) {
  return function(patterns) {
    return {
      then: function(cb) {
        cb(files);
        return this;
      },
      catch: function() {
        return this;
      }
    };
  };
}

function mockSpellConfig(globalWords, fileWords) {
  var mockedSpellConfig = {
    initialise: sinon.stub(),
    getGlobalWords: sinon.stub().returns(globalWords || []),
    getFileWords: sinon.stub()
  };

  if (fileWords) {
    fileWords.forEach((fileWord, index) => {
      mockedSpellConfig.getFileWords
        .onCall(index)
        .returns(fileWord);
    });
  } else {
    mockedSpellConfig.getFileWords.returns([]);
  }

  mockedSpellConfig.initialise.callsArg(1);

  return mockedSpellConfig;
}

function mockSpellcheck() {
  return {
    addWord: sinon.stub(),
    resetTemporaryCustomDictionary: sinon.stub(),
    resetDictionary: sinon.stub()
  };
}


describe("relative-file-processor", () => {

  beforeEach(() => {
    sinon.stub(async, "setImmediate").callsArg(0);
    sinon.stub(async, "nextTick").callsArg(0);
  });
  afterEach(() => {
    async.setImmediate.restore();
    async.nextTick.restore();
  });

  it("should work with empty patterns", () => {
    const spellConfig = mockSpellConfig();
    const relativeFileProcessor = getRelativeFileProcessor(mockGlobby([]), spellConfig, mockSpellcheck());
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(1);
    const finishedSpy = sinon.spy();

    relativeFileProcessor([], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.notCalled).to.equal(true);
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(false);
  });

  it("should work with single pattern", () => {
    const spellConfig = mockSpellConfig();
    const relativeFileProcessor = getRelativeFileProcessor(mockGlobby(["1"]), spellConfig, mockSpellcheck());
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(2);
    const finishedSpy = sinon.spy();

    relativeFileProcessor(["1"], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.notCalled).to.equal(false);
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(true);
  });


  it("should work with multiple patterns", () => {

    const spellConfig = mockSpellConfig(["global-word"], [["word-1"], ["word-2-a", "word-2-b"], [], ["word-4"]]);
    const spellcheck = mockSpellcheck();
    const relativeFileProcessor = getRelativeFileProcessor(mockGlobby(["1", "2", "3", "4"]), spellConfig, spellcheck);
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(2);
    const finishedSpy = sinon.spy();

    relativeFileProcessor(["1", "2"], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.callCount).to.equal(4);
    expect(fileCallSpy.getCall(0).args[0]).to.equal("1");
    expect(fileCallSpy.getCall(1).args[0]).to.equal("2");
    expect(fileCallSpy.getCall(2).args[0]).to.equal("3");
    expect(fileCallSpy.getCall(3).args[0]).to.equal("4");
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.called).to.equal(true);

    //1 global word for each file, then 1 word for file 1, 2 words for file 2 and 1 word for file 4.
    expect(spellcheck.addWord.callCount).to.equal(8);
    expect(spellcheck.resetTemporaryCustomDictionary.callCount).to.equal(4);
  });
});