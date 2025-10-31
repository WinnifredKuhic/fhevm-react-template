import { NextRequest, NextResponse } from 'next/server';

/**
 * FHE Operations API Route
 * Handles general FHE operations and provides information about available endpoints
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'FHE Operations API',
    endpoints: {
      encrypt: '/api/fhe/encrypt',
      decrypt: '/api/fhe/decrypt',
      compute: '/api/fhe/compute',
      keys: '/api/keys'
    },
    version: '1.0.0'
  });
}

/**
 * POST endpoint for FHE operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    if (!operation || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: operation, data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `FHE operation ${operation} received`,
      data: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
