import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { For, Show } from 'solid-js';

var g = ["<tr", "><td", ' class="px-6 py-12 text-center text-gray-400"><div class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</div></td></tr>'], o = ["<tr", "><td", ' class="px-6 py-12 text-center text-gray-400">', "</td></tr>"], h = ["<div", ' class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-800/50 border-b border-gray-700"><tr>', '</tr></thead><tbody class="divide-y divide-gray-800"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></tbody></table></div>"], y = ["<th", ' class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">', "</th>"], u = ["<tr", ' class="hover:bg-gray-800/30 transition-colors cursor-pointer">', "</tr>"], m = ["<td", ' class="px-6 py-4 text-sm text-gray-300">', "</td>"];
function f(t) {
  return ssr(h, ssrHydrationKey(), escape(createComponent(For, { get each() {
    return t.columns;
  }, children: (n) => ssr(y, ssrHydrationKey(), escape(n.label)) })), escape(createComponent(Show, { get when() {
    return !t.loading && t.data.length > 0;
  }, get children() {
    return createComponent(For, { get each() {
      return t.data;
    }, children: (n) => ssr(u, ssrHydrationKey(), escape(createComponent(For, { get each() {
      return t.columns;
    }, children: (c) => ssr(m, ssrHydrationKey(), c.render ? escape(c.render(n[c.key], n)) : escape(String(n[c.key] || "-"))) }))) });
  } })), escape(createComponent(Show, { get when() {
    return t.loading;
  }, get children() {
    return ssr(g, ssrHydrationKey(), ssrAttribute("colspan", escape(t.columns.length, true), false));
  } })), escape(createComponent(Show, { get when() {
    return !t.loading && t.data.length === 0;
  }, get children() {
    return ssr(o, ssrHydrationKey(), ssrAttribute("colspan", escape(t.columns.length, true), false), escape(t.emptyMessage) || "No data available");
  } })));
}

export { f };
//# sourceMappingURL=Table-BWC7UuMQ.mjs.map
