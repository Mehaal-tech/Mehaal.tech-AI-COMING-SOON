import { createSignal, Show } from "solid-js";

export default function EmailSubscription() {
  const [email, setEmail] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    const emailValue = email();
    if (!emailValue || !emailValue.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // For demo mode - just show success
      // TODO: Replace with actual API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Thank you! We\'ll notify you at launch.' });
      setEmail("");
      
      // Log for now
      console.log('Email subscription:', emailValue);
      
      /* Production API call:
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }
      
      setMessage({ type: 'success', text: data.message || 'Thank you! We\'ll notify you at launch.' });
      setEmail("");
      */
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="w-full max-w-md mx-auto px-4">
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label 
            for="email-subscription" 
            class="block text-cyan-300 text-sm font-medium mb-2"
            style={{
              "font-family": "CabinetGrotesk-Variable, sans-serif"
            }}
          >
            Get notified when we launch
          </label>
          <div class="flex gap-2">
            <input
              id="email-subscription"
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              placeholder="Enter your email"
              required
              disabled={isSubmitting()}
              class="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
              style={{
                "font-family": "CabinetGrotesk-Variable, sans-serif"
              }}
              aria-describedby="subscription-message"
            />
            <button
              type="submit"
              disabled={isSubmitting()}
              class="px-6 py-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                "font-family": "CabinetGrotesk-Variable, sans-serif",
                "box-shadow": "0 0 20px rgba(0, 255, 255, 0.3)"
              }}
              aria-label={isSubmitting() ? "Subscribing..." : "Subscribe"}
            >
              <Show when={!isSubmitting()} fallback="...">
                Notify Me
              </Show>
            </button>
          </div>
        </div>
        
        <Show when={message()}>
          <div 
            id="subscription-message"
            class="text-sm font-medium px-4 py-2 rounded-lg"
            classList={{
              "bg-green-500/20 text-green-300 border border-green-500/30": message()!.type === 'success',
              "bg-red-500/20 text-red-300 border border-red-500/30": message()!.type === 'error',
            }}
            role="alert"
            aria-live="polite"
          >
            {message()!.text}
          </div>
        </Show>
      </form>
    </div>
  );
}
