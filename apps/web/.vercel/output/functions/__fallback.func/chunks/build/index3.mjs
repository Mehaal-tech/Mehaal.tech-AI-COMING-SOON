import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec.mjs';
import { createSignal } from 'solid-js';
import { g as g$1 } from './Card-D9smAXyI.mjs';
import { y as y$1, $ } from './Topbar-UAezHi7t.mjs';

var v = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-1 md:grid-cols-3 gap-6">', "</div></main></div></div>"], f = ["<div", ' class="space-y-4"><div><div class="text-4xl font-bold text-brand-primary mb-2">$<!--$-->', '<!--/--><span class="text-base text-gray-400 font-normal">/mo</span></div></div><div class="space-y-2">', "</div><!--$-->", "<!--/--></div>"], g = ["<div", ' class="flex items-center gap-2 text-sm text-gray-300"><svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><!--$-->', "<!--/--></div>"];
function y() {
  const [t] = createSignal([{ name: "Starter", price: 29, features: ["Basic AI", "1 User", "10GB Storage"] }, { name: "Pro", price: 99, features: ["Advanced AI", "10 Users", "100GB Storage", "Priority Support"] }, { name: "Enterprise", price: 299, features: ["Custom AI", "Unlimited Users", "1TB Storage", "24/7 Support", "SLA"] }]), l = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr(v, ssrHydrationKey(), escape(createComponent(y$1, { items: l, activeItem: "pricing" })), escape(createComponent($, { title: "CMS - Pricing", user: { name: "Admin", role: "Owner" } })), escape(t().map((i) => createComponent(g$1, { get title() {
    return i.name;
  }, get children() {
    return ssr(f, ssrHydrationKey(), escape(i.price), escape(i.features.map((c) => ssr(g, ssrHydrationKey(), escape(c)))), escape(createComponent(h, { variant: "outline", class: "w-full", children: "Edit Plan" })));
  } }))));
}

export { y as default };
//# sourceMappingURL=index3.mjs.map
