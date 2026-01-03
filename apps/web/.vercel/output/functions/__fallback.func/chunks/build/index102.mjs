import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { g as g$1 } from './Card-D9smAXyI2.mjs';
import { y, $ } from './Topbar-UAezHi7t2.mjs';
import 'solid-js';

var c = ["<div", ' class="text-center"><div class="text-3xl font-bold text-brand-primary mb-2">48</div><div class="text-sm text-gray-400">Total Referrals</div></div>'], m = ["<div", ' class="text-center"><div class="text-3xl font-bold text-green-500 mb-2">32</div><div class="text-sm text-gray-400">Active Clients</div></div>'], v = ["<div", ' class="text-center"><div class="text-3xl font-bold text-blue-500 mb-2">$4.8K</div><div class="text-sm text-gray-400">This Month</div></div>'], x = ["<div", ' class="text-center"><div class="text-3xl font-bold text-purple-500 mb-2">$28K</div><div class="text-sm text-gray-400">Total Earned</div></div>'], g = ["<div", ' class="space-y-3"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], b = ["<div", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--><div class="pt-4 border-t border-gray-800">', "</div></div>"], u = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></main></div></div>"], f = ["<div", ' class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"><div><div class="text-sm text-white">', '</div><div class="text-xs text-gray-500">', '</div></div><span class="', '">', "</span></div>"], h = ["<div", ' class="flex items-center justify-between"><span class="', '">', '</span><span class="', '">', "</span></div>"];
function C() {
  const s = [{ id: "overview", label: "Overview", href: "/dashboard/partner" }, { id: "referrals", label: "Referrals", href: "/dashboard/partner/referrals" }, { id: "commissions", label: "Commissions", href: "/dashboard/partner/commissions" }, { id: "resources", label: "Resources", href: "/dashboard/partner/resources" }];
  return ssr(u, ssrHydrationKey(), escape(createComponent(y, { items: s, activeItem: "overview" })), escape(createComponent($, { title: "Partner Dashboard", user: { name: "Partner User", role: "Partner" } })), escape(createComponent(g$1, { get children() {
    return ssr(c, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(m, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(v, ssrHydrationKey());
  } })), escape(createComponent(g$1, { get children() {
    return ssr(x, ssrHydrationKey());
  } })), escape(createComponent(g$1, { title: "Recent Referrals", get children() {
    return ssr(g, ssrHydrationKey(), escape(createComponent(d, { name: "Acme Corp", date: "2 days ago", status: "Active" })), escape(createComponent(d, { name: "Tech Solutions", date: "5 days ago", status: "Active" })), escape(createComponent(d, { name: "StartUp Inc", date: "1 week ago", status: "Pending" })));
  } })), escape(createComponent(g$1, { title: "Commission Breakdown", get children() {
    return ssr(b, ssrHydrationKey(), escape(createComponent(l, { label: "Base Commission", amount: "$3,200" })), escape(createComponent(l, { label: "Bonus", amount: "$1,200" })), escape(createComponent(l, { label: "Recurring", amount: "$400" })), escape(createComponent(l, { label: "Total", amount: "$4,800", highlight: true })));
  } })));
}
function d(s) {
  return ssr(f, ssrHydrationKey(), escape(s.name), escape(s.date), `px-2 py-1 rounded-full text-xs ${s.status === "Active" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`, escape(s.status));
}
function l(s) {
  return ssr(h, ssrHydrationKey(), `text-sm ${s.highlight ? "text-white font-semibold" : "text-gray-400"}`, escape(s.label), `text-sm font-semibold ${s.highlight ? "text-brand-primary text-lg" : "text-white"}`, escape(s.amount));
}

export { C as default };
//# sourceMappingURL=index102.mjs.map
