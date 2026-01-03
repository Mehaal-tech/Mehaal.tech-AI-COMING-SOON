export function Header() {
  return (
    <header 
      class="relative h-16 md:h-20 overflow-hidden"
      style={{
        'background-image': 'url(/header-bg.png)',
        'background-size': '200% 100%',
        'background-repeat': 'repeat-x',
      }}
      role="banner"
    >
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" class="skip-to-content">
        Skip to main content
      </a>
      
      {/* Animated background */}
      <div 
        class="absolute inset-0 scroll-bg-slow"
        style={{
          'background-image': 'url(/header-bg.png)',
          'background-size': '200% 100%',
          'background-repeat': 'repeat-x',
        }}
        aria-hidden="true"
      />
      
      {/* Header content */}
      <div class="relative z-10 h-full container-center px-4 md:px-8 flex items-center justify-between">
        {/* Logo - emerges from top-left */}
        <div class="emerge" style={{ 'animation-delay': '0.2s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <a href="/" aria-label="Mehaal.Tech AI Home">
            <img 
              src="/icon.svg" 
              alt="Mehaal.Tech AI" 
              class="h-10 md:h-12 w-auto"
            />
          </a>
        </div>
        
        {/* Navigation - slides in from right */}
        <nav 
          class="slide-in-right" 
          style={{ 'animation-delay': '0.4s', opacity: 0, 'animation-fill-mode': 'forwards' }}
          aria-label="Primary navigation"
        >
          <ul class="flex gap-4 md:gap-8 items-center text-xs md:text-sm font-medium">
            <li>
              <a href="#features" class="hover:text-brand-primary transition-colors focus-trap">
                Features
              </a>
            </li>
            <li class="hidden sm:block">
              <a href="#pricing" class="hover:text-brand-primary transition-colors focus-trap">
                Pricing
              </a>
            </li>
            <li class="hidden md:block">
              <a href="#about" class="hover:text-brand-primary transition-colors focus-trap">
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
