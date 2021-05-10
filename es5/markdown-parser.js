exports.__esModule = true;

let _marked = require("marked");

let _marked2 = _interopRequireDefault(_marked);

let _jsYaml = require("js-yaml");

let _jsYaml2 = _interopRequireDefault(_jsYaml);

let _trackingReplacement = require("./tracking-replacement");

let _trackingReplacement2 = _interopRequireDefault(_trackingReplacement);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

let _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function (obj) {
        return typeof obj;
      }
    : function (obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };

exports.default = function (src) {
  let textTokens = [];
  let currentIndex = 0;

  let tracker = (0, _trackingReplacement2.default)(src);

  // remove things we won't process so we can use simple next matching word logic
  // to calculate the index

  let jekyllFrontMatter = getJekyllFrontMatter(src);
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

  let options = {
    gfm: true,
    renderer: {
      strong: function strong() {},
      em: function em() {},
      codespan: function codespan() {},
      br: function br() {},
      del: function del() {},
      link: function link() {},
      image: function image() {},
      text: function text(_text) {
        _text = _text.replace(/&#39;/g, "'");
        let roughSplit = _text.split(
          /(https?|ftp):\/\/[^\s/$.?#].[^\s]*|[\s\xa0\r\n]|&[a-z#0-9]+;|[&<>]/
        );
        for (let i = 0; i < roughSplit.length; i++) {
          let split = roughSplit[i];
          if (split) {
            addToken(split);
          }
        }
      }
    }
  };

  function addToken(text) {
    let newIndex = src.indexOf(text, currentIndex);
    if (newIndex === -1) {
      throw new Error(
        "Markdown Parser : Inline Lexer : Could not find index of text - \n" +
          text +
          "\n\n**In**\n\n" +
          src.substring(currentIndex, 30) +
          "\n"
      );
    }
    currentIndex = newIndex + text.length;
    textTokens.push({ text: text, index: tracker.getOriginalIndex(newIndex) });
  }

  let tokens = _marked2.default.lexer(src, options);
  let inlineLexer = new _marked2.default.InlineLexer(tokens.links, options);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.text && token.type !== "code") {
      inlineLexer.output(token.text);
    }
  }

  return textTokens;
};

function getJekyllFrontMatter(src) {
  let matches = src.match(/^\r?\n?---\r?\n([\w\W]+?)\r?\n---\r?\n/);

  if (matches) {
    let fencedContent = matches[1];

    try {
      let parsed = _jsYaml2.default.safeLoad(fencedContent);

      return (typeof parsed === "undefined" ? "undefined" : _typeof(parsed)) ===
        "object"
        ? matches[0]
        : undefined;
    } catch (e) {
      // not valid yaml
    }
  }
}
