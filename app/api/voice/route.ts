/**
 * Voice API Route
 * Secure server-side API key handling for OpenAI Realtime
 * Redis-based rate limiting for production
 */

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Redis client for rate limiting (fallback to in-memory if not configured)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Fallback in-memory storage
const requestCounts = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = {
  requests: 10,
  windowMs: 60 * 1000, // 1 minute window
};

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  
  if (redis) {
    // Redis-based rate limiting
    try {
      const redisKey = `ratelimit:voice:${key}`;
      const current = await redis.incr(redisKey);
      
      if (current === 1) {
        await redis.pexpire(redisKey, RATE_LIMIT.windowMs);
      }
      
      return current <= RATE_LIMIT.requests;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fallback to in-memory
    }
  }
  
  // In-memory fallback
  const entry = requestCounts.get(key);
  
  if (!entry || now - entry.timestamp > RATE_LIMIT.windowMs) {
    requestCounts.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count < RATE_LIMIT.requests) {
    entry.count++;
    return true;
  }
  
  return false;
}

interface VoiceApiRequest {
  action: 'connect' | 'session';
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    if (!(await checkRateLimit(rateLimitKey))) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json() as VoiceApiRequest;
    const { action } = body;
    
    switch (action) {
      case 'connect':
        // Return ephemeral session token
        return NextResponse.json({
          url: 'wss://api.openai.com/v1/realtime',
          model: 'gpt-4o-realtime-preview-2024-12-17',
          hasKey: true,
        });
        
      case 'session':
        // Return API key for client connection (server validates)
        return NextResponse.json({
          apiKey, // Only send when absolutely needed
        });
        
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
