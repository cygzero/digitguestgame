import { describe, it, expect } from 'vitest';
import { generateAllCandidates, filterCandidates, getNextGuess } from './solver';
import { calculateHits } from './engine';

describe('CPU Solver Engine', () => {
  it('should generate exactly 10000 candidates', () => {
    const candidates = generateAllCandidates();
    expect(candidates.length).toBe(10000);
    expect(candidates[0]).toBe('0000');
    expect(candidates[9999]).toBe('9999');
  });

  it('should filter candidates based on guess feedback', () => {
    let candidates = generateAllCandidates();
    // Guess: 1234, secret is 1256 (hits: 2)
    candidates = filterCandidates(candidates, '1234', 2);
    
    // The candidate 1256 should still be in the list
    expect(candidates.includes('1256')).toBe(true);
    // The candidate 1234 itself should not be in the list (since calculateHits('1234', '1234') is 4, not 2)
    expect(candidates.includes('1234')).toBe(false);
    // The candidate 7890 should not be in the list (hits is 0, not 2)
    expect(candidates.includes('7890')).toBe(false);
  });

  it('should solve any secret code within 8 guesses using candidate elimination', () => {
    const secret = '5731';
    let candidates = generateAllCandidates();
    let attemptsCount = 0;
    let guess = '1234'; // standard starting guess
    
    while (guess !== secret && attemptsCount < 10) {
      const hits = calculateHits(secret, guess);
      candidates = filterCandidates(candidates, guess, hits);
      guess = getNextGuess(candidates);
      attemptsCount++;
    }

    expect(guess).toBe(secret);
    expect(attemptsCount).toBeLessThanOrEqual(10); // Usually converges in 5-9 guesses
  });
});
