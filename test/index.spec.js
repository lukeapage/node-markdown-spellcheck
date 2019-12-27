const markdownSpellcheck = require('../lib/index');
const path = require('path');

describe('package', () => {
  it('test1', async () => {
    const spellingInfo = await markdownSpellcheck.spellFile(
      path.join(__dirname, 'fixture/test.md')
    );

    expect(spellingInfo.errors).toEqual([{ word: 'Infact', index: 55 }]);
  });

  it('test2', async () => {
    const spellingInfo = await markdownSpellcheck.spellFile(
      path.join(__dirname, 'fixture/test2.md')
    );

    expect(spellingInfo.errors).toEqual([{ word: 'Infact', index: 55 }]);
  });
});
