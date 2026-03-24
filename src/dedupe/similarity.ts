/**
 * Simple n-gram based text similarity using Jaccard index.
 * No external dependencies — fast and deterministic.
 */

/**
 * Generate character n-grams from text
 */
function ngrams(text: string, n: number = 3): Set<string> {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const grams = new Set<string>();
  for (let i = 0; i <= cleaned.length - n; i++) {
    grams.add(cleaned.slice(i, i + n));
  }
  return grams;
}

/**
 * Calculate Jaccard similarity between two texts (0-1)
 */
export function jaccardSimilarity(textA: string, textB: string, n: number = 3): number {
  const gramsA = ngrams(textA, n);
  const gramsB = ngrams(textB, n);

  if (gramsA.size === 0 && gramsB.size === 0) return 1;
  if (gramsA.size === 0 || gramsB.size === 0) return 0;

  let intersection = 0;
  for (const gram of gramsA) {
    if (gramsB.has(gram)) intersection++;
  }

  const union = gramsA.size + gramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Check if two hooks are too similar
 */
export function hookSimilarity(hookA: string, hookB: string): number {
  // For short texts, use exact prefix matching as additional signal
  const prefixLen = Math.min(hookA.length, hookB.length, 20);
  const prefixA = hookA.slice(0, prefixLen).toLowerCase();
  const prefixB = hookB.slice(0, prefixLen).toLowerCase();

  const jaccardScore = jaccardSimilarity(hookA, hookB, 2);
  const prefixMatch = prefixA === prefixB ? 0.3 : 0;

  return Math.min(1, jaccardScore + prefixMatch);
}

/**
 * Check if hashtag sets overlap too much
 */
export function hashtagOverlap(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 && tagsB.length === 0) return 0;
  if (tagsA.length === 0 || tagsB.length === 0) return 0;

  const setA = new Set(tagsA.map(t => t.toLowerCase()));
  const setB = new Set(tagsB.map(t => t.toLowerCase()));

  let intersection = 0;
  for (const tag of setA) {
    if (setB.has(tag)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
