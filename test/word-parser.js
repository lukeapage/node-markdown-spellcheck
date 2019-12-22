const { expect } = require('chai');
const wordParser = require('../lib/word-parser');

describe('word parser', () => {
  it('should be able to find a word', () => {
    const words = wordParser([{ text: 'word', index: 0 }]);

    expect(words).to.deep.equal([{ word: 'word', index: 0 }]);
  });

  it('should be able to find a cyrillic word', () => {
    const words = wordParser([{ text: 'монгол', index: 0 }]);

    expect(words).to.deep.equal([{ word: 'монгол', index: 0 }]);
  });

  it('should be able to find multiple words', () => {
    const words = wordParser([{ text: 'a word', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'a', index: 0 },
      { word: 'word', index: 2 }
    ]);
  });

  it('should be able to find multiple words from mixed string with latin & cyrillic', () => {
    const words = wordParser([{ text: 'Mongolia монгол', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'Mongolia', index: 0 },
      { word: 'монгол', index: 9 }
    ]);
  });

  it('should ignore punctuation', () => {
    const words = wordParser([{ text: '! yeah. but,far', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'yeah', index: 2 },
      { word: 'but', index: 8 },
      { word: 'far', index: 12 }
    ]);
  });

  it("should include 's", () => {
    const words = wordParser([{ text: "Luke's James'", index: 0 }]);

    expect(words).to.deep.equal([
      { word: "Luke's", index: 0 },
      { word: 'James', index: 7 }
    ]);
  });

  it('should include #', () => {
    const words = wordParser([{ text: '##3 C#5s', index: 0 }]);

    expect(words).to.deep.equal([
      { word: '3', index: 2 },
      { word: 'C#5s', index: 4 }
    ]);
  });

  it('should not include # at start', () => {
    const words = wordParser([{ text: "$('#word", index: 0 }]);

    expect(words).to.deep.equal([{ word: 'word', index: 4 }]);
  });

  it('should include accented characters', () => {
    const words = wordParser([{ text: '\u00c2lph\u00c2 gr\u00ffb', index: 0 }]);

    expect(words).to.deep.equal([
      { word: '\u00c2lph\u00c2', index: 0 },
      { word: 'gr\u00ffb', index: 6 }
    ]);
  });

  it('should include utf characters', () => {
    const words = wordParser([{ text: 'Ocakbaşı Balıkçısı', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'Ocakbaşı', index: 0 },
      { word: 'Balıkçısı', index: 9 }
    ]);
  });

  it('should include full stops sometimes', () => {
    const words = wordParser([{ text: 'e.t.c. end. Node.JS', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'e.t.c.', index: 0 },
      { word: 'end', index: 7 },
      { word: 'Node.JS', index: 12 }
    ]);
  });

  it('should include dashed in the middle', () => {
    const words = wordParser([{ text: 'full-stop -end', index: 0 }]);

    expect(words).to.deep.equal([
      { word: 'full-stop', index: 0 },
      { word: 'end', index: 11 }
    ]);
  });
});
