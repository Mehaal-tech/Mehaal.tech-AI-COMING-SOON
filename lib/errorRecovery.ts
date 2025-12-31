/**
 * Enhanced Error Recovery System
 * Provides granular error handling and recovery mechanisms
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  VOICE_ERROR = 'VOICE_ERROR',
  MICROPHONE_ERROR = 'MICROPHONE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  recoverable: boolean;
  suggestedAction?: string;
  retryAfter?: number; // milliseconds
}

export interface RecoveryStrategy {
  canRecover: boolean;
  action: () => Promise<void> | void;
  message: string;
}

class ErrorRecoveryService {
  private errorHistory: ErrorDetails[] = [];
  private maxHistorySize = 10;

  /**
   * Classify and handle errors
   */
  handleError(error: Error | string, context?: string): ErrorDetails {
    const errorDetails = this.classifyError(error, context);
    this.errorHistory.push(errorDetails);

    // Trim history if too long
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    console.error(`[ErrorRecovery] ${errorDetails.type}:`, errorDetails.message);
    return errorDetails;
  }

  /**
   * Classify error type based on message and context
   */
  private classifyError(error: Error | string, context?: string): ErrorDetails {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const timestamp = Date.now();

    // Network errors
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('Failed to fetch')
    ) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Check your internet connection and try again.',
        retryAfter: 5000,
      };
    }

    // Token errors
    if (errorMessage.includes('token') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return {
        type: ErrorType.TOKEN_ERROR,
        message: 'Authentication failed. Unable to get access token.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Refresh the page and try again.',
        retryAfter: 3000,
      };
    }

    // Rate limit errors
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too many')) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        message: 'Too many requests. Please wait a moment.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Wait a minute and try again.',
        retryAfter: 60000,
      };
    }

    // Connection errors
    if (errorMessage.includes('connect') || errorMessage.includes('websocket') || context === 'connection') {
      return {
        type: ErrorType.CONNECTION_ERROR,
        message: 'Failed to connect to voice service.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Check your connection and try again.',
        retryAfter: 5000,
      };
    }

    // Microphone errors
    if (
      errorMessage.includes('microphone') ||
      errorMessage.includes('getUserMedia') ||
      errorMessage.includes('NotAllowedError') ||
      errorMessage.includes('permission')
    ) {
      return {
        type: ErrorType.MICROPHONE_ERROR,
        message: 'Microphone access denied or unavailable.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Please allow microphone access in your browser settings.',
        retryAfter: 0,
      };
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: 'Connection timed out.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'The service is taking too long to respond. Please try again.',
        retryAfter: 5000,
      };
    }

    // API errors
    if (errorMessage.includes('API') || errorMessage.includes('500') || errorMessage.includes('503')) {
      return {
        type: ErrorType.API_ERROR,
        message: 'Service temporarily unavailable.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'The service is experiencing issues. Please try again in a moment.',
        retryAfter: 10000,
      };
    }

    // Voice errors
    if (errorMessage.includes('voice') || errorMessage.includes('audio') || context === 'voice') {
      return {
        type: ErrorType.VOICE_ERROR,
        message: 'Voice service error. Using fallback mode.',
        originalError: error instanceof Error ? error : undefined,
        timestamp,
        recoverable: true,
        suggestedAction: 'Continue with browser voice or refresh to try again.',
        retryAfter: 3000,
      };
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: errorMessage || 'An unexpected error occurred.',
      originalError: error instanceof Error ? error : undefined,
      timestamp,
      recoverable: true,
      suggestedAction: 'Please refresh the page and try again.',
      retryAfter: 5000,
    };
  }

  /**
   * Get recovery strategy for error
   */
  getRecoveryStrategy(errorDetails: ErrorDetails): RecoveryStrategy {
    switch (errorDetails.type) {
      case ErrorType.NETWORK_ERROR:
        return {
          canRecover: true,
          action: async () => {
            await this.waitForNetwork();
          },
          message: 'Waiting for network connection...',
        };

      case ErrorType.TOKEN_ERROR:
        return {
          canRecover: true,
          action: () => window.location.reload(),
          message: 'Refreshing to get new token...',
        };

      case ErrorType.RATE_LIMIT_ERROR:
        return {
          canRecover: true,
          action: async () => {
            await this.delay(errorDetails.retryAfter || 60000);
          },
          message: 'Waiting for rate limit to reset...',
        };

      case ErrorType.MICROPHONE_ERROR:
        return {
          canRecover: false,
          action: () => {
            alert(
              'Please allow microphone access:\n1. Click the lock icon in the address bar\n2. Allow microphone permission\n3. Refresh the page'
            );
          },
          message: 'Microphone permission required',
        };

      case ErrorType.CONNECTION_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return {
          canRecover: true,
          action: () => window.location.reload(),
          message: 'Reconnecting...',
        };

      default:
        return {
          canRecover: true,
          action: () => window.location.reload(),
          message: 'Attempting recovery...',
        };
    }
  }

  /**
   * Wait for network connection
   */
  private async waitForNetwork(): Promise<void> {
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve();
        return;
      }

      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };

      window.addEventListener('online', handleOnline);
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get error history
   */
  getErrorHistory(): ErrorDetails[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Check if should retry based on history
   */
  shouldRetry(errorType: ErrorType, maxRetries: number = 3): boolean {
    const recentErrors = this.errorHistory.filter(
      (e) => e.type === errorType && Date.now() - e.timestamp < 60000 // Last minute
    );
    return recentErrors.length < maxRetries;
  }
}

// Singleton instance
export const errorRecovery = new ErrorRecoveryService();
