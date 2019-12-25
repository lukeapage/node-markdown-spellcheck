const { expect } = require('chai');
const spellcheck = require('../lib/spellcheck');

describe('spell checker', () => {
  it('should detect bad spelling', async () => {
    const badWords = await spellcheck.checkWords([
      { word: 'notreal', index: 0 }
    ]);

    expect(badWords).to.deep.equal([{ word: 'notreal', index: 0 }]);
  });

  it('should detect good spelling', async () => {
    const badWords = await spellcheck.checkWords([
      { word: 'This', index: 0 },
      { word: 'sentence', index: 5 }
    ]);

    expect(badWords).to.deep.equal([]);
  });

  it("should allow words needing '.'", async () => {
    const badWords = await spellcheck.checkWords([{ word: 'etc', index: 0 }]);

    expect(badWords).to.deep.equal([]);
  });

  it('should allow words dashed', async () => {
    const badWords = await spellcheck.checkWords([
      { word: 'real-world', index: 0 }
    ]);

    expect(badWords).to.deep.equal([]);
  });

  it('should allow plural on anything', async () => {
    const badWords = await spellcheck.checkWords([
      { word: "safety's", index: 0 }
    ]);

    expect(badWords).to.deep.equal([]);
  });

  it('should allow plural with utf apos on anything', async () => {
    const badWords = await spellcheck.checkWords([
      { word: 'safety’s', index: 0 }
    ]);

    expect(badWords).to.deep.equal([]);
  });

  it('should utf apos when adding words', async () => {
    spellcheck.addWord('badwordspelling’s');
    const badWords = await spellcheck.checkWords([
      { word: 'badwordspelling’s', index: 0 }
    ]);

    expect(badWords).to.deep.equal([]);
  });
});
