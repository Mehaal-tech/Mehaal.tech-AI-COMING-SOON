import { createSignal, onMount, onCleanup, Show } from "solid-js";

interface CountdownTimerProps {
  targetDate?: string; // ISO date string
}

export default function CountdownTimer(props: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = createSignal({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  let intervalId: number | undefined;

  const calculateTimeLeft = () => {
    const target = props.targetDate 
      ? new Date(props.targetDate).getTime()
      : new Date(import.meta.env.VITE_LAUNCH_DATE || '2026-03-01').getTime();
    
    const now = new Date().getTime();
    const difference = target - now;

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
    }
  };

  onMount(() => {
    calculateTimeLeft();
    intervalId = setInterval(calculateTimeLeft, 1000) as unknown as number;
  });

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  const TimeUnit = (props: { value: number; label: string }) => (
    <div class="flex flex-col items-center">
      <div 
        class="bg-black/60 backdrop-blur-lg border border-cyan-500/30 rounded-lg p-4 min-w-[80px] md:min-w-[100px]"
        style={{
          "box-shadow": "0 0 20px rgba(0, 255, 255, 0.2)"
        }}
      >
        <div 
          class="text-3xl md:text-5xl font-bold text-cyan-300 tabular-nums"
          style={{
            "font-family": "CabinetGrotesk-Variable, sans-serif",
            "text-shadow": "0 0 10px rgba(0, 255, 255, 0.5)"
          }}
          role="timer"
          aria-label={`${props.value} ${props.label}`}
        >
          {props.value.toString().padStart(2, '0')}
        </div>
      </div>
      <div 
        class="text-cyan-300/70 text-xs md:text-sm font-medium mt-2 uppercase tracking-wider"
        style={{
          "font-family": "CabinetGrotesk-Variable, sans-serif"
        }}
      >
        {props.label}
      </div>
    </div>
  );

  return (
    <Show when={timeLeft().total > 0} fallback={
      <div 
        class="text-center text-cyan-300 text-2xl font-bold"
        style={{
          "font-family": "CabinetGrotesk-Variable, sans-serif",
          "text-shadow": "0 0 20px rgba(0, 255, 255, 0.6)"
        }}
      >
        We're Live! 🎉
      </div>
    }>
      <div 
        class="flex gap-3 md:gap-6 justify-center"
        role="timer"
        aria-label="Countdown to launch"
      >
        <TimeUnit value={timeLeft().days} label="Days" />
        <TimeUnit value={timeLeft().hours} label="Hours" />
        <TimeUnit value={timeLeft().minutes} label="Minutes" />
        <TimeUnit value={timeLeft().seconds} label="Seconds" />
      </div>
    </Show>
  );
}
