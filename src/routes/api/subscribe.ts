import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";

interface SubscribeRequest {
  email: string;
}

export async function POST({ request }: APIEvent) {
  try {
    const body = await request.json() as SubscribeRequest;
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Implement actual email subscription logic
    // Options:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Add to email service (Mailchimp, SendGrid, ConvertKit)
    // 3. Save to a JSON file (temporary solution)
    // 4. Send to a webhook or third-party service

    console.log('New subscription:', email);

    // Example: Save to a simple JSON file (for development)
    // In production, replace this with a proper database
    /*
    const fs = await import('fs/promises');
    const path = await import('path');
    const subscribersFile = path.join(process.cwd(), 'subscribers.json');
    
    let subscribers = [];
    try {
      const data = await fs.readFile(subscribersFile, 'utf-8');
      subscribers = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet
    }
    
    if (!subscribers.includes(email)) {
      subscribers.push({
        email,
        subscribedAt: new Date().toISOString()
      });
      await fs.writeFile(subscribersFile, JSON.stringify(subscribers, null, 2));
    }
    */

    // For now, just return success
    return json({
      success: true,
      message: 'Successfully subscribed! We\'ll notify you at launch.'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
