import { Sidebar, Topbar, Card, Button } from '@ui/kit';
import { createSignal, For } from 'solid-js';

export default function CMSMedia() {
  const [files] = createSignal([
    { id: 1, name: 'hero-image.jpg', size: '2.4 MB', type: 'image', url: '/placeholder.jpg' },
    { id: 2, name: 'logo.svg', size: '45 KB', type: 'image', url: '/icon.svg' },
    { id: 3, name: 'background.png', size: '1.8 MB', type: 'image', url: '/body-bg.png' },
  ]);

  const sidebarItems = [
    { id: 'pages', label: 'Pages', href: '/cms/pages' },
    { id: 'services', label: 'Services', href: '/cms/services' },
    { id: 'pricing', label: 'Pricing', href: '/cms/pricing' },
    { id: 'media', label: 'Media', href: '/cms/media' },
    { id: 'settings', label: 'Settings', href: '/cms/settings' },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="media" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="CMS - Media Library" 
          user={{ name: 'Admin', role: 'Owner' }}
          actions={<Button>+ Upload</Button>}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <Card>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <For each={files()}>
                {(file) => (
                  <div class="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all">
                    <img 
                      src={file.url} 
                      alt={file.name}
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <div class="text-xs text-white text-center font-medium truncate w-full">
                        {file.name}
                      </div>
                      <div class="text-xs text-gray-400">
                        {file.size}
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
