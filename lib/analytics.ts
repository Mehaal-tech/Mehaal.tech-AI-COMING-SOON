/**
 * Analytics utility for tracking connection events
 * Supports multiple analytics providers
 */

export type AnalyticsEvent = 
  | 'connection_started'
  | 'connection_success'
  | 'connection_failed'
  | 'connection_retry'
  | 'voice_ready'
  | 'token_fetched'
  | 'token_failed'
  | 'fallback_voice_used';

export interface AnalyticsMetadata {
  timestamp: number;
  duration?: number;
  error?: string;
  attempt?: number;
  latency?: number;
  quality?: string;
}

class AnalyticsService {
  private events: Array<{ event: AnalyticsEvent; metadata: AnalyticsMetadata }> = [];
  private isEnabled: boolean = true;

  /**
   * Track a connection event
   */
  track(event: AnalyticsEvent, metadata: Partial<AnalyticsMetadata> = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event,
      metadata: {
        timestamp: Date.now(),
        ...metadata,
      },
    };

    this.events.push(eventData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics: ${event}`, eventData.metadata);
    }

    // Send to analytics providers
    this.sendToProviders(event, eventData.metadata);
  }

  /**
   * Send to analytics providers (Google Analytics, Mixpanel, etc.)
   */
  private sendToProviders(event: AnalyticsEvent, metadata: AnalyticsMetadata) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'voice_connection',
        ...metadata,
      });
    }

    // Custom analytics endpoint (optional)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, metadata }),
      }).catch((err) => console.error('Analytics error:', err));
    }
  }

  /**
   * Get all tracked events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Get success rate
   */
  getSuccessRate() {
    const started = this.events.filter((e) => e.event === 'connection_started').length;
    const succeeded = this.events.filter((e) => e.event === 'connection_success').length;
    
    if (started === 0) return 0;
    return (succeeded / started) * 100;
  }

  /**
   * Get average connection time
   */
  getAverageConnectionTime() {
    const connections = this.events.filter((e) => e.event === 'connection_success');
    const durations = connections
      .map((e) => e.metadata.duration)
      .filter((d): d is number => d !== undefined);

    if (durations.length === 0) return 0;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  /**
   * Clear events
   */
  clear() {
    this.events = [];
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Singleton instance
export const analytics = new AnalyticsService();
