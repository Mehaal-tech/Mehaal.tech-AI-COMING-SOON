import { Sidebar, Topbar, Card, Button, Table } from '@ui/kit';
import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';

export default function CMSPages() {
  const navigate = useNavigate();
  const [pages, setPages] = createSignal([
    { id: 1, title: 'Home', slug: '/', status: 'Published', updated: '2 hours ago' },
    { id: 2, title: 'About', slug: '/about', status: 'Published', updated: '1 day ago' },
    { id: 3, title: 'Services', slug: '/services', status: 'Draft', updated: '3 days ago' },
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
      <Sidebar items={sidebarItems} activeItem="pages" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="CMS - Pages" 
          user={{ name: 'Admin', role: 'Owner' }}
          actions={
            <Button onClick={() => navigate('/cms/pages/new')}>
              + New Page
            </Button>
          }
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <Card>
            <Table
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'slug', label: 'Slug', render: (val) => (
                  <code class="px-2 py-1 bg-gray-800 rounded text-brand-primary text-xs">
                    {String(val)}
                  </code>
                )},
                { key: 'status', label: 'Status', render: (val) => (
                  <span class={`px-2 py-1 rounded-full text-xs ${
                    val === 'Published' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {String(val)}
                  </span>
                )},
                { key: 'updated', label: 'Last Updated' },
              ]}
              data={pages()}
              onRowClick={(page) => navigate(`/cms/pages/${page.id}`)}
              emptyMessage="No pages found. Create your first page!"
            />
          </Card>
        </main>
      </div>
    </div>
  );
}
