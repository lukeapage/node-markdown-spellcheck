import { expect } from 'chai';
import proxyquire from "proxyquire";
import sinon from "sinon";
import spellcheck from '../es5/spellcheck';
import spellConfig from '../es5/spell-config';

function getMultiFileProcessor(glob, spellConfig, spellcheck) {
  return proxyquire('../es5/multi-file-processor',
    {
      'glob': glob,
      './spell-config': spellConfig,
      './spellcheck': spellcheck
    });
}

function mockGlob(patterns) {
  return function(pattern, cb) {
    if (patterns && patterns[pattern]) {
      return cb(null, patterns[pattern]);
    }
    cb(null, []);
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
    resetTemporaryCustomDictionary: sinon.stub()
  };
}


describe("multi-file-processor", () => {

  it("should work with empty patterns", () => {
    const spellConfig = mockSpellConfig();
    const multiFileProcessor = getMultiFileProcessor(mockGlob(), spellConfig, mockSpellcheck());
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(1);
    const finishedSpy = sinon.spy();

    multiFileProcessor([], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.notCalled).to.equal(true);
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(true);
  });

  //TODO
  xit("should work with multiple patterns", () => {
    const spellConfig = mockSpellConfig();
    const spellcheck = mockSpellcheck();
    const multiFileProcessor = getMultiFileProcessor(mockGlob({"a": ["1", "2"], "b": ["3", "4"]}), spellConfig, spellcheck);
    const fileCallSpy = sinon.stub();
    fileCallSpy.callsArg(1);
    const finishedSpy = sinon.spy();

    multiFileProcessor(["a", "b"], {}, fileCallSpy, finishedSpy);

    expect(fileCallSpy.callCount).to.equal(4);
    expect(finishedSpy.calledOnce).to.equal(true);
    expect(spellConfig.initialise.calledOnce).to.equal(true);
  });
});