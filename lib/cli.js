const program = require('commander');
const fs = require('fs');
const path = require('path');
const cliInteractive = require('./cli-interactive');
const markdownSpellcheck = require('./index');
const chalk = require('chalk');
const multiFileProcessor = require('./multi-file-processor');
const relativeFileProcessor = require('./relative-file-processor');
const spellcheck = require('./spellcheck');
const {
  generateSummaryReport,
  generateFileReport
} = require('./report-generator');

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  // default cli behaviour will be an interactive walkthrough each error, with suggestions,
  // options to replace etc.
  .option(
    '-r, --report',
    'Outputs a full report which details the unique spelling errors found.'
  )
  .option('-n, --ignore-numbers', 'Ignores numbers.')
  .option('--en-us', 'American English dictionary.')
  .option('--en-gb', 'British English dictionary.')
  .option('--en-au', 'Australian English dictionary.')
  .option('--es-es', 'Spanish dictionary.')
  .option(
    '-d, --dictionary [file]',
    'specify a custom dictionary file - it should not include the file extension and will load .dic and .aiff.'
  )
  .option('-a, --ignore-acronyms', 'Ignores acronyms.')
  .option('-x, --no-suggestions', 'Do not suggest words (can be slow)')
  .option(
    '-t, --target-relative',
    'Uses ".spelling" files relative to the target.'
  )
  .usage('[options] source-file source-file')
  .parse(process.argv);

let language;
if (program.enUs) {
  language = 'en-us';
} else if (program.enGb) {
  language = 'en-gb';
} else if (program.enAu) {
  language = 'en-au';
} else if (program.esEs) {
  language = 'es-es';
}

const options = {
  ignoreAcronyms: program.ignoreAcronyms,
  ignoreNumbers: program.ignoreNumbers,
  suggestions: program.suggestions,
  relativeSpellingFiles: program.targetRelative,
  dictionary: {
    language: language,
    file: program.dictionary
  }
};

if (!program.args.length) {
  program.outputHelp();
} else {
  spellcheck.initialise(options);

  const inputPatterns = program.args;
  const processor = options.relativeSpellingFiles
    ? relativeFileProcessor
    : multiFileProcessor;
  processor(
    inputPatterns,
    options,
    (filename, src, fileProcessed) => {
      if (program.report) {
        const errors = markdownSpellcheck.spell(src, options);
        if (errors.length > 0) {
          console.log(
            generateFileReport(filename, { errors: errors, src: src })
          );
          process.exitCode = 1;
        }
        fileProcessed(null, errors);
      } else {
        console.log('Spelling - ' + chalk.bold(filename));
        cliInteractive(filename, src, options, fileProcessed);
      }
    },
    (e, results) => {
      console.log(generateSummaryReport(results));
    }
  );
}
