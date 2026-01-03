import { Sidebar, Topbar, Card } from '@ui/kit';

export default function OwnerDashboard() {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', href: '/dashboard/owner' },
    { id: 'analytics', label: 'Analytics', href: '/dashboard/owner/analytics' },
    { id: 'tenants', label: 'Tenants', href: '/dashboard/owner/tenants' },
    { id: 'revenue', label: 'Revenue', href: '/dashboard/owner/revenue' },
    { id: 'settings', label: 'Settings', href: '/dashboard/owner/settings' },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="overview" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Owner Dashboard" 
          user={{ name: 'Admin User', role: 'Owner' }}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Stats Cards */}
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-brand-primary mb-2">247</div>
                <div class="text-sm text-gray-400">Total Tenants</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-500 mb-2">$124K</div>
                <div class="text-sm text-gray-400">Monthly Revenue</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-500 mb-2">98.5%</div>
                <div class="text-sm text-gray-400">Uptime</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-500 mb-2">1.2M</div>
                <div class="text-sm text-gray-400">API Requests</div>
              </div>
            </Card>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Recent Activity">
              <div class="space-y-3">
                <ActivityItem 
                  title="New tenant registered"
                  time="2 minutes ago"
                  type="success"
                />
                <ActivityItem 
                  title="Payment received"
                  time="15 minutes ago"
                  type="success"
                />
                <ActivityItem 
                  title="System maintenance scheduled"
                  time="1 hour ago"
                  type="warning"
                />
              </div>
            </Card>
            
            <Card title="System Health">
              <div class="space-y-4">
                <HealthMetric label="API Response Time" value="125ms" status="good" />
                <HealthMetric label="Database Load" value="45%" status="good" />
                <HealthMetric label="Storage Usage" value="67%" status="warning" />
                <HealthMetric label="CPU Usage" value="32%" status="good" />
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActivityItem(props: { title: string; time: string; type: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  
  return (
    <div class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
      <div class={`w-2 h-2 rounded-full ${colors[props.type]}`} />
      <div class="flex-1">
        <div class="text-sm text-white">{props.title}</div>
        <div class="text-xs text-gray-500">{props.time}</div>
      </div>
    </div>
  );
}

function HealthMetric(props: { label: string; value: string; status: 'good' | 'warning' | 'error' }) {
  const colors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };
  
  return (
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-400">{props.label}</span>
      <span class={`text-sm font-semibold ${colors[props.status]}`}>{props.value}</span>
    </div>
  );
}
