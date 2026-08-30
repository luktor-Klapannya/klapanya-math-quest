import { NumericValidationPolicy } from '../types';

/**
 * Numerical Grid Response Normalizer
 * Validates mathematical equivalence according to the per-question policy:
 * - EXACT: Exact string or integer match after normalization
 * - TOLERANCE: Allowed epsilon difference (|a - b| < 0.001)
 * - ROUND_TO_N_DECIMALS: Checks equality rounded to specified decimal places
 * - FRACTION_EQUIVALENT: Supports decimal-to-fraction or fraction-to-decimal equivalence
 */
export function normalizeNumericalString(input: string): string {
  if (!input) return '';
  const trimmed = input.trim().replace(/,/g, ''); // strip thousands separators if entered
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return trimmed;
  // If integer
  if (Number.isInteger(parsed)) {
    return parsed.toString();
  }
  // Strip trailing zeros on float: e.g. "12.50" -> "12.5"
  return parsed.toString();
}

export function parseFractionToDecimal(str: string): number | null {
  if (!str.includes('/')) return null;
  const parts = str.split('/');
  if (parts.length === 2) {
    const num = parseFloat(parts[0].trim());
    const den = parseFloat(parts[1].trim());
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }
  return null;
}

export function evaluateGridResponse(
  userInput: string,
  canonicalValue: string,
  policy: NumericValidationPolicy = 'TOLERANCE',
  roundingDecimals: number = 2
): boolean {
  if (!userInput || !canonicalValue) return false;

  const normUser = normalizeNumericalString(userInput);
  const normCanonical = normalizeNumericalString(canonicalValue);

  // Exact Normalized String Match
  if (normUser === normCanonical) return true;

  const numUser = parseFractionToDecimal(userInput) ?? parseFloat(normUser);
  const numCanonical = parseFractionToDecimal(canonicalValue) ?? parseFloat(normCanonical);

  if (isNaN(numUser) || isNaN(numCanonical)) return false;

  switch (policy) {
    case 'EXACT':
      return Math.abs(numUser - numCanonical) === 0;

    case 'ROUND_TO_N_DECIMALS': {
      const factor = Math.pow(10, roundingDecimals);
      return Math.round(numUser * factor) === Math.round(numCanonical * factor);
    }

    case 'FRACTION_EQUIVALENT':
      return Math.abs(numUser - numCanonical) < 0.0001;

    case 'TOLERANCE':
    default:
      return Math.abs(numUser - numCanonical) < 0.001;
  }
}
