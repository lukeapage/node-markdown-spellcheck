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

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var packageConfig = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../package.json'));
var buildVersion = JSON.parse(packageConfig).version;

_commander2['default'].version(buildVersion).usage("[options] source-file source-file");

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
          var spellingInfo = _index2['default'].spellFile(files[j]);
          for (var k = 0; k < spellingInfo.errors.length; k++) {
            var error = spellingInfo.errors[k];

            var displayBlock = _context2['default'].getBlock(spellingInfo.src, error.index, error.word.length);
            console.log(displayBlock.info);
          }
        } catch (e) {
          console.log("Error in " + files[j]);
          console.error(e);
          console.error(e.stack);
        }
      }
    });
  }
}