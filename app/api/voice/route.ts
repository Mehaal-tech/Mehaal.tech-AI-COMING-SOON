import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Server-side key check
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // 2. Request Ephemeral Token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "nova",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Failed to get token' }, { status: response.status });
    }

    // 3. Return only the temporary token
    return NextResponse.json({ 
      client_secret: data.client_secret, 
      expires_at: data.expires_at 
    });

  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
