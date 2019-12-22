function compare(a, b) {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  }
  return 0;
}

function replaceWord(src, index, oldWord, newWord) {
  return src.slice(0, index) + newWord + src.slice(index + oldWord.length);
}

export function replace(src, corrections) {
  corrections = corrections.sort((a, b) =>
    /* reverse arguments - reverse list */ compare(
      b.wordInfo.index,
      a.wordInfo.index
    )
  );

  for (let i = 0; i < corrections.length; i++) {
    const correction = corrections[i];
    src = replaceWord(
      src,
      correction.wordInfo.index,
      correction.wordInfo.word,
      correction.newWord
    );
  }

  return src;
}
