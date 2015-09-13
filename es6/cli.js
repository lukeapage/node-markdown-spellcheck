import program from 'commander';
import fs from 'fs';
import path from 'path';
import cliInteractive from './cli-interactive';
import markdownSpellcheck from "./index";
import chalk from 'chalk';
import multiFileProcessor from './multi-file-processor';
import { generateSummaryReport, generateFileReport } from './report-generator';

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  // default cli behaviour will be an interactive walkthrough each error, with suggestions,
  // options to replace etc.
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
}
else {

  const inputPatterns = program.args;
  multiFileProcessor(inputPatterns, options, (filename, src, fileProcessed) => {

    if (program.report) {
      const errors = markdownSpellcheck.spell(src, options);
      if (errors.length > 0) {
        console.log(generateFileReport(filename, { errors: errors, src: src }));
        process.exitCode = 1;
      }
      fileProcessed(null, errors);
    }
    else {
      console.log("Spelling - " + chalk.bold(filename));
      cliInteractive(filename, src, options, fileProcessed);
    }
  }, (e, results) => {
    console.log(generateSummaryReport(results));
  });
}
