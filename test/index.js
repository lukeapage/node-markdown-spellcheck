import { expect } from 'chai';
import markdownSpellcheck from "../es5/index";
import path from 'path';

describe("package", () => {
  it("test1", () => {
    const badWords = markdownSpellcheck.spellFile(path.join(__dirname, 'fixture/test.md'));

    expect(badWords).to.deep.equal([ { word: 'Infact', index: 55 }]);
  });
});