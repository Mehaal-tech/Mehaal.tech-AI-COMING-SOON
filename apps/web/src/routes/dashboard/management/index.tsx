import { Sidebar, Topbar, Card, Table } from '@ui/kit';

export default function ManagementDashboard() {
  const sidebarItems = [
    { id: 'overview', label: 'Overview', href: '/dashboard/management' },
    { id: 'projects', label: 'Projects', href: '/dashboard/management/projects' },
    { id: 'team', label: 'Team', href: '/dashboard/management/team' },
    { id: 'reports', label: 'Reports', href: '/dashboard/management/reports' },
  ];

  const projects = [
    { id: 1, name: 'Project Alpha', status: 'Active', progress: 75, team: 8 },
    { id: 2, name: 'Project Beta', status: 'Active', progress: 45, team: 5 },
    { id: 3, name: 'Project Gamma', status: 'Planning', progress: 10, team: 3 },
  ];

  return (
    <div class="flex h-screen bg-black">
      <Sidebar items={sidebarItems} activeItem="overview" />
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Management Dashboard" 
          user={{ name: 'Manager User', role: 'Management' }}
        />
        
        <main class="flex-1 overflow-y-auto p-6">
          <Card title="Active Projects">
            <Table
              columns={[
                { key: 'name', label: 'Project Name' },
                { key: 'status', label: 'Status', render: (val) => (
                  <span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                    {String(val)}
                  </span>
                )},
                { key: 'progress', label: 'Progress', render: (val) => `${val}%` },
                { key: 'team', label: 'Team Size' },
              ]}
              data={projects}
              emptyMessage="No projects found"
            />
          </Card>
        </main>
      </div>
    </div>
  );
}
