/**
 * Service Worker Registration
 * Provides offline support and caching capabilities
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ ServiceWorker registered:', registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('🔄 New version available! Reload to update.');
                  
                  // Optionally show update notification to user
                  if (window.confirm('New version available! Reload to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ ServiceWorker registration failed:', error);
        });
      
      // Handle service worker controlling the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 ServiceWorker controller changed');
        window.location.reload();
      });
    });
  } else {
    console.log('ℹ️ Service workers not supported');
  }
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('✅ ServiceWorker unregistered');
      })
      .catch((error) => {
        console.error('❌ ServiceWorker unregister failed:', error);
      });
  }
}

export function clearServiceWorkerCache() {
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    console.log('🗑️ ServiceWorker cache cleared');
  }
}
