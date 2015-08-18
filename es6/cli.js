import program from 'commander';
import fs from 'fs';
import path from 'path';
import cliInteractive from './cli-interactive';
import context from './context';
import markdownSpellcheck from "./index";
import generateSummary from './summary-generator';

import async from'async'
import chalk from 'chalk';
import { replace } from './word-replacer';
import multiFileProcessor from './multi-file-processor';

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
  ignoreNumbers: program.ignoreNumbers,
  suggestions: program.suggestions
};

if (!program.args.length) {
  program.outputHelp();
  process.exit();
} else {

  chalk.red("red"); // fix very weird bug - https://github.com/chalk/chalk/issues/80

  const inputPatterns = program.args;
  const allFiles = [];
  multiFileProcessor(inputPatterns, options, (file, fileProcessed) => {
    console.log("Spelling - " + chalk.bold(file));

    if (program.report || program.summary) {
      var spellingInfo = markdownSpellcheck.spellFile(file, options);

      if (spellingInfo.errors) {
        process.exitCode = 1;
      }

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
      cliInteractive(file, options, fileProcessed);
    }
  });
}
