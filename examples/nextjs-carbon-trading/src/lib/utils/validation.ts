/**
 * Validation Utilities
 * Input validation and data verification functions
 */

import { FHEType, FHEOperation } from '../fhe/types';

/**
 * Validate FHE type
 */
export function isValidFHEType(type: string): type is FHEType {
  const validTypes: FHEType[] = ['euint8', 'euint16', 'euint32', 'euint64', 'euint128', 'ebool'];
  return validTypes.includes(type as FHEType);
}

/**
 * Validate FHE operation
 */
export function isValidFHEOperation(operation: string): operation is FHEOperation {
  const validOps: FHEOperation[] = ['add', 'sub', 'mul', 'div', 'eq', 'ne', 'gte', 'lte', 'gt', 'lt'];
  return validOps.includes(operation as FHEOperation);
}

/**
 * Validate numeric value is within range for FHE type
 */
export function isValueInRange(value: number | bigint, type: FHEType): boolean {
  const numValue = typeof value === 'bigint' ? Number(value) : value;

  switch (type) {
    case 'euint8':
      return numValue >= 0 && numValue <= 255;
    case 'euint16':
      return numValue >= 0 && numValue <= 65535;
    case 'euint32':
      return numValue >= 0 && numValue <= 4294967295;
    case 'euint64':
      return numValue >= 0 && numValue <= Number.MAX_SAFE_INTEGER;
    case 'euint128':
      return numValue >= 0;
    case 'ebool':
      return numValue === 0 || numValue === 1;
    default:
      return false;
  }
}

/**
 * Validate number is a positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validate number is non-negative
 */
export function isNonNegative(value: number): boolean {
  return typeof value === 'number' && value >= 0;
}

/**
 * Validate string is not empty
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate array has elements
 */
export function isNonEmptyArray<T>(value: T[]): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate numeric input
 */
export function parseNumericInput(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);
  if (isNaN(num)) return null;

  return num;
}
