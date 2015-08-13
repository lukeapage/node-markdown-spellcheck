import { expect } from 'chai';
import wordParser from "../es5/word-parser";

describe("word parser", () => {
  it("should be able to find a word", () => {
    const words = wordParser([{ text: "word", index: 0 }]);

    expect(words).to.deep.equal([ { word: 'word', index: 0 }]);
  });

  it("should be able to find multiple words", () => {
    const words = wordParser([{ text: "a word", index: 0 }]);

    expect(words).to.deep.equal([ { word: 'a', index: 0 }, { word: 'word', index: 2 }]);
  });

  it("should ignore punctuation", () => {
    const words = wordParser([{ text: "! yeah. but,far", index: 0 }]);

    expect(words).to.deep.equal([ { word: 'yeah', index: 2 }, { word: 'but', index: 8 }, { word: 'far', index: 12 }]);
  });

  it("should include 's", () => {
    const words = wordParser([{ text: "Luke's James'", index: 0 }]);

    expect(words).to.deep.equal([ { word: "Luke's", index: 0 }, { word: 'James', index: 7 }]);
  });

});