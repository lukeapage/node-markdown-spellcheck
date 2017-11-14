import marked from "marked";
import yaml from "js-yaml";
import trackingReplacer from "./tracking-replacement";

export default function(src) {
  const textTokens = [];
  let currentIndex = 0;

  const tracker = trackingReplacer(src);

  // remove things we won't process so we can use simple next matching word logic
  // to calculate the index

  const jekyllFrontMatter = getJekyllFrontMatter(src);
  if (jekyllFrontMatter) {
    tracker.replaceAll(jekyllFrontMatter, " ");
  }

  tracker.removeAll(/```[\w\W]*?```/);
  tracker.removeAll(/~~~[\w\W]*?~~~/);
  tracker.removeAll(/``[\w\W]*?``/);
  tracker.removeAll(/`[^`]*`/);
  tracker.replaceAll(/<style[\w\W]*?<\/style>/, " "); // remove contents of style
  tracker.replaceAll(/<script[\w\W]*?<\/script>/, " "); // remove contents of scripts
  tracker.replaceAll(/\{%\s*highlight[\w\W]*?\{%\s*endhighlight\s*%\}/, " "); // remove contents code blocks
  tracker.replaceAll(/\{%.*%\}/, " ");
  tracker.replaceAll(/\{\{.*\}\}/, " ");
  tracker.replaceAll(/&[#a-z0-9]{1,5};/, " ");
  src = tracker.replaceAll(/<\/?[a-z0-9]+ ?([a-z]+="[^"]*" ?)*\/?>/i, " ");

  const options = {
    gfm: true,
    renderer: {
      strong: function() {
      },
      em: function() {
      },
      codespan: function() {
      },
      br: function() {
      },
      del: function() {
      },
      link: function() {
      },
      image: function() {
      },
      text: function(text) {
        text = text.replace(/&#39;/g, "'");
        const roughSplit = text.split(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*|[\s\xa0\r\n]|&[a-z#0-9]+;|[&<>]/);
        for (let i = 0; i < roughSplit.length; i++) {
          const split = roughSplit[i];
          if (split) {
            addToken(split);
          }
        }
      }
    }
  };

  function addToken(text) {
    const newIndex = src.indexOf(text, currentIndex);
    if (newIndex === -1) {
      throw new Error("Markdown Parser : Inline Lexer : Could not find index of text - \n" + text + "\n\n**In**\n\n" + src.substring(currentIndex, 30) + "\n");
    }
    currentIndex = newIndex + text.length;
    textTokens.push({ text: text, index: tracker.getOriginalIndex(newIndex) });
  }

  const tokens = marked.lexer(src, options);
  const inlineLexer = new marked.InlineLexer(tokens.links, options);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.text && token.type !== "code") {
      inlineLexer.output(token.text);
    }
  }

  return textTokens;
}

function getJekyllFrontMatter(src) {
  const matches = src.match(/^\r?\n?---\r?\n([\w\W]+?)\r?\n---\r?\n/);

  if (matches) {
    const fencedContent = matches[1];

    try {
      const parsed = yaml.safeLoad(fencedContent);

      return typeof parsed === "object" ? matches[0] : undefined;
    }
    catch (e) {
      // not valid yaml
    }
  }
}