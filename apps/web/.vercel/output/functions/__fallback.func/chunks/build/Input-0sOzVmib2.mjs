import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { Show } from 'solid-js';

var u = ["<span", ' class="text-red-500 ml-1">*</span>'], s = ["<label", ' class="text-sm font-medium text-gray-300"><!--$-->', "<!--/--><!--$-->", "<!--/--></label>"], i = ["<span", ' class="text-sm text-red-500">', "</span>"], c = ["<div", ' class="', '"><!--$-->', "<!--/--><input", "", "", ' class="', '"><!--$-->', "<!--/--></div>"];
function b(e) {
  return ssr(c, ssrHydrationKey(), `flex flex-col gap-1.5 ${escape(e.class, true) || ""}`, escape(createComponent(Show, { get when() {
    return e.label;
  }, get children() {
    return ssr(s, ssrHydrationKey(), escape(e.label), escape(createComponent(Show, { get when() {
      return e.required;
    }, get children() {
      return ssr(u, ssrHydrationKey());
    } })));
  } })), ssrAttribute("type", escape(e.type, true) || "text", false) + ssrAttribute("placeholder", escape(e.placeholder, true), false) + ssrAttribute("value", escape(e.value, true), false), ssrAttribute("disabled", e.disabled, true), ssrAttribute("required", e.required, true), `px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${e.error ? "border-red-500 focus:ring-red-500" : ""}`, escape(createComponent(Show, { get when() {
    return e.error;
  }, get children() {
    return ssr(i, ssrHydrationKey(), escape(e.error));
  } })));
}

export { b };
//# sourceMappingURL=Input-0sOzVmib2.mjs.map
