/**
 * Voice API Route
 * Secure server-side API key handling for OpenAI Realtime
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'getKey':
        // Return masked key for validation only (never send full key to client)
        return NextResponse.json({
          hasKey: true,
          keyPrefix: apiKey.substring(0, 7),
        });
        
      case 'proxy':
        // Optional: Proxy requests to OpenAI to keep key server-side
        // This would require implementing full WebSocket proxy
        return NextResponse.json(
          { error: 'Proxy not implemented' },
          { status: 501 }
        );
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Voice API endpoint',
      endpoints: {
        POST: {
          getKey: 'Check if API key is configured',
        },
      },
    },
    { status: 200 }
  );
}
