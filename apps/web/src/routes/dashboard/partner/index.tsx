import { Sidebar, Topbar, Card } from '@ui/kit';

export default function PartnerDashboard() {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', href: '/dashboard/partner' },
    { id: 'referrals', label: 'Referrals', href: '/dashboard/partner/referrals' },
    { id: 'commissions', label: 'Commissions', href: '/dashboard/partner/commissions' },
    { id: 'resources', label: 'Resources', href: '/dashboard/partner/resources' },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="overview" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Partner Dashboard" 
          user={{ name: 'Partner User', role: 'Partner' }}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-brand-primary mb-2">48</div>
                <div class="text-sm text-gray-400">Total Referrals</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-500 mb-2">32</div>
                <div class="text-sm text-gray-400">Active Clients</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-500 mb-2">$4.8K</div>
                <div class="text-sm text-gray-400">This Month</div>
              </div>
            </Card>
            
            <Card>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-500 mb-2">$28K</div>
                <div class="text-sm text-gray-400">Total Earned</div>
              </div>
            </Card>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Recent Referrals">
              <div class="space-y-3">
                <ReferralItem name="Acme Corp" date="2 days ago" status="Active" />
                <ReferralItem name="Tech Solutions" date="5 days ago" status="Active" />
                <ReferralItem name="StartUp Inc" date="1 week ago" status="Pending" />
              </div>
            </Card>
            
            <Card title="Commission Breakdown">
              <div class="space-y-4">
                <CommissionItem label="Base Commission" amount="$3,200" />
                <CommissionItem label="Bonus" amount="$1,200" />
                <CommissionItem label="Recurring" amount="$400" />
                <div class="pt-4 border-t border-gray-800">
                  <CommissionItem label="Total" amount="$4,800" highlight />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function ReferralItem(props: { name: string; date: string; status: string }) {
  return (
    <div class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div>
        <div class="text-sm text-white">{props.name}</div>
        <div class="text-xs text-gray-500">{props.date}</div>
      </div>
      <span class={`px-2 py-1 rounded-full text-xs ${
        props.status === 'Active' 
          ? 'bg-green-500/20 text-green-500' 
          : 'bg-yellow-500/20 text-yellow-500'
      }`}>
        {props.status}
      </span>
    </div>
  );
}

function CommissionItem(props: { label: string; amount: string; highlight?: boolean }) {
  return (
    <div class="flex items-center justify-between">
      <span class={`text-sm ${props.highlight ? 'text-white font-semibold' : 'text-gray-400'}`}>
        {props.label}
      </span>
      <span class={`text-sm font-semibold ${props.highlight ? 'text-brand-primary text-lg' : 'text-white'}`}>
        {props.amount}
      </span>
    </div>
  );
}
