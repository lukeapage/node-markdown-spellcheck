import fs from 'fs';

let fileLines = [];
const globalDictionary = [];
const fileDictionary = {};
let isCrLf = false;
let globalDictionaryIndex = -1;

function parse() {
  let lastNonCommentIndex = -1;
  let inGlobal = true;
  let currentFile;
  fileLines.forEach((line, index) => {
    if (!line || line.indexOf('#') === 0) {
      return;
    }
    let fileMatch = line.match(/^\s*-\s+(.*)/);
    if (fileMatch) {
      if (inGlobal) {
        globalDictionaryIndex = lastNonCommentIndex === -1 ? index : lastNonCommentIndex + 1;
        inGlobal = false;
      }
      else {
        fileDictionary[currentFile].index = lastNonCommentIndex + 1;
      }
      currentFile = fileMatch[1];
      fileDictionary[currentFile] = { words: [] };
    }
    else {
      let word = line.trim();
      if (inGlobal) {
        globalDictionary.push(word);
      }
      else {
        fileDictionary[currentFile].words.push(word);
      }
    }
    lastNonCommentIndex = index;
  });
  // make sure we end on a new-line
  if (fileLines[fileLines.length - 1]) {
    fileLines[fileLines.length] = "";
  }
  if (inGlobal) {
    globalDictionaryIndex = lastNonCommentIndex === -1 ? fileLines.length - 1 : lastNonCommentIndex + 1;
  }
  else {
    fileDictionary[currentFile].index = lastNonCommentIndex;
  }
}

function emptyFile() {
  fileLines = [
    "# markdown-spellcheck spelling configuration file",
    "# Format - lines beginning # are comments",
    "# global dictionary is at the start, file overrides afterwards",
    "# one word per line, to define a file override use ' - filename'",
    "# where filename is relative to this configuration file",
    ""
  ];
  globalDictionaryIndex = fileLines.length - 1;
}

function initialise(filename, done) {
  fs.readFile(filename, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      emptyFile();
      return done();
    }
    if (data.indexOf('\r') >= 0) {
      isCrLf = true;
      data = data.replace(/\r/g, "");
    }
    fileLines = data.split('\n');
    parse();
    return done();
  });
}

function writeFile(done) {
  const data = fileLines.join(isCrLf ? "\r\n" : "\n");
  fs.writeFile('./.spelling', data, (err) => {
    if (err) {
      console.error("Failed to save spelling file");
      console.error(err);
      process.exitCode = 1;
    }
    done();
  });
}

function addToGlobalDictionary(word) {
  globalDictionary.push(word);
  fileLines.splice(globalDictionaryIndex, 0, word);
  globalDictionaryIndex++;
  for (let filename in fileDictionary) {
    if (fileDictionary.hasOwnProperty(filename)) {
      fileDictionary[filename].index++;
    }
  }
}

function addToFileDictionary(filename, word) {
  if (fileDictionary.hasOwnProperty(filename)) {
    let fileDict = fileDictionary[filename];
    fileLines.splice(fileDict.index, 0, word);
    for (let dictionaryFilename in fileDictionary) {
      if (fileDictionary.hasOwnProperty(dictionaryFilename) &&
      fileDictionary[dictionaryFilename].index >= fileDict.index) {
        fileDictionary[dictionaryFilename].index++;
      }
    }
    fileDict.words.push(word);
  }
  else {
    fileLines.splice(fileLines.length - 1, 0, " - " + filename, word);
    fileDictionary[filename] = {
      index: fileLines.length - 1,
      words: [word]
    };
  }
}

function getGlobalWords() {
  return globalDictionary;
}

function getFileWords(filename) {
  if (fileDictionary.hasOwnProperty(filename)) {
    return fileDictionary[filename].words;
  }
  return [];
}

export default {
  initialise,
  writeFile,
  addToGlobalDictionary,
  addToFileDictionary,
  getGlobalWords,
  getFileWords
};
