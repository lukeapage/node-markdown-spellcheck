import program from 'commander';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import markdownSpellcheck from "./index";

const packageConfig = fs.readFileSync(path.join(__dirname, '../package.json'));
const buildVersion = JSON.parse(packageConfig).version;

program
  .version(buildVersion)
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
          var spellingErrors = markdownSpellcheck.spellFile(files[j]);
        }
        catch(e) {
          console.log("Error in " + files[j])
          console.error(e);
        }
      }
    });
  }
}