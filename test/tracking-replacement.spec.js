const trackingReplacement = require('../lib/tracking-replacement');

describe('tracking replacement', () => {
  it('tracks a single replace all', () => {
    const replacer = trackingReplacement('s abc e');
    const replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).toEqual('se');
    expect(replacer.getOriginalIndex(0)).toEqual(0); // s
    expect(replacer.getOriginalIndex(1)).toEqual(6); // e
  });

  it('tracks a single replace all - 2 chars', () => {
    const replacer = trackingReplacement('sa abc ea');
    const replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).toEqual('saea');
    expect(replacer.getOriginalIndex(0)).toEqual(0);
    expect(replacer.getOriginalIndex(1)).toEqual(1);
    expect(replacer.getOriginalIndex(2)).toEqual(7);
    expect(replacer.getOriginalIndex(3)).toEqual(8);
  });

  it('tracks a single replace all with multiple replacements', () => {
    const replacer = trackingReplacement('s abc e abc d');
    const replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).toEqual('sed');
    expect(replacer.getOriginalIndex(0)).toEqual(0); // s
    expect(replacer.getOriginalIndex(1)).toEqual(6); // e
    expect(replacer.getOriginalIndex(2)).toEqual(12); // d
  });

  it('tracks a multi- replace all with multiple replacements', () => {
    const replacer = trackingReplacement('_s_ abc _e_ abc _d_');
    replacer.removeAll(/\sabc\s/);
    const replaced = replacer.removeAll(/_/);
    expect(replaced).toEqual('sed');
    expect(replacer.getOriginalIndex(0)).toEqual(1); // s
    expect(replacer.getOriginalIndex(1)).toEqual(9); // e
    expect(replacer.getOriginalIndex(2)).toEqual(17); // d
  });

  it('tracks a multi- replace all which removes already removed', () => {
    const replacer = trackingReplacement('_b_a_c_');
    replacer.removeAll(/a/);
    const replaced = replacer.removeAll(/_/);
    expect(replaced).toEqual('bc');
    expect(replacer.getOriginalIndex(0)).toEqual(1);
    expect(replacer.getOriginalIndex(1)).toEqual(5);
  });

  it('tracks a multi- replace all which removes already removed entirely', () => {
    const replacer = trackingReplacement('_b_a_c_');
    replacer.removeAll(/a/);
    const replaced = replacer.removeAll(/__/);
    expect(replaced).toEqual('_bc_');
    expect(replacer.getOriginalIndex(0)).toEqual(0);
    expect(replacer.getOriginalIndex(1)).toEqual(1);
    expect(replacer.getOriginalIndex(2)).toEqual(5);
    expect(replacer.getOriginalIndex(3)).toEqual(6);
  });

  it('tracks a single replaceAll with string not regex', () => {
    const frontMatter = '---author:tester---';
    const replacer = trackingReplacement(`${frontMatter} content`);
    const replaced = replacer.removeAll(frontMatter);
    expect(replaced).toEqual(' content');
    expect(replacer.getOriginalIndex(2)).toEqual(21);
    expect(replacer.getOriginalIndex(3)).toEqual(22);
  });

  it('tracks a single replaceAll when target string contains regex', () => {
    const frontMatter = `
    ---
    author: tester
    summary: "In my last article (on line annotation components for D3 charts)"
    ---`;
    const replacer = trackingReplacement(`${frontMatter} content`);
    const replaced = replacer.removeAll(frontMatter);
    expect(replaced).toEqual(' content');
    expect(replacer.getOriginalIndex(2)).toEqual(117);
  });
});
