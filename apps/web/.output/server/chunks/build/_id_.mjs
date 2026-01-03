import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec.mjs';
import { b } from './Input-0sOzVmib.mjs';
import { g } from './Card-D9smAXyI.mjs';
import { createSignal } from 'solid-js';
import { y, $ } from './Topbar-UAezHi7t.mjs';
import { w } from './Select-DpfdCahF.mjs';
import { i, c } from './routing-wKbSS_gE.mjs';

var T = ["<div", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], M = ["<textarea", ' placeholder="Enter page content (Markdown supported)"', ' class="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm"></textarea>'], _ = ["<div", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"], k = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="max-w-4xl mx-auto space-y-6"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div></main></div></div>"], O = ["<div", ' class="flex gap-2"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"];
function G() {
  const n = i(), m = c().id === "new", [o, v] = createSignal(""), [c$1, f] = createSignal(""), [d, D] = createSignal(""), [u, b$1] = createSignal("draft"), [h$1, p] = createSignal(false), S = async () => {
    p(true), await new Promise((x) => setTimeout(x, 1e3)), console.log("Saving page:", { title: o(), slug: c$1(), content: d(), status: u() }), p(false), n("/cms/pages");
  }, $$1 = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr(k, ssrHydrationKey(), escape(createComponent(y, { items: $$1, activeItem: "pages" })), escape(createComponent($, { title: m ? "New Page" : "Edit Page", user: { name: "Admin", role: "Owner" }, get actions() {
    return ssr(O, ssrHydrationKey(), escape(createComponent(h, { variant: "outline", onClick: () => n("/cms/pages"), children: "Cancel" })), escape(createComponent(h, { onClick: S, get loading() {
      return h$1();
    }, children: "Save" })));
  } })), escape(createComponent(g, { title: "Page Details", get children() {
    return ssr(T, ssrHydrationKey(), escape(createComponent(b, { label: "Title", placeholder: "Enter page title", get value() {
      return o();
    }, onInput: v, required: true })), escape(createComponent(b, { label: "Slug", placeholder: "/page-url", get value() {
      return c$1();
    }, onInput: f, required: true })), escape(createComponent(w, { label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }], get value() {
      return u();
    }, onChange: b$1 })));
  } })), escape(createComponent(g, { title: "Content", get children() {
    return ssr(M, ssrHydrationKey(), ssrAttribute("value", escape(d(), true), false));
  } })), escape(createComponent(g, { title: "SEO", get children() {
    return ssr(_, ssrHydrationKey(), escape(createComponent(b, { label: "Meta Title", placeholder: "SEO title" })), escape(createComponent(b, { label: "Meta Description", placeholder: "SEO description" })));
  } })));
}

export { G as default };
//# sourceMappingURL=_id_.mjs.map
