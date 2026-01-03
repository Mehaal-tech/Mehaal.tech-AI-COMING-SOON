import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { g } from './Card-D9smAXyI.mjs';
import { y, $ as $$1 } from './Topbar-UAezHi7t.mjs';
import 'solid-js';

var o = ["<div", ' class="text-center"><div class="text-3xl font-bold text-brand-primary mb-2">12</div><div class="text-sm text-gray-400">Total Locations</div></div>'], c = ["<div", ' class="text-center"><div class="text-3xl font-bold text-green-500 mb-2">$45K</div><div class="text-sm text-gray-400">Monthly Revenue</div></div>'], v = ["<div", ' class="text-center"><div class="text-3xl font-bold text-blue-500 mb-2">89%</div><div class="text-sm text-gray-400">Customer Satisfaction</div></div>'], m = ["<div", ' class="text-center"><div class="text-3xl font-bold text-purple-500 mb-2">156</div><div class="text-sm text-gray-400">Staff Members</div></div>'], x = ["<div", ' class="space-y-3"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], f = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div><!--$-->", "<!--/--></main></div></div>"], h = ["<div", ' class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"><div><div class="text-sm text-white">', '</div><div class="text-xs text-gray-500">Revenue: <!--$-->', '<!--/--></div></div><span class="text-sm font-semibold text-green-500">', "</span></div>"];
function $() {
  const i = [{ id: "overview", label: "Overview", href: "/dashboard/franchise" }, { id: "locations", label: "Locations", href: "/dashboard/franchise/locations" }, { id: "performance", label: "Performance", href: "/dashboard/franchise/performance" }, { id: "inventory", label: "Inventory", href: "/dashboard/franchise/inventory" }];
  return ssr(f, ssrHydrationKey(), escape(createComponent(y, { items: i, activeItem: "overview" })), escape(createComponent($$1, { title: "Franchise Dashboard", user: { name: "Franchise Owner", role: "Franchise" } })), escape(createComponent(g, { get children() {
    return ssr(o, ssrHydrationKey());
  } })), escape(createComponent(g, { get children() {
    return ssr(c, ssrHydrationKey());
  } })), escape(createComponent(g, { get children() {
    return ssr(v, ssrHydrationKey());
  } })), escape(createComponent(g, { get children() {
    return ssr(m, ssrHydrationKey());
  } })), escape(createComponent(g, { title: "Top Performing Locations", get children() {
    return ssr(x, ssrHydrationKey(), escape(createComponent(n, { name: "Downtown Branch", revenue: "$8.5K", growth: "+12%" })), escape(createComponent(n, { name: "Mall Location", revenue: "$7.2K", growth: "+8%" })), escape(createComponent(n, { name: "Airport Branch", revenue: "$6.8K", growth: "+15%" })));
  } })));
}
function n(i) {
  return ssr(h, ssrHydrationKey(), escape(i.name), escape(i.revenue), escape(i.growth));
}

export { $ as default };
//# sourceMappingURL=index7.mjs.map
