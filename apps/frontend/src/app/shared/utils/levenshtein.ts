/**
 * Calcule la distance de Levenshtein entre deux chaînes (version optimisée)
 * Source: https://github.com/gustf/js-levenshtein (fastest-levenshtein)
 * 
 * Optimisations:
 * - Utilise un seul vecteur au lieu d'une matrice complète (économie mémoire)
 * - Loop unrolling pour traiter 4 caractères à la fois
 * - Trim des préfixes/suffixes identiques
 * - Swap pour garantir a.length <= b.length
 * 
 * Complexité: O(m×n) temps, O(min(m,n)) espace
 */
export function levenshteinDistance(a: string, b: string): number {
  // Fast path: identical strings
  if (a === b) {
    return 0;
  }

  // Swap to ensure a is the shorter string
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let la = a.length;
  let lb = b.length;

  // Trim common suffix
  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }

  // Trim common prefix
  let offset = 0;
  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  // Early exit for edge cases
  if (la === 0 || lb < 3) {
    return lb;
  }

  let x = 0;
  let y: number;
  let d0: number;
  let d1: number;
  let d2: number;
  let d3: number;
  let dd = 0;
  let dy: number;
  let ay: number;
  let bx0: number;
  let bx1: number;
  let bx2: number;
  let bx3: number;

  // Initialize vector with distances and character codes
  const vector: number[] = [];
  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  const len = vector.length - 1;

  // Process 4 characters at a time (loop unrolling)
  for (; x < lb - 3; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = x += 4;
    
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  // Process remaining characters
  for (; x < lb; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
      d0 = dy;
    }
  }

  return dd;
}

/**
 * Helper function to find minimum distance with character comparison
 */
function _min(d0: number, d1: number, d2: number, bx: number, ay: number): number {
  return d0 < d1 || d2 < d1
    ? d0 > d2
      ? d2 + 1
      : d0 + 1
    : bx === ay
    ? d1
    : d1 + 1;
}

/**
 * Calcule le pourcentage de similarité entre deux chaînes
 * @returns Un nombre entre 0 et 1 (1 = identique)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(
    str1.toLowerCase(),
    str2.toLowerCase()
  );
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1;
  
  return 1 - distance / maxLength;
}

/**
 * Trouve les suggestions les plus proches d'une chaîne donnée
 * @param input La chaîne à comparer
 * @param options Les options disponibles
 * @param threshold Seuil de similarité minimum (0-1)
 * @param maxSuggestions Nombre maximum de suggestions à retourner
 * @returns Liste de suggestions triées par pertinence
 */
export function findClosestMatches(
  input: string,
  options: string[],
  threshold = 0.6,
  maxSuggestions = 3
): Array<{ value: string; similarity: number }> {
  if (!input || input.trim().length === 0) {
    return [];
  }
  
  const suggestions = options
    .map(option => ({
      value: option,
      similarity: calculateSimilarity(input, option)
    }))
    .filter(item => item.similarity >= threshold && item.value.toLowerCase() !== input.toLowerCase())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxSuggestions);
  
  return suggestions;
}
