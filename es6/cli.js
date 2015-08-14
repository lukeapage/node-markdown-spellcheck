import program from 'commander';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import context from './context';
import markdownSpellcheck from "./index";
import 'colors';
import generateSummary from './summary-generator';

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  // default cli behaviour will be an interactive walkthrough each error, with suggestions,
  // options to replace etc.
  .option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.')
//  .option('-r, --report', 'Outputs a full report which details the unique spelling errors found.')
//  .option('-n, --ignore-numbers', 'Ignores numbers.')
//  .option('-d, --dictionary', 'Ignores numbers.')
  .option('-a, --ignore-acronyms', 'Ignores acronyms.')
  .usage("[options] source-file source-file");

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
  process.exit();
} else {

  const options = {
    ignoreAcronyms: program.ignoreAcronyms
  };

  const inputPatterns = program.args;
  for(let i = 0; i < inputPatterns.length; i++) {
    glob(inputPatterns[i], (err, files) => {
      for(let j = 0; j < files.length; j++) {
        try {
          const file = files[j];
          console.log("Spelling - " + file.bold);
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

        }
        catch(e) {
          console.log("Error in " + files[j]);
          console.error(e);
          console.error(e.stack);
        }
      }
    });
  }
}