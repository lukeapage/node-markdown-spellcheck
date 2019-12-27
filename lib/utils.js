const globby = require('globby');

module.exports = {
  getFiles(inputPatterns) {
    return globby(inputPatterns).catch(() => {
      throw new Error(`Error globbing: ${inputPatterns}`);
    });
  }
};
