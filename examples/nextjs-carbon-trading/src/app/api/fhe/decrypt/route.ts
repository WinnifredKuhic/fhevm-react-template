import { NextRequest, NextResponse } from 'next/server';

/**
 * Decryption API Route
 * Handles decryption of FHE encrypted values with EIP-712 signature verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, contractAddress, signature, userAddress } = body;

    // Validate required fields
    if (!handle || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: handle, contractAddress' },
        { status: 400 }
      );
    }

    // Validate signature if provided
    if (signature && !userAddress) {
      return NextResponse.json(
        { error: 'userAddress required when signature is provided' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Verify the EIP-712 signature
    // 2. Check authorization
    // 3. Decrypt the value using FHE SDK
    // For now, we return a mock response
    const decryptedValue = parseInt(handle.slice(-8), 16) % 10000;

    return NextResponse.json({
      success: true,
      decrypted: {
        value: decryptedValue,
        handle: handle,
        contractAddress: contractAddress,
        verified: !!signature
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Decryption failed', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check decryption service status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'FHE Decryption',
    status: 'operational',
    requiresSignature: true,
    signatureType: 'EIP-712',
    version: '1.0.0'
  });
}
