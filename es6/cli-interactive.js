import markdownSpellcheck from "./index";
import inquirer from 'inquirer';
import filters from './filters';
import context from './context';
import fs from 'fs';
import { replace } from './word-replacer';
import spellConfig from './spell-config';

const ACTION_IGNORE = "ignore";
const ACTION_FILE_IGNORE = "fileignore";
const ACTION_ADD = "add";
const ACTION_ADD_CASED = "add-cased";
const ACTION_CORRECT = "enter";

const CHOICE_IGNORE =  { name: "Ignore", value: ACTION_IGNORE};
const CHOICE_FILE_IGNORE = { name: "Add to file ignores", value: ACTION_FILE_IGNORE};
const CHOICE_ADD = { name: "Add to dictionary - case insensitive", value: ACTION_ADD};
const CHOICE_ADD_CASED = { name: "Add to dictionary - case sensitive", value: ACTION_ADD_CASED};
const CHOICE_CORRECT = { name: "Enter correct spelling", value: ACTION_CORRECT};

const previousChoices = Object.create(null);

function incorrectWordChoices(word, message, filename, options, done) {
  const suggestions =
    options.suggestions ? markdownSpellcheck.spellcheck.suggest(word) : [];

  var choices = [
    CHOICE_IGNORE,
    CHOICE_FILE_IGNORE,
    CHOICE_ADD,
    CHOICE_CORRECT
  ];

  if (word.match(/[A-Z]/)) {
    choices.splice(3, 0, CHOICE_ADD_CASED);
  }

  let defaultAction = ACTION_CORRECT;
  if (previousChoices[word]) {
    var previousAction = previousChoices[word];
    if (previousAction.newWord) {
      const suggestionIndex = suggestions.indexOf(previousAction.newWord);
      if (suggestions.indexOf(previousAction.newWord) >= 0) {
        defaultAction = suggestionIndex.toString();
      } else {
        suggestions.unshift(previousAction.newWord);
        defaultAction = "0";
      }
    } else {
      defaultAction = previousAction.action;
    }
  }

  suggestions.forEach((suggestion, index) => {
    choices.push({
      key: index,
      name: suggestion,
      value: index.toString()
    });
  });

  inquirer.prompt([{
    type: "list",
    name: "action",
    message: message,
    choices,
    default: defaultAction
  }], function (answer) {
    switch(answer.action) {
      case ACTION_ADD:
        word = word.toLowerCase();
      /* fallthrough */
      case ACTION_ADD_CASED:
        markdownSpellcheck.spellcheck.addWord(word);
        spellConfig.addToGlobalDictionary(word);
        done();
        break;
      case ACTION_CORRECT:
        getCorrectWord(word, filename, options, done);
        break;
      case ACTION_FILE_IGNORE:
        markdownSpellcheck.spellcheck.addWord(word, true);
        spellConfig.addToFileDictionary(filename, word);
        previousChoices[word] = answer;
        done();
        break;
      case ACTION_IGNORE:
        markdownSpellcheck.spellcheck.addWord(word);
        done();
        break;
      default:
        previousChoices[word] = {newWord: suggestions[Number(answer.action)]};
        done(suggestions[Number(answer.action)]);
        break;
    }
  });
}

function getCorrectWord(word, filename, options, done) {
  inquirer.prompt([{
    type: "input",
    name: "word",
    message: "correct word >",
    default: word
  }], function(answer) {
    const newWord = answer.word;
    if (filters.filter([answer], options).length > 0 && markdownSpellcheck.spellcheck.checkWord(newWord)) {
      done(newWord);
    } else {
      incorrectWordChoices(newWord, "Corrected word is not in dictionary..", filename, options, (newNewWord) => {
        const finalNewWord = newNewWord || newWord;
        previousChoices[word] = {newWord: finalNewWord};
        done(finalNewWord);
      });
    }
  });
}

function spellAndFixFile(file, options, onFinishedFile) {
  fs.readFile(file, 'utf-8', (err, src) => {
    const corrections = [];

    function onSpellingMistake(wordInfo, done) {
      var displayBlock = context.getBlock(src, wordInfo.index, wordInfo.word.length);
      console.log(displayBlock.info);
      incorrectWordChoices(wordInfo.word, " ", file, options, (newWord) => {
        if (newWord) {
          corrections.push({ wordInfo, newWord });
        }
        done();
      });
    }

    markdownSpellcheck.spellCallback(src, options, onSpellingMistake, () => {
      function onCorrected() {
        markdownSpellcheck.spellcheck.resetTemporaryCustomDictionary();
        onFinishedFile();
      }
      if (corrections.length) {
        const correctedSrc = replace(src, corrections);
        fs.writeFile(file, correctedSrc, (err) => {
          onCorrected();
        });
      } else {
        onCorrected();
      }
    });
  });
}

export default function(file, options, fileProcessed) {
  spellAndFixFile(file, options, () => {
    spellConfig.writeFile(fileProcessed);
  });
};