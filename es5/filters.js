"use strict";

exports.__esModule = true;
function filterFactory(regexp) {
  return function (errors) {
    return errors.filter(function (e) {
      return !e.word.match(regexp);
    });
  };
}

exports["default"] = {
  acronyms: filterFactory(/^[A-Z0-9]{2,}(['\u2018-\u2019]s)?$/),
  numbers: filterFactory(/^[0-9,\.\-#]+$/)
};
module.exports = exports["default"];