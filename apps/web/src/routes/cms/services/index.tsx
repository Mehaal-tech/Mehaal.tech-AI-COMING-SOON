import { Sidebar, Topbar, Card, Button, Table } from '@ui/kit';
import { createSignal } from 'solid-js';

export default function CMSServices() {
  const [services] = createSignal([
    { id: 1, name: 'AI Voice Assistant', category: 'AI', price: '$99/mo', active: true },
    { id: 2, name: 'CMS Platform', category: 'Content', price: '$49/mo', active: true },
    { id: 3, name: 'Analytics Suite', category: 'Analytics', price: '$79/mo', active: false },
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
      <Sidebar items={sidebarItems} activeItem="services" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="CMS - Services" 
          user={{ name: 'Admin', role: 'Owner' }}
          actions={<Button>+ New Service</Button>}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <Card>
            <Table
              columns={[
                { key: 'name', label: 'Service Name' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'active', label: 'Status', render: (val) => (
                  <span class={`px-2 py-1 rounded-full text-xs ${
                    val ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {val ? 'Active' : 'Inactive'}
                  </span>
                )},
              ]}
              data={services()}
            />
          </Card>
        </main>
      </div>
    </div>
  );
}
