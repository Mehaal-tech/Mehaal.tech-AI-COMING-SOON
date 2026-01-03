import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { createSignal, Show, For } from 'solid-js';

var b = ["<label", ' class="block text-sm font-medium text-gray-300 mb-1.5">', "</label>"], g = ["<div", ' class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">', "</div>"], f = ["<div", ' class="', '"><!--$-->', '<!--/--><button type="button"', ' class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"><span', ">", '</span><svg class="', '" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button><!--$-->', "<!--/--></div>"], m = ["<button", ' type="button" class="', '">', "</button>"];
function w(e) {
  var _a;
  const [o, y] = createSignal(false), s = () => e.options.find((r) => r.value === e.value);
  return ssr(f, ssrHydrationKey(), `relative ${escape(e.class, true) || ""}`, escape(createComponent(Show, { get when() {
    return e.label;
  }, get children() {
    return ssr(b, ssrHydrationKey(), escape(e.label));
  } })), ssrAttribute("disabled", e.disabled, true), ssrAttribute("class", s() ? "" : "text-gray-500", false), escape((_a = s()) == null ? void 0 : _a.label) || escape(e.placeholder) || "Select...", `w-5 h-5 text-gray-400 transition-transform ${o() ? "rotate-180" : ""}`, escape(createComponent(Show, { get when() {
    return o();
  }, get children() {
    return ssr(g, ssrHydrationKey(), escape(createComponent(For, { get each() {
      return e.options;
    }, children: (r) => ssr(m, ssrHydrationKey(), `w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors ${r.value === e.value ? "bg-brand-primary" : ""}`, escape(r.label)) })));
  } })));
}

export { w };
//# sourceMappingURL=Select-DpfdCahF2.mjs.map
