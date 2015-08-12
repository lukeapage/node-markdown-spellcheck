import { expect } from 'chai';
import markdownParser from "../es5/markdown-parser";

describe("basic markdown parsing", () => {
  it("should be able to parse text", () => {
    const tokens = markdownParser(`
hey
Paragraph`);

    expect(tokens).to.deep.equal([ { text: 'hey\nParagraph', index: 1 }]);
  });

  it("should be able to parse headings", () => {
    const tokens = markdownParser(`
hey
===
Heading
-------
`);

    expect(tokens).to.deep.equal([ { text: 'hey', index: 1 },
      { text: 'Heading', index: 9 }]);
  });

  it("should be able to parse lists", () => {
    const tokens = markdownParser(`
 * List item
text
 - list1
   - list2
`);

    expect(tokens).to.deep.equal([
      { text: 'List item', index: 4 },
      { text: 'text', index: 14 },
      { text: 'list1', index: 22 },
      { text: 'list2', index: 33 }]);
  });

  it("should be able to parse underlined text", () => {
    const tokens = markdownParser(`
_underlined text_
`);

    expect(tokens).to.deep.equal([ { text: 'underlined text', index: 2 }]);
  });

  it("should be able to parse links", () => {
    const tokens = markdownParser(`
[De Link!](http://link.com/ha)
`);

    expect(tokens).to.deep.equal([
      { text: 'De Link', index: 2 },
      { text: '!', index: 9 }]);
  });

  it("should be able to ignore code blocks", () => {
    const tokens = markdownParser(`
\`\`\`
var code = 3;
\`\`\`
`);

    expect(tokens).to.deep.equal([]);
  });

  it("should be able to ignore inline code blocks", () => {
    const tokens = markdownParser(`
This is a \`var\` inline.
`);

    expect(tokens).to.deep.equal([
      { text: 'This is a ', index: 1 },
      { text: ' inline.', index: 16 }]);
  });

  it("should be able to ignore html tags", () => {
    const tokens = markdownParser(`
<h1>H1.</h1>
<p>p<em>inner</em></p>
`);

    expect(tokens).to.deep.equal([
      { text: 'H1.', index: 5 },
      { text: 'p', index: 15 },
      { text: 'inner', index: 22 },
      { text: '\n', index: 36 }]);
  });

});