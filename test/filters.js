import { expect } from 'chai';
import filters from '../src/filters';

describe('filters', () => {
  it('should remove acronyms', () => {
    const filteredList = filters.acronyms([
      { word: 'AI', index: 0 },
      { word: "AI's", index: 0 },
      { word: 'AIs', index: 0 }, // controversial, not detected
      { word: 'COntains', index: 0 },
      { word: 'contaiNS', index: 0 },
      { word: 'A1', index: 0 }
    ]);

    expect(filteredList).to.deep.equal([
      { word: 'AIs', index: 0 },
      { word: 'COntains', index: 0 },
      { word: 'contaiNS', index: 0 }
    ]);
  });

  it('should remove numbers', () => {
    const filteredList = filters.numbers([
      { word: '1', index: 0 },
      { word: '123', index: 0 },
      { word: '12,34', index: 0 },
      { word: '12,34.00', index: 0 },
      { word: '12.3', index: 0 },
      { word: 'A1', index: 0 },
      { word: '1A', index: 0 }
    ]);

    expect(filteredList).to.deep.equal([
      { word: 'A1', index: 0 },
      { word: '1A', index: 0 }
    ]);
  });
});
