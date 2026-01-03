export function Footer() {
  return (
    <footer 
      class="relative h-24 overflow-hidden mt-auto"
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
      
      {/* Footer content */}
      <div class="relative z-10 h-full container-center flex items-center justify-between">
        {/* Footer logo - emerges from bottom */}
        <div class="emerge" style={{ 'animation-delay': '0.6s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <img 
            src="/footer-logo.png" 
            alt="Mehaal.Tech" 
            class="h-8 w-auto"
          />
        </div>
        
        {/* Footer links - slides in from right */}
        <div class="slide-in-right" style={{ 'animation-delay': '0.8s', opacity: 0, 'animation-fill-mode': 'forwards' }}>
          <ul class="flex gap-6 items-center text-xs text-gray-400">
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                Terms
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-brand-primary transition-colors">
                Contact
              </a>
            </li>
            <li class="text-gray-500">
              © 2026 Mehaal.Tech. All rights reserved.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
