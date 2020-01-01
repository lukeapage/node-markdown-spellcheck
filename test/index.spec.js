const path = require('path');
const markdownSpellcheck = require('../lib/index');
const spellcheck = require('../lib/spellcheck');

describe('package', () => {
  beforeEach(() => {
    jest.spyOn(spellcheck, 'checkWords');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('test1', async () => {
    const spellingInfo = await markdownSpellcheck.spellFile(
      path.join(__dirname, 'fixture/test.md')
    );

    expect(spellingInfo.errors).toEqual([{ word: 'Infact', index: 55 }]);
    expect(spellcheck.checkWords).toBeCalledTimes(1);
    expect(spellcheck.checkWords.mock.calls[0][0]).toMatchSnapshot();
  });

  it('test2', async () => {
    const spellingInfo = await markdownSpellcheck.spellFile(
      path.join(__dirname, 'fixture/test2.md')
    );

    expect(spellingInfo.errors).toEqual([{ word: 'Infact', index: 55 }]);
    expect(spellcheck.checkWords).toBeCalledTimes(1);
    expect(spellcheck.checkWords.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should detect correctly text from fixtures', async () => {
    const spellingInfo = await markdownSpellcheck.spellFile(
      path.join(__dirname, 'fixture/test-page.md')
    );
    expect(spellingInfo.errors).toEqual([
      { index: 488, word: 'Strikethrough' },
      { index: 1767, word: 'example.com' },
      { index: 1791, word: 'Github' },
      { index: 3196, word: 'Blockquotes' },
      { index: 3514, word: 'blockquote' }
    ]);
    expect(spellcheck.checkWords).toBeCalledTimes(1);
    expect(spellcheck.checkWords.mock.calls[0][0]).toMatchSnapshot();
  });
});
