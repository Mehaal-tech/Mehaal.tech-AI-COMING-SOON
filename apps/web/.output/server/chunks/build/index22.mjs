import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec2.mjs';
import { createSignal } from 'solid-js';
import { g } from './Card-D9smAXyI2.mjs';
import { y as y$1, $ as $$1 } from './Topbar-UAezHi7t2.mjs';
import { f as f$1 } from './Table-BWC7UuMQ2.mjs';
import { q as qe } from './routing-0hP7Sh6N.mjs';

var f = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6">', "</main></div></div>"], b = ["<code", ' class="px-2 py-1 bg-gray-800 rounded text-brand-primary text-xs">', "</code>"], y = ["<span", ' class="', '">', "</span>"];
function $() {
  const i = qe(), [l, x] = createSignal([{ id: 1, title: "Home", slug: "/", status: "Published", updated: "2 hours ago" }, { id: 2, title: "About", slug: "/about", status: "Published", updated: "1 day ago" }, { id: 3, title: "Services", slug: "/services", status: "Draft", updated: "3 days ago" }]), d = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr(f, ssrHydrationKey(), escape(createComponent(y$1, { items: d, activeItem: "pages" })), escape(createComponent($$1, { title: "CMS - Pages", user: { name: "Admin", role: "Owner" }, get actions() {
    return createComponent(h, { onClick: () => i("/cms/pages/new"), children: "+ New Page" });
  } })), escape(createComponent(g, { get children() {
    return createComponent(f$1, { columns: [{ key: "title", label: "Title" }, { key: "slug", label: "Slug", render: (e) => ssr(b, ssrHydrationKey(), escape(String(e))) }, { key: "status", label: "Status", render: (e) => ssr(y, ssrHydrationKey(), `px-2 py-1 rounded-full text-xs ${e === "Published" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`, escape(String(e))) }, { key: "updated", label: "Last Updated" }], get data() {
      return l();
    }, onRowClick: (e) => i(`/cms/pages/${e.id}`), emptyMessage: "No pages found. Create your first page!" });
  } })));
}

export { $ as default };
//# sourceMappingURL=index22.mjs.map
