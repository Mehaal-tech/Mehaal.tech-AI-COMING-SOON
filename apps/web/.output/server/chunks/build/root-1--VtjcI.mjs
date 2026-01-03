import { createComponent, ssr, ssrHydrationKey, escape, isServer, getRequestEvent, delegateEvents } from 'solid-js/web';
import { ErrorBoundary, Suspense, createSignal, onCleanup, children, createMemo, getOwner, sharedConfig, untrack, Show, on, createRoot } from 'solid-js';
import { c as ct$1 } from '../_/nitro.mjs';
import { L as Le, I as Ie, A as Ae, w as we, $ as $e, M as Me, a as $, C as Ce, m as me, _ as _e, J, j as je } from './routing-0hP7Sh6N.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'node:fs';
import 'solid-js/web/storage';
import 'node:path';
import 'node:crypto';

const j = (t) => (n) => {
  const { base: r } = n, a = children(() => n.children), e = createMemo(() => Le(a(), n.base || ""));
  let i;
  const c = Ie(t, e, () => i, { base: r, singleFlight: n.singleFlight, transformUrl: n.transformUrl });
  return t.create && t.create(c), createComponent(Ae.Provider, { value: c, get children() {
    return createComponent(rt, { routerState: c, get root() {
      return n.root;
    }, get preload() {
      return n.rootPreload || n.rootLoad;
    }, get children() {
      return [(i = getOwner()) && null, createComponent(at, { routerState: c, get branches() {
        return e();
      } })];
    } });
  } });
};
function rt(t) {
  const n = t.routerState.location, r = t.routerState.params, a = createMemo(() => t.preload && untrack(() => {
    t.preload({ params: r, location: n, intent: $e() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (e) => createComponent(e, { params: r, location: n, get data() {
    return a();
  }, get children() {
    return t.children;
  } }) });
}
function at(t) {
  if (isServer) {
    const e = getRequestEvent();
    if (e && e.router && e.router.dataOnly) {
      ot(e, t.routerState, t.branches);
      return;
    }
    e && ((e.router || (e.router = {})).matches || (e.router.matches = t.routerState.matches().map(({ route: i, path: c, params: f }) => ({ path: i.originalPath, pattern: i.pattern, match: c, params: f, info: i.info }))));
  }
  const n = [];
  let r;
  const a = createMemo(on(t.routerState.matches, (e, i, c) => {
    let f = i && e.length === i.length;
    const h = [];
    for (let l = 0, w = e.length; l < w; l++) {
      const b = i && i[l], g = e[l];
      c && b && g.route.key === b.route.key ? h[l] = c[l] : (f = false, n[l] && n[l](), createRoot((y) => {
        n[l] = y, h[l] = Me(t.routerState, h[l - 1] || t.routerState.base, P(() => a()[l + 1]), () => {
          var _a;
          const p = t.routerState.matches();
          return (_a = p[l]) != null ? _a : p[0];
        });
      }));
    }
    return n.splice(e.length).forEach((l) => l()), c && f ? c : (r = h[0], h);
  }));
  return P(() => a() && r)();
}
const P = (t) => () => createComponent(Show, { get when() {
  return t();
}, keyed: true, children: (n) => createComponent(Ce.Provider, { value: n, get children() {
  return n.outlet();
} }) });
function ot(t, n, r) {
  const a = new URL(t.request.url), e = $(r, new URL(t.router.previousUrl || t.request.url).pathname), i = $(r, a.pathname);
  for (let c = 0; c < i.length; c++) {
    (!e[c] || i[c].route !== e[c].route) && (t.router.dataOnly = true);
    const { route: f, params: h } = i[c];
    f.preload && f.preload({ params: h, location: n.location, intent: "preload" });
  }
}
function st([t, n], r, a) {
  return [t, a ? (e) => n(a(e)) : n];
}
function it(t) {
  let n = false;
  const r = (e) => typeof e == "string" ? { value: e } : e, a = st(createSignal(r(t.get()), { equals: (e, i) => e.value === i.value && e.state === i.state }), void 0, (e) => (!n && t.set(e), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), e));
  return t.init && onCleanup(t.init((e = t.get()) => {
    n = true, a[1](r(e)), n = false;
  })), j({ signal: a, create: t.create, utils: t.utils });
}
function ct(t, n, r) {
  return t.addEventListener(n, r), () => t.removeEventListener(n, r);
}
function ut(t, n) {
  const r = t && document.getElementById(t);
  r ? r.scrollIntoView() : n && window.scrollTo(0, 0);
}
function lt(t) {
  const n = new URL(t);
  return n.pathname + n.search;
}
function dt(t) {
  let n;
  const r = { value: t.url || (n = getRequestEvent()) && lt(n.request.url) || "" };
  return j({ signal: [() => r, (a) => Object.assign(r, a)] })(t);
}
const ht = /* @__PURE__ */ new Map();
function mt(t = true, n = false, r = "/_server", a) {
  return (e) => {
    const i = e.base.path(), c = e.navigatorFactory(e.base);
    let f, h;
    function l(o) {
      return o.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(o) {
      if (o.defaultPrevented || o.button !== 0 || o.metaKey || o.altKey || o.ctrlKey || o.shiftKey) return;
      const s = o.composedPath().find((E) => E instanceof Node && E.nodeName.toUpperCase() === "A");
      if (!s || n && !s.hasAttribute("link")) return;
      const d = l(s), u = d ? s.href.baseVal : s.href;
      if ((d ? s.target.baseVal : s.target) || !u && !s.hasAttribute("state")) return;
      const v = (s.getAttribute("rel") || "").split(/\s+/);
      if (s.hasAttribute("download") || v && v.includes("external")) return;
      const R = d ? new URL(u, document.baseURI) : new URL(u);
      if (!(R.origin !== window.location.origin || i && R.pathname && !R.pathname.toLowerCase().startsWith(i.toLowerCase()))) return [s, R];
    }
    function b(o) {
      const s = w(o);
      if (!s) return;
      const [d, u] = s, k = e.parsePath(u.pathname + u.search + u.hash), v = d.getAttribute("state");
      o.preventDefault(), c(k, { resolve: false, replace: d.hasAttribute("replace"), scroll: !d.hasAttribute("noscroll"), state: v ? JSON.parse(v) : void 0 });
    }
    function g(o) {
      const s = w(o);
      if (!s) return;
      const [d, u] = s;
      a && (u.pathname = a(u.pathname)), e.preloadRoute(u, d.getAttribute("preload") !== "false");
    }
    function y(o) {
      clearTimeout(f);
      const s = w(o);
      if (!s) return h = null;
      const [d, u] = s;
      h !== d && (a && (u.pathname = a(u.pathname)), f = setTimeout(() => {
        e.preloadRoute(u, d.getAttribute("preload") !== "false"), h = d;
      }, 20));
    }
    function p(o) {
      if (o.defaultPrevented) return;
      let s = o.submitter && o.submitter.hasAttribute("formaction") ? o.submitter.getAttribute("formaction") : o.target.getAttribute("action");
      if (!s) return;
      if (!s.startsWith("https://action/")) {
        const u = new URL(s, we);
        if (s = e.parsePath(u.pathname + u.search), !s.startsWith(r)) return;
      }
      if (o.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const d = ht.get(s);
      if (d) {
        o.preventDefault();
        const u = new FormData(o.target, o.submitter);
        d.call({ r: e, f: o.target }, o.target.enctype === "multipart/form-data" ? u : new URLSearchParams(u));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", b), t && (document.addEventListener("mousemove", y, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", p), onCleanup(() => {
      document.removeEventListener("click", b), t && (document.removeEventListener("mousemove", y), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", p);
    });
  };
}
function ft(t) {
  if (isServer) return dt(t);
  const n = () => {
    const a = window.location.pathname.replace(/^\/+/, "/") + window.location.search, e = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: a + window.location.hash, state: e };
  }, r = me();
  return it({ get: n, set({ value: a, replace: e, scroll: i, state: c }) {
    e ? window.history.replaceState(_e(c), "", a) : window.history.pushState(c, "", a), ut(decodeURIComponent(window.location.hash.slice(1)), i), J();
  }, init: (a) => ct(window, "popstate", je(a, (e) => {
    if (e) return !r.confirm(e);
    {
      const i = n();
      return !r.confirm(i.value, { state: i.state });
    }
  })), create: mt(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (a) => window.history.go(a), beforeLeave: r } })(t);
}
var gt = ["<div", ' class="min-h-screen flex items-center justify-center bg-black text-white"><div class="text-center max-w-md p-8"><h1 class="text-3xl font-bold mb-4">\u26A0\uFE0F Something went wrong</h1><p class="text-gray-400 mb-6">', '</p><button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Try Again</button></div></div>'], wt = ["<div", ' class="min-h-screen flex items-center justify-center bg-black"><div class="text-white text-xl">Loading...</div></div>'];
function kt() {
  return createComponent(ft, { root: (t) => createComponent(ErrorBoundary, { fallback: (n, r) => ssr(gt, ssrHydrationKey(), escape(n.toString())), get children() {
    return createComponent(Suspense, { get fallback() {
      return ssr(wt, ssrHydrationKey());
    }, get children() {
      return t.children;
    } });
  } }), get children() {
    return createComponent(ct$1, {});
  } });
}

export { kt as default };
//# sourceMappingURL=root-1--VtjcI.mjs.map
