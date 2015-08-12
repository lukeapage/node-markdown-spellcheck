"use strict";

exports.__esModule = true;

exports["default"] = function (src) {
  var maps = [];
  return {
    removeAll: function removeAll(regex) {
      var match;
      while (true) {
        match = src.match(regex);
        if (!match) {
          break;
        }
        var cutTo = match.index + match[0].length;
        var originalIndex = getOriginalIndex(match.index);

        for (var i = maps.length - 1; i >= 0; i--) {
          var map = maps[i];
          if (map.newIndex > match.index) {
            if (map.newIndex < cutTo) {
              maps.splice(i, 1);
            } else {
              map.newIndex -= match[0].length;
            }
          }
        }

        maps.push({ newIndex: cutTo, index: originalIndex });
        src = src.substring(0, match.index) + src.slice(match.index + match[0].length);
      }
      return src;
    },
    getOriginalIndex: function getOriginalIndex(newIndex) {
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
  };
};

;
module.exports = exports["default"];