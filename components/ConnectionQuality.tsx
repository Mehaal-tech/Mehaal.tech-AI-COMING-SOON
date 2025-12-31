'use client';

interface ConnectionQualityProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  latency?: number;
  isVisible: boolean;
}

export function ConnectionQuality({ quality, latency, isVisible }: ConnectionQualityProps) {
  if (!isVisible) return null;

  const qualityConfig = {
    excellent: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      bars: 4,
      label: 'Excellent',
    },
    good: {
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      bars: 3,
      label: 'Good',
    },
    fair: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      bars: 2,
      label: 'Fair',
    },
    poor: {
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/50',
      bars: 1,
      label: 'Poor',
    },
    disconnected: {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      bars: 0,
      label: 'Disconnected',
    },
  };

  const config = qualityConfig[quality];

  return (
    <div
      className={`fixed top-4 left-4 z-50 ${config.bg} ${config.border} border backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-300 animate-fade-in`}
      role="status"
      aria-live="polite"
    >
      {/* Signal Bars */}
      <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm transition-all duration-300 ${
              bar <= config.bars ? config.color.replace('text-', 'bg-') : 'bg-gray-600'
            }`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>

      {/* Quality Label */}
      <div className="flex flex-col">
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        {latency !== undefined && quality !== 'disconnected' && (
          <span className="text-xs text-gray-400">{latency}ms</span>
        )}
      </div>
    </div>
  );
}
