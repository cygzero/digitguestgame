import { calculateHits } from './engine';

/**
 * Generates all 10,000 possible 4-digit codes from "0000" to "9999".
 */
export function generateAllCandidates(): string[] {
  const candidates: string[] = [];
  for (let i = 0; i < 10000; i++) {
    candidates.push(i.toString().padStart(4, '0'));
  }
  return candidates;
}

/**
 * Filters the remaining candidate codes based on the feedback of a guess.
 * Only keeps codes that would yield the exact same number of hits when compared to the guess.
 * 
 * @param candidates List of current possible candidate codes
 * @param guess The guess that was submitted
 * @param hits The exact matches count received as feedback
 */
export function filterCandidates(candidates: string[], guess: string, hits: number): string[] {
  return candidates.filter((candidate) => calculateHits(candidate, guess) === hits);
}

/**
 * Proposes the next guess from the list of remaining candidates.
 * 
 * @param candidates List of remaining valid candidates
 * @returns A candidate code to guess next
 */
export function getNextGuess(candidates: string[]): string {
  if (candidates.length === 0) {
    // Fallback if somehow empty
    return '1234';
  }
  // Pick the first available candidate to keep it deterministic and simple,
  // or a random one. The first one is perfectly fine.
  return candidates[0];
}
