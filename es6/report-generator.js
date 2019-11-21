import chalk from 'chalk';
import context from './context';

// Generates a report that summarises the spelling errors found across multiple
// markdown files.
// results is an array containing the errors (as a nested array) for each file.
export function generateSummaryReport(results) {
  const errorCount = results.map((e) => e && e.length ? e.length : 0)
    .reduce((p, c) => p + c, 0);

  const filePlural = 'file' + (results.length > 1 ? 's' : '');
  const errorPlural = 'error' + (errorCount > 1 ? 's' : '');
  const areOrIs = results.length > 1 ? 'are' : 'is';

  if (errorCount > 0) {
    return `${chalk.red('>>')} ${errorCount} spelling ${errorPlural} found in ${results.length} ${filePlural}`;
  }
  return `${chalk.green('>>')} ${results.length} ${filePlural} ${areOrIs} free from spelling errors`;
}

class Stats {
  constructor() {
    this.values = {
      'v0': 0,
      'v1': 0,
      'v10': 0,
      'v50': 0,
      'v100': 0,
      'Total': 0
    };
    this.classify = (val) => {
      //console.log(val);
      if (val > 100) {
        this.values.v100++;
      }
      else if (val > 50) {
        this.values.v50++;
      }
      else if (val > 10) {
        this.values.v10++;
      }
      else if (val > 1) {
        this.values.v1++;
      }
      else {
        this.values.v0++;
      }
      this.values.Total++;
    };
    this.readiness = () => {
      let score = (this.values.v1) +
        (this.values.v10 * 5) +
        (this.values.v50 * 10) +
        (this.values.v100 * 15);
      return 100 - (score > this.values.Total ? 100 : score);
    };
    this.toString = () => {
      return `
      ${this.values.v0} files with 0 errors
      ${this.values.v1} files with at least 1 error
      ${this.values.v10} files with at least 10 errors
      ${this.values.v50} files with at least 50 errors
      ${this.values.v100} files with at least 100 errors

      Readiness indicator: ${this.readiness()}%
    `;
    };
  }
}

// Generate a readiness report based on weighted values on errors per file
export function generateReadinessReport(readiness, results) {
  let stats = new Stats();
  results.forEach((line) => {
    stats.classify(line.length);
  });
  if (stats.readiness() >= (isNaN(readiness) ? 100 : parseInt(readiness))) {
    process.exitCode = 0;
  }
  return stats.toString();
}


// Generates a report for the errors found in a single markdown file.
export function generateFileReport(file, spellingInfo) {
  let report = `    ${chalk.bold(file)}\n`;

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