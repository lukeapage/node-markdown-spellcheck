import { expect } from 'chai';
import geneateSummary from "../es5/summary-generator";

describe("Summary generator", () => {
  it("should show unique spelling errors", () => {
    const spellingErrors = [
      { word: 'UIKit', index: 9142 },
      { word: 'RAC3', index: 9161 },
      { word: 'UIKit', index: 9176 },
      { word: 'ViewModel', index: 9282 }];

    const summary = geneateSummary(spellingErrors);

    expect(summary).to.deep.equal(['UIKit', 'RAC3', 'ViewModel']);
  });
});