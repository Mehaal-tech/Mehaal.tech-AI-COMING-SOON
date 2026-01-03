export function Header() {
  return (
    <header 
      class="relative h-20 overflow-hidden"
      style={{
        'background-image': 'url(/header-bg.png)',
        'background-size': '200% 100%',
        'background-repeat': 'repeat-x',
      }}
    >
      {/* Animated background */}
      <div 
        class="absolute inset-0 scroll-bg-slow"
        style={{
          'background-image': 'url(/header-bg.png)',
          'background-size': '200% 100%',
          'background-repeat': 'repeat-x',
        }}
      />
      
      {/* Header content */}
      <div class="relative z-10 h-full container-center flex items-center justify-between">
        {/* Logo - emerges from top-left */}
        <div class="emerge" style={{ 'animation-delay': '0.2s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <img 
            src="/icon.svg" 
            alt="Mehaal.Tech AI" 
            class="h-12 w-auto"
          />
        </div>
        
        {/* Navigation - slides in from right */}
        <nav class="slide-in-right" style={{ 'animation-delay': '0.4s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <ul class="flex gap-8 items-center text-sm font-medium">
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                About
              </a>
            </li>
            <li>
              <a 
                href="/auth/login" 
                class="px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 transition-opacity"
              >
                Sign In
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
