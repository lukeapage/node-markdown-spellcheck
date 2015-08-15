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

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  // default cli behaviour will be an interactive walkthrough each error, with suggestions,
  // options to replace etc.
  .option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.')
  .option('-r, --report', 'Outputs a full report which details the unique spelling errors found.')
//  .option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
  .option('-a, --ignore-acronyms', 'Ignores acronyms.')
  .usage("[options] source-file source-file");

function spellAndFixFile(file, options, onFinishedFile) {
  let src = fs.readFileSync(file, 'utf-8');

  function onSpellingMistake(wordInfo, done) {
    var displayBlock = context.getBlock(src, wordInfo.index, wordInfo.word.length);
    console.log(displayBlock.info);
    const suggestions = markdownSpellcheck.suggest(wordInfo);
    if (suggestions) {
      suggestions.forEach((suggestion, index) => console.log(index + ": " + suggestion));
    }
    inquirer.prompt([{
      type: "expand",
      name: "action",
      message: "message",
      choices: [
        { key: "i", name: "Ignore", value: "ignore"},
        { key: "f", name: "Add to file ignores", value: "fileignore"},
        { key: "a", name: "Add to dictionary", value: "add"},
        { key: "s", name: "Use suggestion", value:"suggestion"},
        { key: "e", name: "Enter correct spelling", value:"enter"}
        ]/*{
        "i": "Ignore",
        "f": "Add to file ignores",
        "a": "Add to dictionary",
        "s": "use suggestion",
        "e": "Enter correct spelling"
      }*/,
      //default: "e"
    }], function (answer) {
      console.log(answer);
      done();
    });
  }

  markdownSpellcheck.spellCallback(src, options, onSpellingMistake, () => onFinishedFile() );
}


program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
  process.exit();
} else {

  const options = {
    ignoreAcronyms: program.ignoreAcronyms
  };

  const inputPatterns = program.args;
  const allFiles = [];
  async.each(inputPatterns, (inputPattern, inputPatternProcessed)=> {
    glob(inputPattern, (err, files) => {
      allFiles.push.apply(allFiles, files);
      inputPatternProcessed();
    });
  }, function() {
    async.eachSeries(allFiles, function(file, fileProcessed) {
        try {
          console.log("Spelling - " + chalk.bold(file));

          if (program.report) {
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
            fileProcessed();
          } else {
            spellAndFixFile(file, options, fileProcessed);
          }
        }
        catch(e) {
          console.log("Error in " + files[j]);
          console.error(e);
          console.error(e.stack);
        }
      });
  });
}