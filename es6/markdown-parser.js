import marked from "marked";

export default function(src) {
  const textTokens = [];
  let currentIndex = 0;
  let currentLength = 0;

  const options = {
    gfm: true,
    renderer: {
      strong: function () {
      },
      em: function () {
      },
      codespan: function () {
      },
      br: function () {
      },
      del: function () {
      },
      link: function () {
      },
      image: function () {
      },
      text: function (text) {
        const newIndex = src.indexOf(text, currentIndex);
        if (newIndex === -1 || (newIndex > currentLength + currentIndex)) {
          throw new Error("Could not find index of text");
        }
        currentLength -= (currentIndex - newIndex);
        currentIndex = newIndex;
        textTokens.push({text: text, index: newIndex});
      }
    }
  };

  const tokens = marked.lexer(src, options);
  const inlineLexer = new marked.InlineLexer(tokens.links, options);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.text && token.type !== "code") {
      currentIndex = src.indexOf(token.text, currentIndex);
      currentLength = token.text.length;
      inlineLexer.output(token.text);
    }
  }

  return textTokens;
};