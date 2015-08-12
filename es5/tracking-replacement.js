"use strict";

exports.__esModule = true;

exports["default"] = function (src) {
  var maps = [];
  function getOriginalIndex(newIndex) {
    var firstMapBefore;
    for (var i = 0; i < maps.length; i++) {
      var map = maps[i];
      if (map.newIndex <= newIndex) {
        if (!firstMapBefore || firstMapBefore.newIndex < map.newIndex) {
          firstMapBefore = map;
        }
      }
    }
    if (firstMapBefore) {
      return firstMapBefore.index + (newIndex - firstMapBefore.newIndex);
    } else {
      return newIndex;
    }
  }
  function replaceAll(regex, replacement) {
    var match;
    while (true) {
      match = src.match(regex);
      if (!match) {
        break;
      }
      var cutTo = match.index + match[0].length;
      var originalIndex = getOriginalIndex(match.index);
      var changeInLength = match[0].length - replacement.length;

      for (var i = maps.length - 1; i >= 0; i--) {
        var map = maps[i];
        if (map.newIndex >= match.index) {
          if (map.newIndex < cutTo) {
            maps.splice(i, 1);
          } else {
            map.newIndex -= changeInLength;
          }
        }
      }

      maps.push({ newIndex: match.index + replacement.length, index: originalIndex + match[0].length });
      if (replacement.length) {
        maps.push({ newIndex: match.index, index: NaN });
      }
      src = src.substring(0, match.index) + replacement + src.slice(match.index + match[0].length);
    }
    return src;
  }
  return {
    removeAll: function removeAll(regex) {
      return replaceAll(regex, "");
    },
    replaceAll: replaceAll,
    getOriginalIndex: getOriginalIndex
  };
};

;
module.exports = exports["default"];