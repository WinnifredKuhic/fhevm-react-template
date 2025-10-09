/**
 * FHEVM Client - Core SDK class
 */

import { createInstance, type FhevmInstance as FhevmjsInstance } from 'fhevmjs';
import type {
  FhevmConfig,
  FhevmInstance,
  Provider,
  EncryptedInput,
  DecryptedOutput,
  EncryptOptions,
  DecryptOptions,
  EncryptedType,
  ContractAddress
} from './types';
import { InitializationError, EncryptionError, DecryptionError } from './types';

/**
 * Main FHEVM Client class
 *
 * Provides high-level API for encryption, decryption, and FHEVM operations
 */
export class FhevmClient {
  private instance: FhevmjsInstance | null = null;
  private provider: Provider;
  private config: FhevmConfig;
  private initialized: boolean = false;

  constructor(config: FhevmConfig) {
    if (!config.provider) {
      throw new InitializationError('Provider is required');
    }

    this.provider = config.provider;
    this.config = config;
  }

  /**
   * Initialize the FHEVM instance
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const chainId = this.config.network?.chainId || (await this.provider.getNetwork()).chainId;

      this.instance = await createInstance({
        chainId: Number(chainId),
        networkUrl: this.config.network?.rpcUrl || '',
        gatewayUrl: this.config.gatewayAddress || '',
        aclAddress: this.config.aclAddress,
        kmsVerifierAddress: this.config.kmsVerifierAddress,
      });

      this.initialized = true;
    } catch (error) {
      throw new InitializationError(
        'Failed to initialize FHEVM instance',
        error
      );
    }
  }

  /**
   * Ensure instance is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.instance) {
      throw new InitializationError(
        'FHEVM instance not initialized. Call init() first.'
      );
    }
  }

  /**
   * Encrypt a value for contract input
   *
   * @param value - Value to encrypt (number, bigint, or boolean)
   * @param options - Encryption options
   * @returns Encrypted input with handles and proof
   */
  async encrypt(
    value: number | bigint | boolean,
    options?: EncryptOptions
  ): Promise<EncryptedInput> {
    this.ensureInitialized();

    try {
      const type = options?.type || this.inferType(value);
      const contractAddress = options?.contractAddress;
      const userAddress = options?.userAddress;

      const input = this.instance!.createEncryptedInput(
        contractAddress,
        userAddress
      );

      // Add value based on type
      switch (type) {
        case EncryptedType.EBOOL:
          input.addBool(Boolean(value));
          break;
        case EncryptedType.EUINT8:
          input.add8(Number(value));
          break;
        case EncryptedType.EUINT16:
          input.add16(Number(value));
          break;
        case EncryptedType.EUINT32:
          input.add32(Number(value));
          break;
        case EncryptedType.EUINT64:
          input.add64(BigInt(value));
          break;
        case EncryptedType.EUINT128:
          input.add128(BigInt(value));
          break;
        case EncryptedType.EUINT256:
          input.add256(BigInt(value));
          break;
        default:
          throw new EncryptionError(`Unsupported type: ${type}`);
      }

      const encryptedInput = input.encrypt();

      return {
        handles: encryptedInput.handles[0],
        inputProof: encryptedInput.inputProof,
      };
    } catch (error) {
      throw new EncryptionError(
        'Failed to encrypt value',
        error
      );
    }
  }

  /**
   * Encrypt multiple values at once
   */
  async encryptBatch(
    values: Array<number | bigint | boolean>,
    types: EncryptedType[],
    contractAddress?: ContractAddress,
    userAddress?: string
  ): Promise<EncryptedInput[]> {
    this.ensureInitialized();

    if (values.length !== types.length) {
      throw new EncryptionError(
        'Values and types arrays must have the same length'
      );
    }

    const results: EncryptedInput[] = [];

    for (let i = 0; i < values.length; i++) {
      const encrypted = await this.encrypt(values[i], {
        type: types[i],
        contractAddress,
        userAddress,
      });
      results.push(encrypted);
    }

    return results;
  }

  /**
   * Decrypt a sealed output using user's private key (EIP-712)
   *
   * @param options - Decryption options
   * @returns Decrypted value
   */
  async decrypt(options: DecryptOptions): Promise<DecryptedOutput> {
    this.ensureInitialized();

    try {
      const { contractAddress, handle, signer, publicKey } = options;

      // Get signature for decryption permission
      const eip712 = this.instance!.createEIP712(
        publicKey || await this.getPublicKey(),
        contractAddress
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        eip712.types,
        eip712.message
      );

      // Request sealed ciphertext from contract
      const sealedValue = await this.instance!.reencrypt(
        handle,
        privateKey,
        publicKey || await this.getPublicKey(),
        signature,
        contractAddress,
        await signer.getAddress()
      );

      const decrypted = this.instance!.unseal(contractAddress, sealedValue);

      return {
        value: decrypted,
        encryptedValue: handle,
      };
    } catch (error) {
      throw new DecryptionError(
        'Failed to decrypt value',
        error
      );
    }
  }

  /**
   * Public decrypt (for public values)
   */
  async publicDecrypt(
    contractAddress: ContractAddress,
    handle: string
  ): Promise<bigint> {
    this.ensureInitialized();

    try {
      return await this.instance!.publicDecrypt(contractAddress, handle);
    } catch (error) {
      throw new DecryptionError(
        'Failed to public decrypt',
        error
      );
    }
  }

  /**
   * Get public encryption key
   */
  async getPublicKey(): Promise<string> {
    this.ensureInitialized();
    return this.instance!.getPublicKey();
  }

  /**
   * Create EIP-712 signature for decryption
   */
  createEIP712(publicKey: string, contractAddress: ContractAddress) {
    this.ensureInitialized();
    return this.instance!.createEIP712(publicKey, contractAddress);
  }

  /**
   * Infer encrypted type from value
   */
  private inferType(value: number | bigint | boolean): EncryptedType {
    if (typeof value === 'boolean') {
      return EncryptedType.EBOOL;
    }

    const numValue = typeof value === 'bigint' ? value : BigInt(value);

    if (numValue < 256n) return EncryptedType.EUINT8;
    if (numValue < 65536n) return EncryptedType.EUINT16;
    if (numValue < 4294967296n) return EncryptedType.EUINT32;
    if (numValue < 18446744073709551616n) return EncryptedType.EUINT64;
    if (numValue < (2n ** 128n)) return EncryptedType.EUINT128;
    return EncryptedType.EUINT256;
  }

  /**
   * Get FHEVM instance
   */
  getInstance(): FhevmjsInstance {
    this.ensureInitialized();
    return this.instance!;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current provider
   */
  getProvider(): Provider {
    return this.provider;
  }

  /**
   * Get current signer
   */
  getSigner() {
    return this.config.signer;
  }

  /**
   * Update signer
   */
  setSigner(signer: any) {
    this.config.signer = signer;
  }
}
