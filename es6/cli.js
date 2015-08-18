import program from 'commander';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import context from './context';
import markdownSpellcheck from "./index";
import generateSummary from './summary-generator';
import inquirer from 'inquirer';
import async from'async'
import chalk from 'chalk';
import { replace } from './word-replacer';
import spellConfig from './spell-config';
import filters from './filters';

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  // default cli behaviour will be an interactive walkthrough each error, with suggestions,
  // options to replace etc.
  .option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found (implies -r).')
  .option('-r, --report', 'Outputs a full report which details the unique spelling errors found.')
  .option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
  .option('-a, --ignore-acronyms', 'Ignores acronyms.')
  .option('-x, --no-suggestions', 'Do not suggest words (can be slow)')
  .usage("[options] source-file source-file")
  .parse(process.argv);

const options = {
  ignoreAcronyms: program.ignoreAcronyms,
  ignoreNumbers: program.ignoreNumbers
};

const ACTION_IGNORE = "ignore",
  ACTION_FILE_IGNORE = "fileignore",
  ACTION_ADD = "add",
  ACTION_ADD_CASED = "add-cased",
  ACTION_CORRECT = "enter";

const CHOICE_IGNORE =  { name: "Ignore", value: ACTION_IGNORE},
  CHOICE_FILE_IGNORE = { name: "Add to file ignores", value: ACTION_FILE_IGNORE},
  CHOICE_ADD = { name: "Add to dictionary - case insensitive", value: ACTION_ADD},
  CHOICE_ADD_CASED = { name: "Add to dictionary - case sensitive", value: ACTION_ADD_CASED},
  CHOICE_CORRECT = { name: "Enter correct spelling", value: ACTION_CORRECT};

const previousChoices = Object.create(null);

function incorrectWordChoices(word, message, filename, done) {
  const suggestions =
    program.suggestions ? markdownSpellcheck.spellcheck.suggest(word) : [];

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
        getCorrectWord(word, filename, done);
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

function getCorrectWord(word, filename, done) {
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
      incorrectWordChoices(newWord, "Corrected word is not in dictionary..", filename, (newNewWord) => {
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
      incorrectWordChoices(wordInfo.word, " ", file, (newWord) => {
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

if (!program.args.length) {
  program.outputHelp();
  process.exit();
} else {

  chalk.red("red"); // fix very weird bug - https://github.com/chalk/chalk/issues/80

  const inputPatterns = program.args;
  const allFiles = [];
  async.parallel([spellConfig.initialise.bind(spellConfig, './.spelling'),
    async.each.bind(async, inputPatterns, (inputPattern, inputPatternProcessed)=> {
      glob(inputPattern, (err, files) => {
        allFiles.push.apply(allFiles, files);
        inputPatternProcessed();
      });
    })], () => {
      spellConfig.getGlobalWords()
        .forEach((word) => markdownSpellcheck.spellcheck.addWord(word));
      async.mapSeries(allFiles, function(file, fileProcessed) {
        try {
          console.log("Spelling - " + chalk.bold(file));

          spellConfig.getFileWords(file)
            .forEach((word) => markdownSpellcheck.spellcheck.addWord(word, true));

          if (program.report || program.summary) {
            var spellingInfo = markdownSpellcheck.spellFile(file, options);

            if (program.summary) {
              const summary = generateSummary(spellingInfo.errors);
              console.log(summary);
            } else {
              for (let k = 0; k < spellingInfo.errors.length; k++) {
                const error = spellingInfo.errors[k];

                var displayBlock = context.getBlock(spellingInfo.src, error.index, error.word.length);
                console.log(displayBlock.info);
              }
              console.log();
            }
            fileProcessed(null, spellingInfo.errors);
          } else {
            spellAndFixFile(file, options, () => {
              spellConfig.writeFile(fileProcessed);
            });
          }
        }
        catch(e) {
          console.log("Error in " + file);
          console.error(e);
          console.error(e.stack);
        }
      }, function(err, results) {
        var exitCode = 0;
        if (err) {
          exitCode = 1;
        } else {
          var spellingErrors = results.some(function(e) {
            return e && e.length;
          });
          if (spellingErrors) {
            exitCode = 1;
          }
        }
        process.exitCode = exitCode;
      });
  });
}
