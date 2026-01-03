import { Sidebar, Topbar, Card, Button, Input, Select } from '@ui/kit';
import { createSignal } from 'solid-js';

export default function CMSSettings() {
  const [siteName, setSiteName] = createSignal('Mehaal.Tech AI');
  const [siteUrl, setSiteUrl] = createSignal('https://mehaal.tech');
  const [theme, setTheme] = createSignal('default');
  const [saving, setSaving] = createSignal(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Settings saved');
    setSaving(false);
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
      <Sidebar items={sidebarItems} activeItem="settings" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="CMS - Settings" 
          user={{ name: 'Admin', role: 'Owner' }}
          actions={
            <Button onClick={handleSave} loading={saving()}>
              Save Changes
            </Button>
          }
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-3xl space-y-6">
            <Card title="General Settings">
              <div class="space-y-4">
                <Input
                  label="Site Name"
                  value={siteName()}
                  onInput={setSiteName}
                />
                
                <Input
                  label="Site URL"
                  type="url"
                  value={siteUrl()}
                  onInput={setSiteUrl}
                />
                
                <Select
                  label="Theme"
                  options={[
                    { value: 'default', label: 'Default Theme' },
                    { value: 'tenant-1', label: 'Tenant Theme 1' },
                    { value: 'tenant-2', label: 'Tenant Theme 2' },
                  ]}
                  value={theme()}
                  onChange={setTheme}
                />
              </div>
            </Card>
            
            <Card title="AI Configuration">
              <div class="space-y-4">
                <Input
                  label="OpenAI API Key"
                  type="password"
                  placeholder="sk-..."
                />
                
                <Select
                  label="Default Model"
                  options={[
                    { value: 'gpt-4', label: 'GPT-4' },
                    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                  ]}
                  value="gpt-4"
                />
                
                <Input
                  label="Voice ID"
                  placeholder="alloy"
                />
              </div>
            </Card>
            
            <Card title="Email Settings">
              <div class="space-y-4">
                <Input
                  label="SMTP Host"
                  placeholder="smtp.example.com"
                />
                
                <Input
                  label="SMTP Port"
                  type="number"
                  placeholder="587"
                />
                
                <Input
                  label="From Email"
                  type="email"
                  placeholder="noreply@mehaal.tech"
                />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
