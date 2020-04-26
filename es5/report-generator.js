'use strict';

exports.__esModule = true;
exports.generateSummaryReport = generateSummaryReport;
exports.generateFileReport = generateFileReport;

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

// Generates a report for the errors found in a single markdown file.
function generateFileReport(file, spellingInfo, options) {
  var report = '    ' + _chalk2.default.bold(file) + '\n';

  for (var k = 0; k < spellingInfo.errors.length; k++) {
    var error = spellingInfo.errors[k];
    var displayBlock = _context2.default.getBlock(spellingInfo.src, error.index, error.word.length, options);

    var lineNumber = String(displayBlock.lineNumber);
    var lineNumberPadding = Array(10 - lineNumber.length).join(' ');
    var linePrefix = '' + lineNumberPadding + lineNumber + ' |';
    report += linePrefix + ' ' + displayBlock.info + ' \n';
  }
  return report;
}
