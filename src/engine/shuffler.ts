import { QuestionOption } from '../types';

/**
 * Pure Fisher-Yates runtime option shuffler.
 * Shuffles complete option objects while preserving immutable `id` and `isCorrect` metadata,
 * then maps display letters ('A', 'B', 'C', 'D').
 */
export function shuffleOptions(options: QuestionOption[]): QuestionOption[] {
  const cloned: QuestionOption[] = options.map((opt) => ({ ...opt }));
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  const displayLetters = ['A', 'B', 'C', 'D', 'E'];
  return cloned.map((opt, idx) => ({
    ...opt,
    displayLetter: displayLetters[idx] || `${idx + 1}`,
  }));
}
