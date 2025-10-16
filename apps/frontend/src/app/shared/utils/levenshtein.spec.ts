import { levenshteinDistance, calculateSimilarity, findClosestMatches } from './levenshtein';

describe('Levenshtein Distance', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('test', 'test')).toBe(0);
    });

    it('should return the length for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('should calculate single character difference', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });

    it('should handle insertion', () => {
      expect(levenshteinDistance('cat', 'cats')).toBe(1);
    });

    it('should handle deletion', () => {
      expect(levenshteinDistance('cats', 'cat')).toBe(1);
    });

    it('should handle case sensitivity', () => {
      expect(levenshteinDistance('Test', 'test')).toBe(1);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings (case insensitive)', () => {
      expect(calculateSimilarity('Test', 'test')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(calculateSimilarity('abc', 'xyz')).toBe(0);
    });

    it('should calculate partial similarity', () => {
      const similarity = calculateSimilarity('Dungeons & Dragons', 'Dungeon & Dragons');
      expect(similarity).toBeGreaterThan(0.9);
      expect(similarity).toBeLessThan(1);
    });

    it('should handle empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1);
    });
  });

  describe('findClosestMatches', () => {
    const games = [
      'Dungeons & Dragons 5e',
      'Pathfinder 2e',
      'Call of Cthulhu 7e',
      'Vampire: The Masquerade',
      'Cyberpunk RED'
    ];

    it('should find close matches for typos', () => {
      const matches = findClosestMatches('Dungeon & Dragons 5e', games);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('Dungeons & Dragons 5e');
      expect(matches[0].similarity).toBeGreaterThan(0.9);
    });

    it('should return empty array for exact match (case insensitive)', () => {
      const matches = findClosestMatches('dungeons & dragons 5e', games);
      expect(matches.length).toBe(0);
    });

    it('should return empty array for very different strings', () => {
      const matches = findClosestMatches('Chess', games, 0.6);
      expect(matches.length).toBe(0);
    });

    it('should respect maxSuggestions limit', () => {
      const matches = findClosestMatches('Dung', games, 0.3, 2);
      expect(matches.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for empty input', () => {
      const matches = findClosestMatches('', games);
      expect(matches.length).toBe(0);
    });

    it('should sort by similarity descending', () => {
      const matches = findClosestMatches('Pathfinde', games, 0.5);
      if (matches.length > 1) {
        for (let i = 0; i < matches.length - 1; i++) {
          expect(matches[i].similarity).toBeGreaterThanOrEqual(matches[i + 1].similarity);
        }
      }
    });

    it('should filter by threshold', () => {
      const matches = findClosestMatches('D&D', games, 0.8);
      matches.forEach(match => {
        expect(match.similarity).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should detect "dungeon and dragon" as similar to "Dungeons & Dragons 5e"', () => {
      const games = ['Dungeons & Dragons 5e', 'Pathfinder 2e', 'Call of Cthulhu'];
      const matches = findClosestMatches('dungeon and dragon', games, 0.6);
      console.log('Test "dungeon and dragon":', matches);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('Dungeons & Dragons 5e');
    });

    it('should detect "Dungeon & Dragins" as similar to "Dungeons & Dragons 5e"', () => {
      const games = ['Dungeons & Dragons 5e', 'Pathfinder 2e', 'Call of Cthulhu'];
      const matches = findClosestMatches('Dungeon & Dragins', games, 0.6);
      console.log('Test "Dungeon & Dragins":', matches);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('Dungeons & Dragons 5e');
    });

    it('should detect "pathafinder" as similar to "Pathfinder 2e"', () => {
      const games = ['Dungeons & Dragons 5e', 'Pathfinder 2e', 'Call of Cthulhu'];
      const matches = findClosestMatches('pathafinder', games, 0.6);
      console.log('Test "pathafinder":', matches);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].value).toBe('Pathfinder 2e');
    });
  });
});
