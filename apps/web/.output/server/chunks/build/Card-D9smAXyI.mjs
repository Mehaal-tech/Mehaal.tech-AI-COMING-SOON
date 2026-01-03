import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { Show } from 'solid-js';

var l = ["<h3", ' class="text-lg font-semibold text-white">', "</h3>"], a = ["<div", ' class="flex items-center gap-2">', "</div>"], c = ["<div", ' class="flex items-center justify-between px-6 py-4 border-b border-gray-800"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"], s = ["<div", ' class="', '"><!--$-->', '<!--/--><div class="p-6">', "</div></div>"];
function g(e) {
  return ssr(s, ssrHydrationKey(), `bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm ${escape(e.class, true) || ""}`, escape(createComponent(Show, { get when() {
    return e.title || e.actions;
  }, get children() {
    return ssr(c, ssrHydrationKey(), escape(createComponent(Show, { get when() {
      return e.title;
    }, get children() {
      return ssr(l, ssrHydrationKey(), escape(e.title));
    } })), escape(createComponent(Show, { get when() {
      return e.actions;
    }, get children() {
      return ssr(a, ssrHydrationKey(), escape(e.actions));
    } })));
  } })), escape(e.children));
}

export { g };
//# sourceMappingURL=Card-D9smAXyI.mjs.map
