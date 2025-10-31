/**
 * API Type Definitions
 * TypeScript types for API requests and responses
 */

import { EncryptedValue, DecryptedValue, FHEPublicKey, ComputationResult, FHEOperation } from './fhe';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Encryption API
export interface EncryptRequest {
  value: number | bigint | boolean;
  type?: string;
  contractAddress?: string;
}

export interface EncryptResponse {
  success: boolean;
  encrypted: EncryptedValue;
  originalValue?: number | bigint | boolean;
}

// Decryption API
export interface DecryptRequest {
  handle: string;
  contractAddress: string;
  signature?: string;
  userAddress?: string;
}

export interface DecryptResponse {
  success: boolean;
  decrypted: DecryptedValue;
}

// Computation API
export interface ComputeRequest {
  operation: FHEOperation;
  operands: string[];
  contractAddress?: string;
}

export interface ComputeResponse {
  success: boolean;
  result: ComputationResult;
}

// Keys API
export interface KeysRequest {
  contractAddress: string;
  regenerate?: boolean;
}

export interface KeysResponse {
  success: boolean;
  publicKey: FHEPublicKey;
  message?: string;
}

// Error Response
export interface ApiError {
  error: string;
  details?: string;
  statusCode?: number;
}
