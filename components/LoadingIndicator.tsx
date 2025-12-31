'use client';

import { useEffect, useState } from 'react';

export interface LoadingStatus {
  stage: 'idle' | 'fetching-token' | 'connecting' | 'initializing' | 'ready' | 'error';
  message: string;
  progress: number; // 0-100
}

interface LoadingIndicatorProps {
  status: LoadingStatus;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function LoadingIndicator({ status, onRetry, showRetry = false }: LoadingIndicatorProps) {
  const [dots, setDots] = useState('');

  // Animated dots for loading states
  useEffect(() => {
    if (status.stage === 'ready' || status.stage === 'error') return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [status.stage]);

  if (status.stage === 'idle' || status.stage === 'ready') {
    return null;
  }

  const isError = status.stage === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-gradient-to-br from-purple-900/90 to-black/90 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Spinner or Error Icon */}
        <div className="flex justify-center mb-6">
          {isError ? (
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          ) : (
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <h3 className="text-white text-xl font-semibold text-center mb-2">
          {isError ? 'Connection Failed' : `${status.message}${dots}`}
        </h3>

        {/* Progress Bar */}
        {!isError && (
          <div className="w-full h-2 bg-purple-950/50 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${status.progress}%` }}
              role="progressbar"
              aria-valuenow={status.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        {/* Additional Info */}
        <p className="text-purple-200/70 text-sm text-center mb-4">
          {isError
            ? 'Unable to establish connection. Please check your internet and try again.'
            : 'Setting up your AI assistant...'}
        </p>

        {/* Retry Button */}
        {showRetry && isError && onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Retry connection"
          >
            Try Again
          </button>
        )}

        {/* Stage Indicator */}
        {!isError && (
          <div className="flex justify-center gap-2 mt-4">
            {['fetching-token', 'connecting', 'initializing'].map((stage, index) => (
              <div
                key={stage}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  status.stage === stage
                    ? 'bg-purple-500 scale-125'
                    : index < ['fetching-token', 'connecting', 'initializing'].indexOf(status.stage)
                    ? 'bg-purple-600'
                    : 'bg-purple-900'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function getLoadingStatus(stage: LoadingStatus['stage']): LoadingStatus {
  const statusMap: Record<LoadingStatus['stage'], LoadingStatus> = {
    idle: { stage: 'idle', message: '', progress: 0 },
    'fetching-token': { stage: 'fetching-token', message: 'Securing connection', progress: 25 },
    connecting: { stage: 'connecting', message: 'Connecting to AI', progress: 50 },
    initializing: { stage: 'initializing', message: 'Initializing voice assistant', progress: 75 },
    ready: { stage: 'ready', message: 'Ready', progress: 100 },
    error: { stage: 'error', message: 'Connection failed', progress: 0 },
  };

  return statusMap[stage];
}
