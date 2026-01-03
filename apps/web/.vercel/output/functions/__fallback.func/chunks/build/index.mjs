import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec.mjs';
import { createSignal, For } from 'solid-js';
import { g } from './Card-D9smAXyI.mjs';
import { y, $ } from './Topbar-UAezHi7t.mjs';

var u = ["<div", ' class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">', "</div>"], v = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6">', "</main></div></div>"], f = ["<div", ' class="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all"><img', ' class="w-full h-full object-cover"><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2"><div class="text-xs text-white text-center font-medium truncate w-full">', '</div><div class="text-xs text-gray-400">', "</div></div></div>"];
function M() {
  const [l] = createSignal([{ id: 1, name: "hero-image.jpg", size: "2.4 MB", type: "image", url: "/placeholder.jpg" }, { id: 2, name: "logo.svg", size: "45 KB", type: "image", url: "/icon.svg" }, { id: 3, name: "background.png", size: "1.8 MB", type: "image", url: "/body-bg.png" }]), o = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr(v, ssrHydrationKey(), escape(createComponent(y, { items: o, activeItem: "media" })), escape(createComponent($, { title: "CMS - Media Library", user: { name: "Admin", role: "Owner" }, get actions() {
    return createComponent(h, { children: "+ Upload" });
  } })), escape(createComponent(g, { get children() {
    return ssr(u, ssrHydrationKey(), escape(createComponent(For, { get each() {
      return l();
    }, children: (i) => ssr(f, ssrHydrationKey(), ssrAttribute("src", escape(i.url, true), false) + ssrAttribute("alt", escape(i.name, true), false), escape(i.name), escape(i.size)) })));
  } })));
}

export { M as default };
//# sourceMappingURL=index.mjs.map
