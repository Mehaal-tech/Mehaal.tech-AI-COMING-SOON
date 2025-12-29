/**
 * Voice API Route
 * Secure server-side API key handling for OpenAI Realtime
 * Rate limiting protection against abuse
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = {
  requests: 10,
  windowMs: 60 * 1000, // 1 minute window
};

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or fallback to user agent
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(key);
  
  if (!entry || now - entry.timestamp > RATE_LIMIT.windowMs) {
    // Reset counter
    requestCounts.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count < RATE_LIMIT.requests) {
    entry.count++;
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

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
