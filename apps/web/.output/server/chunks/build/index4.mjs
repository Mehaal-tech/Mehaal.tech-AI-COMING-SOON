import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { h as h$1 } from './Button-rjMnZ3ec.mjs';
import { createSignal } from 'solid-js';
import { g } from './Card-D9smAXyI.mjs';
import { y, $ } from './Topbar-UAezHi7t.mjs';
import { f as f$1 } from './Table-BWC7UuMQ.mjs';

var p = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6">', "</main></div></div>"], f = ["<span", ' class="', '">', "</span>"];
function h() {
  const [s] = createSignal([{ id: 1, name: "AI Voice Assistant", category: "AI", price: "$99/mo", active: true }, { id: 2, name: "CMS Platform", category: "Content", price: "$49/mo", active: true }, { id: 3, name: "Analytics Suite", category: "Analytics", price: "$79/mo", active: false }]), c = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr(p, ssrHydrationKey(), escape(createComponent(y, { items: c, activeItem: "services" })), escape(createComponent($, { title: "CMS - Services", user: { name: "Admin", role: "Owner" }, get actions() {
    return createComponent(h$1, { children: "+ New Service" });
  } })), escape(createComponent(g, { get children() {
    return createComponent(f$1, { columns: [{ key: "name", label: "Service Name" }, { key: "category", label: "Category" }, { key: "price", label: "Price" }, { key: "active", label: "Status", render: (a) => ssr(f, ssrHydrationKey(), `px-2 py-1 rounded-full text-xs ${a ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}`, a ? "Active" : "Inactive") }], get data() {
      return s();
    } });
  } })));
}

export { h as default };
//# sourceMappingURL=index4.mjs.map
