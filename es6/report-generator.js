import chalk from 'chalk';
import context from './context';

// Generates a report that summarises the spelling errors found across multiple
// markdown files.
// results is an array containing the errors (as a nested array) for each file.
export function generateSummaryReport(results) {
  const errorCount = results.map(e =>  e && e.length ? e.length : 0)
                            .reduce((p, c) => p + c, 0);

  const filePlural = 'file' + (results.length > 1 ? 's' : '');
  const errorPlural = 'error' + (errorCount > 1 ? 's' : '');
  const areOrIs = results.length > 1 ? 'are' : 'is';

  if (errorCount > 0) {
    return `${chalk.red('>>')} ${errorCount} spelling ${errorPlural} found in ${results.length} ${filePlural}`;
  } else {
    return `${chalk.green('>>')} ${results.length} ${filePlural} ${areOrIs} free from spelling errors`;
  }
}

// Generates a report for the errors found in a single markdown file.
export function generateFileReport(file, spellingInfo) {
  let report = `    ${chalk.bold(file)}\r\n`;

  for (let k = 0; k < spellingInfo.errors.length; k++) {
    const error = spellingInfo.errors[k];
    const displayBlock = context.getBlock(spellingInfo.src, error.index, error.word.length);

    const lineNumber = String(displayBlock.lineNumber);
    const lineNumberPadding = Array(10 - lineNumber.length).join(' ');
    const linePrefix = `${lineNumberPadding}${lineNumber} |`;
    report += `${linePrefix} ${displayBlock.info} \n`;
  }
  return report;
}