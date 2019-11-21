'use strict';

exports.__esModule = true;
exports.generateSummaryReport = generateSummaryReport;
exports.generateFileReport = generateFileReport;
exports.generateReadinessReport = generateReadinessReport;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generates a report that summarises the spelling errors found across multiple
// markdown files.
// results is an array containing the errors (as a nested array) for each file.
function generateSummaryReport(results) {
  var errorCount = results.map(function (e) {
    return e && e.length ? e.length : 0;
  }).reduce(function (p, c) {
    return p + c;
  }, 0);

  var filePlural = 'file' + (results.length > 1 ? 's' : '');
  var errorPlural = 'error' + (errorCount > 1 ? 's' : '');
  var areOrIs = results.length > 1 ? 'are' : 'is';

  if (errorCount > 0) {
    return _chalk2.default.red('>>') + ' ' + errorCount + ' spelling ' + errorPlural + ' found in ' + results.length + ' ' + filePlural;
  }
  return _chalk2.default.green('>>') + ' ' + results.length + ' ' + filePlural + ' ' + areOrIs + ' free from spelling errors';
}

function generateReadinessReport(readiness,results){
  var stats = new function(){
    this.values = {
      'v0':0,
      'v1':0,
      'v10':0,
      'v50':0,
      'v100':0,
      'Total':0
    };
    this.classify=val=>{
      //console.log(val);
      if (val>100){
        this.values.v100++;
      } else if (val>50){
        this.values.v50++;
      } else if (val>10){
        this.values.v10++;
      } else if (val>1){
        this.values.v1++;
      } else {
        this.values.v0++;
      }
      this.values.Total++;
    };
    this.readiness=()=>{
      var score = (this.values.v1) +
      (this.values.v10*5) +
      (this.values.v50*10) +
      (this.values.v100*15);
      return 100 - (score>this.values.Total?100:score);
    };
    this.toString=()=>{
      return `
        ${this.values.v0} files with 0 errors
        ${this.values.v1} files with at least 1 error
        ${this.values.v10} files with at least 10 errors
        ${this.values.v50} files with at least 50 errors
        ${this.values.v100} files with at least 100 errors

        Readiness indicator: ${this.readiness()}%
      `;
    };
  };
  results.forEach(line=>{
    stats.classify(line.length);
  });
  if (stats.readiness()>=(isNaN(readiness)?100:parseInt(readiness))){
    process.exitCode = 0;
  }
  return stats.toString();
}
// Generates a report for the errors found in a single markdown file.
function generateFileReport(file, spellingInfo) {
  var report = '    ' + _chalk2.default.bold(file) + '\n';

  for (var k = 0; k < spellingInfo.errors.length; k++) {
    var error = spellingInfo.errors[k];
    var displayBlock = _context2.default.getBlock(spellingInfo.src, error.index, error.word.length);

    var lineNumber = String(displayBlock.lineNumber);
    var lineNumberPadding = Array(10 - lineNumber.length).join(' ');
    var linePrefix = '' + lineNumberPadding + lineNumber + ' |';
    report += linePrefix + ' ' + displayBlock.info + ' \n';
  }
  return report;
}