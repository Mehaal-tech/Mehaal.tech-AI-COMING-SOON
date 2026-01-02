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
    <div class="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit}>
        <div class="flex gap-2">
          <input
            id="email-subscription"
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting()}
            class="flex-1 px-3 py-2 bg-black/40 border border-purple-500/30 rounded-lg text-white text-sm placeholder-purple-300/40 focus:outline-none focus:border-purple-400 transition-all disabled:opacity-50"
            style={{ "font-family": "CabinetGrotesk-Variable, sans-serif" }}
          />
          <button
            type="submit"
            disabled={isSubmitting()}
            class="px-4 py-2 text-white text-sm font-medium rounded-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              "font-family": "CabinetGrotesk-Variable, sans-serif",
              background: "linear-gradient(135deg, #7c6aef 0%, #5b4cc4 100%)",
              "box-shadow": "0 0 15px rgba(124, 106, 239, 0.3)"
            }}
          >
            <Show when={!isSubmitting()} fallback="...">
              Notify Me
            </Show>
          </button>
        </div>
        
        <Show when={message()}>
          <div 
            class="text-xs font-medium px-3 py-1.5 rounded mt-2"
            classList={{
              "bg-green-500/20 text-green-300": message()!.type === 'success',
              "bg-red-500/20 text-red-300": message()!.type === 'error',
            }}
          >
            {message()!.text}
          </div>
        </Show>
      </form>
    </div>
  );
}
