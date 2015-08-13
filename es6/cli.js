import program from 'commander';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import context from './context';
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
          var spellingInfo = markdownSpellcheck.spellFile(files[j]);
          for(let k = 0; k < spellingInfo.errors.length; k++) {
            const error = spellingInfo.errors[k];

            var displayBlock = context.getBlock(spellingInfo.src, error.index, error.word.length);
            console.log(displayBlock.info);
          }
        }
        catch(e) {
          console.log("Error in " + files[j])
          console.error(e);
          console.error(e.stack);
        }
      }
    });
  }
}