import { expect } from 'chai';
import markdownSpellcheck from "../es5/index";
import path from 'path';

describe("package", () => {
  it("test1", () => {
    const spellingInfo = markdownSpellcheck.spellFile(path.join(__dirname, 'fixture/test.md'));

    expect(spellingInfo.errors).to.deep.equal([ { word: 'Infact', index: 55 }]);
  });

  it("test2", () => {
    const spellingInfo = markdownSpellcheck.spellFile(path.join(__dirname, 'fixture/test2.md'));

    expect(spellingInfo.errors).to.deep.equal([ { word: 'Infact', index: 55 }]);
  });
});
