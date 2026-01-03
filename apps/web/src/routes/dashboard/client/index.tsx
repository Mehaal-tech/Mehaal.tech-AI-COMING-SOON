import { Sidebar, Topbar, Card } from '@ui/kit';

export default function ClientDashboard() {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', href: '/dashboard/client' },
    { id: 'services', label: 'My Services', href: '/dashboard/client/services' },
    { id: 'billing', label: 'Billing', href: '/dashboard/client/billing' },
    { id: 'support', label: 'Support', href: '/dashboard/client/support' },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="overview" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Client Dashboard" 
          user={{ name: 'Client User', role: 'Client' }}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-brand-primary mb-2">5</div>
                <div class="text-sm text-gray-400">Active Services</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-500 mb-2">$299</div>
                <div class="text-sm text-gray-400">Monthly Cost</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-500 mb-2">24/7</div>
                <div class="text-sm text-gray-400">Support Access</div>
              </div>
            </Card>
          </div>
          
          <Card title="Your Services">
            <div class="space-y-3">
              <ServiceItem name="AI Voice Assistant" status="Active" />
              <ServiceItem name="CMS Platform" status="Active" />
              <ServiceItem name="Analytics Dashboard" status="Active" />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

function ServiceItem(props: { name: string; status: string }) {
  return (
    <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <span class="text-sm text-white">{props.name}</span>
      <span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
        {props.status}
      </span>
    </div>
  );
}
