import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { g as g$1 } from './Card-D9smAXyI.mjs';
import { y as y$1, $ } from './Topbar-UAezHi7t.mjs';
import 'solid-js';

var v = ["<div", ' class="text-center"><div class="text-3xl font-bold text-brand-primary mb-2">247</div><div class="text-sm text-gray-400">Total Tenants</div></div>'], m = ["<div", ' class="text-center"><div class="text-3xl font-bold text-green-500 mb-2">$124K</div><div class="text-sm text-gray-400">Monthly Revenue</div></div>'], g = ["<div", ' class="text-center"><div class="text-3xl font-bold text-blue-500 mb-2">98.5%</div><div class="text-sm text-gray-400">Uptime</div></div>'], u = ["<div", ' class="text-center"><div class="text-3xl font-bold text-purple-500 mb-2">1.2M</div><div class="text-sm text-gray-400">API Requests</div></div>'], x = ["<div", ' class="space-y-3"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], b = ["<div", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], f = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></main></div></div>"], p = ["<div", ' class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"><div class="', '"></div><div class="flex-1"><div class="text-sm text-white">', '</div><div class="text-xs text-gray-500">', "</div></div></div>"], y = ["<div", ' class="flex items-center justify-between"><span class="text-sm text-gray-400">', '</span><span class="', '">', "</span></div>"];
function A() {
  const s = [{ id: "overview", label: "Overview", href: "/dashboard/owner" }, { id: "analytics", label: "Analytics", href: "/dashboard/owner/analytics" }, { id: "tenants", label: "Tenants", href: "/dashboard/owner/tenants" }, { id: "revenue", label: "Revenue", href: "/dashboard/owner/revenue" }, { id: "settings", label: "Settings", href: "/dashboard/owner/settings" }];
  return ssr(f, ssrHydrationKey(), escape(createComponent(y$1, { items: s, activeItem: "overview" })), escape(createComponent($, { title: "Owner Dashboard", user: { name: "Admin User", role: "Owner" } })), escape(createComponent(g$1, { get children() {
    return ssr(v, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(m, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(g, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(u, ssrHydrationKey());
  } })), escape(createComponent(g$1, { title: "Recent Activity", get children() {
    return ssr(x, ssrHydrationKey(), escape(createComponent(n, { title: "New tenant registered", time: "2 minutes ago", type: "success" })), escape(createComponent(n, { title: "Payment received", time: "15 minutes ago", type: "success" })), escape(createComponent(n, { title: "System maintenance scheduled", time: "1 hour ago", type: "warning" })));
  } })), escape(createComponent(g$1, { title: "System Health", get children() {
    return ssr(b, ssrHydrationKey(), escape(createComponent(r, { label: "API Response Time", value: "125ms", status: "good" })), escape(createComponent(r, { label: "Database Load", value: "45%", status: "good" })), escape(createComponent(r, { label: "Storage Usage", value: "67%", status: "warning" })), escape(createComponent(r, { label: "CPU Usage", value: "32%", status: "good" })));
  } })));
}
function n(s) {
  const d = { success: "bg-green-500", warning: "bg-yellow-500", error: "bg-red-500" };
  return ssr(p, ssrHydrationKey(), `w-2 h-2 rounded-full ${escape(d[s.type], true)}`, escape(s.title), escape(s.time));
}
function r(s) {
  const d = { good: "text-green-500", warning: "text-yellow-500", error: "text-red-500" };
  return ssr(y, ssrHydrationKey(), escape(s.label), `text-sm font-semibold ${escape(d[s.status], true)}`, escape(s.value));
}

export { A as default };
//# sourceMappingURL=index9.mjs.map
