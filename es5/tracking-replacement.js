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
      var originalIndex = getOriginalIndex(cutTo);
      var changeInLength = match[0].length - replacement.length;

      if (replacer.log) {
        console.log("before..");
        console.dir(maps);
      }

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

      if (replacer.log) {
        console.log("after adjusting");
        console.dir(maps);
        console.log("original index of", match.index, "is", originalIndex);
        console.log("match length is", match[0].length);
      }

      maps.push({ newIndex: match.index + replacement.length, index: originalIndex });
      if (replacement.length) {
        maps.push({ newIndex: match.index, index: NaN });
      }

      if (replacer.log) {
        console.log("after..");
        console.dir(maps);
      }

      src = src.substring(0, match.index) + replacement + src.slice(match.index + match[0].length);
    }
    return src;
  }
  var replacer = {
    removeAll: function removeAll(regex) {
      return replaceAll(regex, "");
    },
    replaceAll: replaceAll,
    getOriginalIndex: getOriginalIndex
  };
  return replacer;
};

;
module.exports = exports["default"];