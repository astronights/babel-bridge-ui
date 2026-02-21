/**
 * Simple word-level diff between user input and target.
 * Returns array of {word, correct} tokens.
 */
export function diffWords(
  input: string,
  target: string,
): { word: string; correct: boolean }[] {
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, '').trim()

  const inputWords = input.trim().split(/\s+/)
  const targetWords = target.trim().split(/\s+/)
  const targetNorm = targetWords.map(normalise)

  return inputWords.map((word, i) => ({
    word,
    correct: normalise(word) === (targetNorm[i] ?? ''),
  }))
}

/**
 * Character-level diff — highlights differing chars in red.
 * Used for close misses.
 */
export function diffChars(
  input: string,
  target: string,
): { char: string; correct: boolean }[] {
  return input.split('').map((char, i) => ({
    char,
    correct: char.toLowerCase() === (target[i] ?? '').toLowerCase(),
  }))
}
