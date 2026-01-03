import { Sidebar, Topbar, Card } from '@ui/kit';

export default function FranchiseDashboard() {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', href: '/dashboard/franchise' },
    { id: 'locations', label: 'Locations', href: '/dashboard/franchise/locations' },
    { id: 'performance', label: 'Performance', href: '/dashboard/franchise/performance' },
    { id: 'inventory', label: 'Inventory', href: '/dashboard/franchise/inventory' },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="overview" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Franchise Dashboard" 
          user={{ name: 'Franchise Owner', role: 'Franchise' }}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-brand-primary mb-2">12</div>
                <div class="text-sm text-gray-400">Total Locations</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-500 mb-2">$45K</div>
                <div class="text-sm text-gray-400">Monthly Revenue</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-500 mb-2">89%</div>
                <div class="text-sm text-gray-400">Customer Satisfaction</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-500 mb-2">156</div>
                <div class="text-sm text-gray-400">Staff Members</div>
              </div>
            </Card>
          </div>
          
          <Card title="Top Performing Locations">
            <div class="space-y-3">
              <LocationItem name="Downtown Branch" revenue="$8.5K" growth="+12%" />
              <LocationItem name="Mall Location" revenue="$7.2K" growth="+8%" />
              <LocationItem name="Airport Branch" revenue="$6.8K" growth="+15%" />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

function LocationItem(props: { name: string; revenue: string; growth: string }) {
  return (
    <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div>
        <div class="text-sm text-white">{props.name}</div>
        <div class="text-xs text-gray-500">Revenue: {props.revenue}</div>
      </div>
      <span class="text-sm font-semibold text-green-500">{props.growth}</span>
    </div>
  );
}
