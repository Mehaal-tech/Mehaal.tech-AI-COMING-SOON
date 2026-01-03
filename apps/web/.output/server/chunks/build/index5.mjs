import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec.mjs';
import { b } from './Input-0sOzVmib.mjs';
import { g } from './Card-D9smAXyI.mjs';
import { createSignal } from 'solid-js';
import { y, $ as $$1 } from './Topbar-UAezHi7t.mjs';
import { w } from './Select-DpfdCahF.mjs';

var n = ["<div", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div>"], $ = ["<div", ' class="flex h-screen bg-black"><!--$-->', '<!--/--><div class="flex-1 flex flex-col overflow-hidden"><!--$-->', '<!--/--><main class="flex-1 overflow-y-auto p-6"><div class="max-w-3xl space-y-6"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></div></main></div></div>"];
function D() {
  const [c, p] = createSignal("Mehaal.Tech AI"), [d, u] = createSignal("https://mehaal.tech"), [g$1, h$1] = createSignal("default"), [v, o] = createSignal(false), f = async () => {
    o(true), await new Promise((S) => setTimeout(S, 1e3)), console.log("Settings saved"), o(false);
  }, b$1 = [{ id: "pages", label: "Pages", href: "/cms/pages" }, { id: "services", label: "Services", href: "/cms/services" }, { id: "pricing", label: "Pricing", href: "/cms/pricing" }, { id: "media", label: "Media", href: "/cms/media" }, { id: "settings", label: "Settings", href: "/cms/settings" }];
  return ssr($, ssrHydrationKey(), escape(createComponent(y, { items: b$1, activeItem: "settings" })), escape(createComponent($$1, { title: "CMS - Settings", user: { name: "Admin", role: "Owner" }, get actions() {
    return createComponent(h, { onClick: f, get loading() {
      return v();
    }, children: "Save Changes" });
  } })), escape(createComponent(g, { title: "General Settings", get children() {
    return ssr(n, ssrHydrationKey(), escape(createComponent(b, { label: "Site Name", get value() {
      return c();
    }, onInput: p })), escape(createComponent(b, { label: "Site URL", type: "url", get value() {
      return d();
    }, onInput: u })), escape(createComponent(w, { label: "Theme", options: [{ value: "default", label: "Default Theme" }, { value: "tenant-1", label: "Tenant Theme 1" }, { value: "tenant-2", label: "Tenant Theme 2" }], get value() {
      return g$1();
    }, onChange: h$1 })));
  } })), escape(createComponent(g, { title: "AI Configuration", get children() {
    return ssr(n, ssrHydrationKey(), escape(createComponent(b, { label: "OpenAI API Key", type: "password", placeholder: "sk-..." })), escape(createComponent(w, { label: "Default Model", options: [{ value: "gpt-4", label: "GPT-4" }, { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }], value: "gpt-4" })), escape(createComponent(b, { label: "Voice ID", placeholder: "alloy" })));
  } })), escape(createComponent(g, { title: "Email Settings", get children() {
    return ssr(n, ssrHydrationKey(), escape(createComponent(b, { label: "SMTP Host", placeholder: "smtp.example.com" })), escape(createComponent(b, { label: "SMTP Port", type: "number", placeholder: "587" })), escape(createComponent(b, { label: "From Email", type: "email", placeholder: "noreply@mehaal.tech" })));
  } })));
}

export { D as default };
//# sourceMappingURL=index5.mjs.map
