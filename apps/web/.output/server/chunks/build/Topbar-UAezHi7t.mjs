import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { For, Show } from 'solid-js';

var m = ["<aside", ' class="w-64 bg-gray-900/80 border-r border-gray-800 backdrop-blur-sm"><div class="flex flex-col h-full"><div class="px-6 py-5 border-b border-gray-800"><img src="/icon.svg" alt="Logo" class="h-8 w-auto"></div><nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">', "</nav></div></aside>"], u = ["<div", ' class="ml-4 mt-1 space-y-1">', "</div>"], h = ["<div", "><a", ' class="', '"><!--$-->', "<!--/--><span>", "</span></a><!--$-->", "<!--/--></div>"];
function y(e) {
  return ssr(m, ssrHydrationKey(), escape(createComponent(For, { get each() {
    return e.items;
  }, children: (l) => createComponent(d, { item: l, get active() {
    return e.activeItem === l.id;
  }, get onClick() {
    return e.onItemClick;
  } }) })));
}
function d(e) {
  return ssr(h, ssrHydrationKey(), ssrAttribute("href", escape(e.item.href, true) || "#", false), `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${e.active ? "bg-brand-primary text-white" : ""} ${e.active ? "" : "text-gray-400 hover:text-white hover:bg-gray-800"}`, escape(createComponent(Show, { get when() {
    return e.item.icon;
  }, get children() {
    return e.item.icon;
  } })), escape(e.item.label), escape(createComponent(Show, { get when() {
    return e.item.children && e.item.children.length > 0;
  }, get children() {
    return ssr(u, ssrHydrationKey(), escape(createComponent(For, { get each() {
      return e.item.children;
    }, children: (l) => createComponent(d, { item: l, active: false, get onClick() {
      return e.onClick;
    } }) })));
  } })));
}
var g = ["<h1", ' class="text-xl font-semibold text-white">', "</h1>"], o = ["<div", ' class="text-xs text-gray-400">', "</div>"], v = ["<div", ' class="flex items-center gap-3 pl-4 border-l border-gray-700"><div class="text-right"><div class="text-sm font-medium text-white">', "</div><!--$-->", '<!--/--></div><div class="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">', "</div></div>"], b = ["<header", ' class="h-16 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm"><div class="h-full px-6 flex items-center justify-between"><!--$-->', '<!--/--><div class="flex items-center gap-4"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></div></header>"];
function $(e) {
  return ssr(b, ssrHydrationKey(), escape(createComponent(Show, { get when() {
    return e.title;
  }, get children() {
    return ssr(g, ssrHydrationKey(), escape(e.title));
  } })), escape(createComponent(Show, { get when() {
    return e.actions;
  }, get children() {
    return e.actions;
  } })), escape(createComponent(Show, { get when() {
    return e.user;
  }, get children() {
    return ssr(v, ssrHydrationKey(), escape(e.user.name), escape(createComponent(Show, { get when() {
      return e.user.role;
    }, get children() {
      return ssr(o, ssrHydrationKey(), escape(e.user.role));
    } })), escape(e.user.name.charAt(0).toUpperCase()));
  } })));
}

export { $, y };
//# sourceMappingURL=Topbar-UAezHi7t.mjs.map
