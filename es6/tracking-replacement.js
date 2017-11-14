export default function(src) {
  const maps = [];
  function getOriginalIndex(newIndex) {
    let firstMapBefore;
    for (let i = 0; i < maps.length; i++) {
      let map = maps[i];
      if (map.newIndex <= newIndex) {
        if (!firstMapBefore || firstMapBefore.newIndex < map.newIndex) {
          firstMapBefore = map;
        }
      }
    }
    if (firstMapBefore) {
      return firstMapBefore.index + (newIndex - firstMapBefore.newIndex);
    }
    return newIndex;
  }
  function replaceAll(target, replacement) {
    while (true) { // eslint-disable-line no-constant-condition
      let match;

      if (target instanceof RegExp) {
        match = src.match(target);
      } else {
        match = {
          index: src.indexOf(target),
          0: target
        };
      }

      if (!match || match.index === -1) {
        break;
      }

      const cutTo = match.index + match[0].length;
      const originalIndex = getOriginalIndex(cutTo);
      const changeInLength = match[0].length - replacement.length;

      for (let i = maps.length - 1; i >= 0; i--) {
        const map = maps[i];
        if (map.newIndex >= match.index) {
          if (map.newIndex < cutTo) {
            maps.splice(i, 1);
          }
          else {
            map.newIndex -= changeInLength;
          }
        }
      }

      maps.push({ newIndex: match.index + replacement.length, index: originalIndex });
      if (replacement.length) {
        maps.push({ newIndex: match.index, index: NaN });
      }

      src = src.substring(0, match.index) + replacement + src.slice(match.index + match[0].length);
    }
    return src;
  }

  return {
    removeAll(target) {
      return replaceAll(target, "");
    },
    replaceAll,
    getOriginalIndex
  };
}