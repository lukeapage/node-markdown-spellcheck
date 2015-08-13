import program from 'commander';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import markdownSpellcheck from "./index";
import generateSummary from './summary-generator';

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
  .option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.')
  .usage("[options] source-file source-file");

program.parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
  process.exit();
} else {
  const inputPatterns = program.args;
  for(let i = 0; i < inputPatterns.length; i++) {
    glob(inputPatterns[i], (err, files) => {
      for(let j = 0; j < files.length; j++) {
        try {
          const spellingErrors = markdownSpellcheck.spellFile(files[j]);
          console.log("Spelling - " + files[j]);
          if (program.summary) {
            const summary = generateSummary(spellingErrors);
            console.log(summary);
          } else {
            console.log(spellingErrors);
          }
        }
        catch(e) {
          console.log("Error in " + files[j])
          console.error(e);
        }
      }
    });
  }
}