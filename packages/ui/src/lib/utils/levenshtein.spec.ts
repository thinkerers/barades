import {
  calculateSimilarity,
  findClosestMatches,
  levenshteinDistance,
} from './levenshtein';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('test', 'test')).toBe(0);
  });

  it('computes distance for dissimilar strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });

  it('detects a single substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('detects insertion at the end', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
  });

  it('detects deletion at the end', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
  });

  it('is case sensitive before normalization', () => {
    expect(levenshteinDistance('Test', 'test')).toBe(1);
  });
});

describe('calculateSimilarity', () => {
  it('returns 1 for identical strings regardless of case', () => {
    expect(calculateSimilarity('Test', 'test')).toBe(1);
  });

  it('returns a value between 0 and 1 for partial matches', () => {
    const similarity = calculateSimilarity('cat', 'cot');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1);
  });
});

describe('findClosestMatches', () => {
  const games = [
    'Donjons & Dragons 5e',
    'Pathfinder 2e',
    'Call of Cthulhu',
    'Blades in the Dark',
    'Fate Core',
  ];

  it('returns empty array for empty input', () => {
    expect(findClosestMatches('', games)).toEqual([]);
  });

  it('returns suggestions above threshold', () => {
    const matches = findClosestMatches('Dungeon & Dragons 5e', games);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].value).toBe('Donjons & Dragons 5e');
  });

  it('handles case-insensitive matching', () => {
    const matches = findClosestMatches('dungeons & dragons 5e', games);
    expect(matches[0].value).toBe('Donjons & Dragons 5e');
  });

  it('returns empty array if nothing meets the threshold', () => {
    const matches = findClosestMatches('Chess', games, 0.6);
    expect(matches).toEqual([]);
  });

  it('limits the number of suggestions', () => {
    const matches = findClosestMatches('Blad', games, 0.2, 2);
    expect(matches.length).toBeLessThanOrEqual(2);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('returns best match when threshold lowered', () => {
    const matches = findClosestMatches('pathafinder', games, 0.5);
    expect(matches[0].value).toBe('Pathfinder 2e');
  });

  it('filters identical strings', () => {
    const matches = findClosestMatches('Donjons & Dragons 5e', games, 0.6);
    expect(
      matches.find((match) => match.value === 'Donjons & Dragons 5e')
    ).toBeUndefined();
  });
});
