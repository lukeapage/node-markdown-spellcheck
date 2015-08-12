import { expect } from 'chai';
import spellcheck from "../es5/spellcheck";

describe("spell checker", () => {
  it("should detect bad spelling", () => {
    const badWords = spellcheck([{ word: "notreal", index: 0 }]);

    expect(badWords).to.deep.equal([ { word: 'notreal', index: 0 }]);
  });

  it("should detect good spelling", () => {
    const badWords = spellcheck([{ word: "This", index: 0 }, { word: "sentence", index: 5 }]);

    expect(badWords).to.deep.equal([]);
  });
});