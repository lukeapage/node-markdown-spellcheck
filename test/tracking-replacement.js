import { expect } from 'chai';
import trackingReplacement from "../es5/tracking-replacement";

describe("tracking replacement", () => {
  it("tracks a single replace all", () => {
    const replacer = trackingReplacement("s abc e");
    var replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).to.equal("se");
    expect(replacer.getOriginalIndex(0)).to.equal(0);  // s
    expect(replacer.getOriginalIndex(1)).to.equal(6);  // e
  });

  it("tracks a single replace all - 2 chars", () => {
    const replacer = trackingReplacement("sa abc ea");
    var replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).to.equal("saea");
    expect(replacer.getOriginalIndex(0)).to.equal(0);
    expect(replacer.getOriginalIndex(1)).to.equal(1);
    expect(replacer.getOriginalIndex(2)).to.equal(7);
    expect(replacer.getOriginalIndex(3)).to.equal(8);
  });

  it("tracks a single replace all with multiple replacements", () => {
    const replacer = trackingReplacement("s abc e abc d");
    var replaced = replacer.removeAll(/\sabc\s/);
    expect(replaced).to.equal("sed");
    expect(replacer.getOriginalIndex(0)).to.equal(0);  // s
    expect(replacer.getOriginalIndex(1)).to.equal(6);  // e
    expect(replacer.getOriginalIndex(2)).to.equal(12);  // d
  });

  it("tracks a multi- replace all with multiple replacements", () => {
    const replacer = trackingReplacement("_s_ abc _e_ abc _d_");
    replacer.removeAll(/\sabc\s/);
    var replaced = replacer.removeAll(/_/);
    expect(replaced).to.equal("sed");
    expect(replacer.getOriginalIndex(0)).to.equal(1);  // s
    expect(replacer.getOriginalIndex(1)).to.equal(9);  // e
    expect(replacer.getOriginalIndex(2)).to.equal(17);  // d
  });

  it("tracks a multi- replace all which removes already removed", () => {
    const replacer = trackingReplacement("_b_a_c_");
    replacer.removeAll(/a/);
    var replaced = replacer.removeAll(/_/);
    expect(replaced).to.equal("bc");
    expect(replacer.getOriginalIndex(0)).to.equal(1);
    expect(replacer.getOriginalIndex(1)).to.equal(5);
  });

  it("tracks a multi- replace all which removes already removed entirely", () => {
    const replacer = trackingReplacement("_b_a_c_");
    replacer.removeAll(/a/);
    var replaced = replacer.removeAll(/__/);
    expect(replaced).to.equal("_bc_");
    expect(replacer.getOriginalIndex(0)).to.equal(0);
    expect(replacer.getOriginalIndex(1)).to.equal(1);
    expect(replacer.getOriginalIndex(2)).to.equal(5);
    expect(replacer.getOriginalIndex(3)).to.equal(6);
  });

  it("tracks a single replaceAll with string not regex", () => {
    const frontMatter = "---author:tester---";
    const replacer = trackingReplacement(`${frontMatter} content`);
    const replaced = replacer.removeAll(frontMatter);
    expect(replaced).to.equal(" content");
    expect(replacer.getOriginalIndex(2)).to.equal(21);
    expect(replacer.getOriginalIndex(3)).to.equal(22); 
  });

  it("tracks a single replaceAll when target string contains regex", () => {
    const frontMatter = `
    ---
    author: tester
    summary: "In my last article (on line annotation components for D3 charts)"
    ---`;
    const replacer = trackingReplacement(`${frontMatter} content`);
    const replaced = replacer.removeAll(frontMatter);
    expect(replaced).to.equal(" content");
    expect(replacer.getOriginalIndex(2)).to.equal(117);
  });

});