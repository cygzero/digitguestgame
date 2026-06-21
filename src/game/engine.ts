/**
 * Validates whether a given code is exactly 4 digits.
 * @param code The string code to validate
 * @returns true if valid, false otherwise
 */
export function isValidCode(code: string): boolean {
  if (code.length !== 4) {
    return false;
  }
  return /^[0-9]{4}$/.test(code);
}

/**
 * Calculates the exact index and value matches (hits) between a secret code and a guess.
 * @param secretCode The opponent's secret code
 * @param guess The player's guess
 * @returns The number of exact matches (0 to 4)
 */
export function calculateHits(secretCode: string, guess: string): number {
  let hits = 0;
  for (let i = 0; i < 4; i++) {
    if (secretCode[i] === guess[i]) {
      hits++;
    }
  }
  return hits;
}
