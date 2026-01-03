import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { g } from './Card-D9smAXyI2.mjs';
import { y, $ } from './Topbar-UAezHi7t2.mjs';
import { f } from './Table-BWC7UuMQ2.mjs';
import 'solid-js';

var p = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6">', "</main></div></div>"], c = ["<span", ' class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">', "</span>"];
function h() {
  const o = [{ id: "overview", label: "Overview", href: "/dashboard/management" }, { id: "projects", label: "Projects", href: "/dashboard/management/projects" }, { id: "team", label: "Team", href: "/dashboard/management/team" }, { id: "reports", label: "Reports", href: "/dashboard/management/reports" }], n = [{ id: 1, name: "Project Alpha", status: "Active", progress: 75, team: 8 }, { id: 2, name: "Project Beta", status: "Active", progress: 45, team: 5 }, { id: 3, name: "Project Gamma", status: "Planning", progress: 10, team: 3 }];
  return ssr(p, ssrHydrationKey(), escape(createComponent(y, { items: o, activeItem: "overview" })), escape(createComponent($, { title: "Management Dashboard", user: { name: "Manager User", role: "Management" } })), escape(createComponent(g, { title: "Active Projects", get children() {
    return createComponent(f, { columns: [{ key: "name", label: "Project Name" }, { key: "status", label: "Status", render: (r) => ssr(c, ssrHydrationKey(), escape(String(r))) }, { key: "progress", label: "Progress", render: (r) => `${r}%` }, { key: "team", label: "Team Size" }], data: n, emptyMessage: "No projects found" });
  } })));
}

export { h as default };
//# sourceMappingURL=index82.mjs.map
