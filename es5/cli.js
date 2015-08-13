'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _summaryGenerator = require('./summary-generator');

var _summaryGenerator2 = _interopRequireDefault(_summaryGenerator);

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion).option('-s, --summary', 'Outputs a summary report which details the unique spelling errors found.').usage("[options] source-file source-file");

_commander2['default'].parse(process.argv);

if (!_commander2['default'].args.length) {
  _commander2['default'].outputHelp();
  process.exit();
} else {
  var inputPatterns = _commander2['default'].args;
  for (var i = 0; i < inputPatterns.length; i++) {
    _glob2['default'](inputPatterns[i], function (err, files) {
      for (var j = 0; j < files.length; j++) {
        try {
          var spellingErrors = _index2['default'].spellFile(files[j]);
          console.log("Spelling - " + files[j]);
          if (_commander2['default'].summary) {
            var summary = _summaryGenerator2['default'](spellingErrors);
            console.log(summary);
          } else {
            console.log(spellingErrors);
          }
        } catch (e) {
          console.log("Error in " + files[j]);
          console.error(e);
        }
      }
    });
  }
}