export function Footer() {
  return (
    <footer 
      class="relative h-20 md:h-24 overflow-hidden mt-auto"
      style={{
        'background-image': 'url(/header-bg.png)',
        'background-size': '200% 100%',
        'background-repeat': 'repeat-x',
      }}
      role="contentinfo"
    >
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
      
      {/* Footer content */}
      <div class="relative z-10 h-full container-center px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* Footer logo - emerges from bottom */}
        <div class="emerge" style={{ 'animation-delay': '0.6s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <img 
            src="/footer-logo.png" 
            alt="Mehaal.Tech" 
            class="h-6 md:h-8 w-auto"
          />
        </div>
        
        {/* Footer links - slides in from right */}
        <nav 
          class="slide-in-right" 
          style={{ 'animation-delay': '0.8s', opacity: 0, 'animation-fill-mode': 'forwards' }}
          aria-label="Footer navigation"
        >
          <ul class="flex gap-4 md:gap-6 items-center text-xs text-gray-400">
            <li>
              <a href="/privacy" class="hover:text-brand-primary transition-colors focus-trap">
                Privacy
              </a>
            </li>
            <li>
              <a href="/terms" class="hover:text-brand-primary transition-colors focus-trap">
                Terms
              </a>
            </li>
            <li>
              <a href="/contact" class="hover:text-brand-primary transition-colors focus-trap">
                Contact
              </a>
            </li>
            <li class="text-gray-500 hidden sm:block">
              © 2026 Mehaal.Tech. All rights reserved.
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
