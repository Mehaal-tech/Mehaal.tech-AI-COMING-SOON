/**
 * Voice API Route
 * 🔒 CRITICAL: Server-side API key handling with Ephemeral Token Pattern
 * 
 * Security Model:
 * 1. Client never receives the OpenAI API key
 * 2. Client requests ephemeral token from /api/voice
 * 3. Server generates temporary token using OpenAI session creation
 * 4. Client uses ephemeral token (expires in 60s) to connect
 * 5. Rate limiting enforced server-side via Redis
 * 
 * This prevents:
 * - Key exposure via browser DevTools
 * - Direct API abuse (client can't call OpenAI endpoints)
 * - Rate limiting bypass
 * - Credit card drain attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ===========================
// RATE LIMITING SETUP
// ===========================

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  });
}

// Fallback in-memory rate limiting for development
const memoryRateLimits = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous'
  );
}

async function checkRateLimit(key: string): Promise<{ success: boolean; remaining: number }> {
  if (ratelimit) {
    try {
      const { success, remaining } = await ratelimit.limit(`voice:${key}`);
      return { success, remaining };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fallback to memory if Redis fails
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memoryRateLimits.get(key) || { count: 0, resetTime: now + 60 * 1000 };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + 60 * 1000;
  } else {
    entry.count++;
  }

  memoryRateLimits.set(key, entry);
  const remaining = Math.max(0, 10 - entry.count);

  return { success: entry.count <= 10, remaining };
}

// ===========================
// EPHEMERAL TOKEN GENERATION
// ===========================

/**
 * Generate ephemeral session token for WebSocket connection
 * This token is temporary (60s) and cannot be used to make direct API calls
 */
async function generateEphemeralToken(): Promise<{
  token: string;
  expiresIn: number;
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Use OpenAI's session creation to get ephemeral credentials
    // This creates a temporary token valid for 60 seconds
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'verse',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI session error:', error);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const session = await response.json() as {
      id: string;
      client_secret: { value: string; expires_at: number };
    };

    return {
      token: session.client_secret.value,
      expiresIn: session.client_secret.expires_at,
    };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate ephemeral token');
  }
}

// ===========================
// API ROUTE HANDLER
// ===========================

interface VoiceApiRequest {
  action: 'token' | 'validate';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit check (first line of defense)
    const rateLimitKey = getRateLimitKey(request);
    const { success, remaining } = await checkRateLimit(rateLimitKey);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded (10 requests/minute)',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      );
    }

    // 2. Parse request
    const body = await request.json() as VoiceApiRequest;
    const { action } = body;

    // 3. Verify API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // 4. Handle actions
    switch (action) {
      case 'token': {
        // 🔒 CRITICAL: Generate ephemeral token (expires in 60s)
        // Client gets a temporary token that cannot be reused
        const { token, expiresIn } = await generateEphemeralToken();

        return NextResponse.json(
          {
            token,
            expiresIn,
            model: 'gpt-4o-realtime-preview-2024-12-17',
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'X-RateLimit-Remaining': remaining.toString(),
            },
          }
        );
      }

      case 'validate': {
        // Validate that API is configured (used for initial check)
        return NextResponse.json(
          {
            configured: true,
            message: 'Voice API is available',
          },
          {
            headers: {
              'X-RateLimit-Remaining': remaining.toString(),
            },
          }
        );
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Voice API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
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
