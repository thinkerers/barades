/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * (nombre minimal d'opérations pour transformer str1 en str2)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Créer une matrice de distance
  const matrix: number[][] = [];
  
  // Initialiser la première colonne et ligne
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Remplir la matrice
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Suppression
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  return matrix[len1][len2];
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
