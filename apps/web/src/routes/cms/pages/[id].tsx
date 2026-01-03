import { Sidebar, Topbar, Card, Button, Input, Select } from '@ui/kit';
import { createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';

export default function CMSPageEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const isNew = params.id === 'new';
  
  const [title, setTitle] = createSignal('');
  const [slug, setSlug] = createSignal('');
  const [content, setContent] = createSignal('');
  const [status, setStatus] = createSignal('draft');
  const [saving, setSaving] = createSignal(false);

  const handleSave = async () => {
    setSaving(true);
    
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Saving page:', {
      title: title(),
      slug: slug(),
      content: content(),
      status: status(),
    });
    
    setSaving(false);
    navigate('/cms/pages');
  };

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
          title={isNew ? 'New Page' : 'Edit Page'}
          user={{ name: 'Admin', role: 'Owner' }}
          actions={
            <div class="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/cms/pages')}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving()}>
                Save
              </Button>
            </div>
          }
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-4xl mx-auto space-y-6">
            <Card title="Page Details">
              <div class="space-y-4">
                <Input
                  label="Title"
                  placeholder="Enter page title"
                  value={title()}
                  onInput={setTitle}
                  required
                />
                
                <Input
                  label="Slug"
                  placeholder="/page-url"
                  value={slug()}
                  onInput={setSlug}
                  required
                />
                
                <Select
                  label="Status"
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                  value={status()}
                  onChange={setStatus}
                />
              </div>
            </Card>
            
            <Card title="Content">
              <textarea
                placeholder="Enter page content (Markdown supported)"
                value={content()}
                onInput={(e) => setContent(e.currentTarget.value)}
                class="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm"
              />
            </Card>
            
            <Card title="SEO">
              <div class="space-y-4">
                <Input
                  label="Meta Title"
                  placeholder="SEO title"
                />
                
                <Input
                  label="Meta Description"
                  placeholder="SEO description"
                />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
