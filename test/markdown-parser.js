import { expect } from 'chai';
import markdownParser from "../es5/markdown-parser";

describe("basic markdown parsing", () => {
  it("should be able to parse text", () => {
    const tokens = markdownParser(`
hey
Paragraph`);

    expect(tokens).to.deep.equal([
      {text: 'hey', index: 1},
      {text: 'Paragraph', index: 5}]);
  });

  it("should be able to parse headings", () => {
    const tokens = markdownParser(`
hey
===
Heading
-------
`);

    expect(tokens).to.deep.equal([
      {text: 'hey', index: 1},
      {text: 'Heading', index: 9}]);
  });

  it("should be able to parse lists", () => {
    const tokens = markdownParser(`
 * List item
text
 - list1
   - list2
`);

    expect(tokens).to.deep.equal([
      {text: 'List', index: 4},
      {text: 'item', index: 9},
      {text: 'text', index: 14},
      {text: 'list1', index: 22},
      {text: 'list2', index: 33}]);
  });

  it("should be able to parse underlined text", () => {
    const tokens = markdownParser(`
_underlined text_
`);

    expect(tokens).to.deep.equal([
      {text: 'underlined', index: 2},
      {text: 'text', index: 13}]);
  });

  it("should be able to parse links", () => {
    const tokens = markdownParser(`
[De Link!](http://link.com/ha)
`);

    expect(tokens).to.deep.equal([
      {text: 'De', index: 2},
      {text: 'Link', index: 5},
      {text: '!', index: 9}]);
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
      {text: 'This', index: 1},
      {text: 'is', index: 6},
      {text: 'a', index: 9},
      {text: 'inline.', index: 17}]);
  });

  it("should be able to ignore jekyll front matter", () => {
    const tokens = markdownParser(`
---
title: Post title
---
Hello
    `);

    expect(tokens).to.deep.equal([
      {text: 'Hello', index: 27}
    ]);
  });

  it("doesn't ignore text between two horizontal rules at the beginning of the content", () => {
    const tokens = markdownParser(`
---
Apple
---
Banana
    `);

    expect(tokens).to.deep.equal([
      {text: 'Apple', index: 5},
      {text: 'Banana', index: 15}
    ]);
  });

  it("doesn't ignore text between two horizontal rules in the middle of the content", () => {
    const tokens = markdownParser(`
Apple
---
Banana
---
Orange
    `);

    expect(tokens).to.deep.equal([
      {text: 'Apple', index: 1},
      {text: 'Banana', index: 11},
      {text: 'Orange', index: 22}
    ]);
  });

  it("doesn't ignore text between jekyll front matter and a horizontal rule in the content", () => {
    const tokens = markdownParser(`
---
author: test
---
This should be spell checked
---
`);
    expect(tokens).to.deep.equal([ 
      { text: 'This', index: 22 },
      { text: 'should', index: 27 },
      { text: 'be', index: 34 },
      { text: 'spell', index: 37 },
      { text: 'checked', index: 43 }]);
  });

  it("should be able to cope with double back-tick", () => {
    const tokens = markdownParser(`
This is a \`\`var\` with backtick\`\` inline.
`);

    expect(tokens).to.deep.equal([
      {text: 'This', index: 1},
      {text: 'is', index: 6},
      {text: 'a', index: 9},
      {text: 'inline.', index: 34}]);
  });

  it("should be able to ignore html tags", () => {
    const tokens = markdownParser(`
<h1>H1.</h1>
<p>p<em>inner</em></p>
`);

    expect(tokens).to.deep.equal([
      {text: 'H1.', index: 5},
      {text: 'p', index: 17},
      {text: 'inner', index: 22}]);
  });

  it("doesn't confuse repeating words", () => {
    const tokens = markdownParser("code code");

    expect(tokens).to.deep.equal([
      {text: 'code', index: 0},
      {text: 'code', index: 5}]);
  });

  it("copes with html entities", () => {
    const tokens = markdownParser("&quot;code&quot;");

    expect(tokens).to.deep.equal([
      {text: 'code', index: 6}]);
  });

  it("copes with html entities with the same code as later text", () => {
    const tokens = markdownParser("&quot;quot");

    expect(tokens).to.deep.equal([
      {text: 'quot', index: 6}]);
  });

  it("copes with quotes followed by text matching the entity name", () => {
    const tokens = markdownParser("\"quot");

    expect(tokens).to.deep.equal([
      {text: 'quot', index: 1}]);
  });

  it("copes with quote marks", () => {
    const tokens = markdownParser('"code"');

    expect(tokens).to.deep.equal([
      {text: 'code', index: 1}]);
  });

  it("doesn't confuse tags", () => {
    const tokens = markdownParser("<code>code</code>code");

    expect(tokens).to.deep.equal([
      {text: 'code', index: 6},
      {text: 'code', index: 17}]);
  });

  it("doesn't confuse codeblocks", () => {
    const tokens = markdownParser(`
\`\`\`
code
\`\`\`
code
    `);

    expect(tokens).to.deep.equal([
      {text: 'code', index: 14}]);
  });

  it("doesn't confuse inline code", () => {
    const tokens = markdownParser("`code` code");

    expect(tokens).to.deep.equal([
      {text: 'code', index: 7}]);
  });

  it("doesn't confuse tags", () => {
    const tokens = markdownParser("<code>code</code>code");

    expect(tokens).to.deep.equal([
      {text: 'code', index: 6},
      {text: 'code', index: 17}]);
  });

  it("handles code blocks that are spaced", () => {
    const tokens = markdownParser(`
    $('#upload-form').transloadit({
    `);

    expect(tokens).to.deep.equal([]);
  });
});
