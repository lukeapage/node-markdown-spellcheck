'use strict';

module.exports = {
  testEnvironment: 'node',
  testRegex: './test/.+\\.spec.js$',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  coverageReporters: ['text-summary', 'lcov']
};
