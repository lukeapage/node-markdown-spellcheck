'use strict';

module.exports = {
  testEnvironment: 'node',
  testRegex: './test/.+\\.spec.js$',
  collectCoverage: false,
  collectCoverageFrom: ['lib/**/*.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  coverageReporters: ['text', 'lcovonly']
};
