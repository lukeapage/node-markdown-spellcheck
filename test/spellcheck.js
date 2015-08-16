import { expect } from 'chai';
import spellcheck from "../es5/spellcheck";

describe("spell checker", () => {
  it("should detect bad spelling", () => {
    const badWords = spellcheck.checkWords([{ word: "notreal", index: 0 }]);

    expect(badWords).to.deep.equal([ { word: 'notreal', index: 0 }]);
  });

  it("should detect good spelling", () => {
    const badWords = spellcheck.checkWords([{ word: "This", index: 0 }, { word: "sentence", index: 5 }]);

    expect(badWords).to.deep.equal([]);
  });

  it("should allow words needing '.'", () => {
    const badWords = spellcheck.checkWords([{ word: "etc", index: 0 }]);

    expect(badWords).to.deep.equal([]);
  });

  it("should allow words dashed", () => {
    const badWords = spellcheck.checkWords([{ word: "real-world", index: 0 }]);

    expect(badWords).to.deep.equal([]);
  });


});