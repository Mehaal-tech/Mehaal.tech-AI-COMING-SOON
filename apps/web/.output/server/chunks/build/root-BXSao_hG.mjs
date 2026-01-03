import { createComponent, isServer, getRequestEvent, delegateEvents } from 'solid-js/web';
import { Suspense, createSignal, onCleanup, children, createMemo, getOwner, sharedConfig, untrack, Show, on, createRoot } from 'solid-js';
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

const I = (t) => (n) => {
  const { base: o } = n, r = children(() => n.children), e = createMemo(() => Le(r(), n.base || ""));
  let i;
  const u = Ie(t, e, () => i, { base: o, singleFlight: n.singleFlight, transformUrl: n.transformUrl });
  return t.create && t.create(u), createComponent(Ae.Provider, { value: u, get children() {
    return createComponent(Z, { routerState: u, get root() {
      return n.root;
    }, get preload() {
      return n.rootPreload || n.rootLoad;
    }, get children() {
      return [(i = getOwner()) && null, createComponent(tt, { routerState: u, get branches() {
        return e();
      } })];
    } });
  } });
};
function Z(t) {
  const n = t.routerState.location, o = t.routerState.params, r = createMemo(() => t.preload && untrack(() => {
    t.preload({ params: o, location: n, intent: $e() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (e) => createComponent(e, { params: o, location: n, get data() {
    return r();
  }, get children() {
    return t.children;
  } }) });
}
function tt(t) {
  if (isServer) {
    const e = getRequestEvent();
    if (e && e.router && e.router.dataOnly) {
      et(e, t.routerState, t.branches);
      return;
    }
    e && ((e.router || (e.router = {})).matches || (e.router.matches = t.routerState.matches().map(({ route: i, path: u, params: m }) => ({ path: i.originalPath, pattern: i.pattern, match: u, params: m, info: i.info }))));
  }
  const n = [];
  let o;
  const r = createMemo(on(t.routerState.matches, (e, i, u) => {
    let m = i && e.length === i.length;
    const h = [];
    for (let l = 0, w = e.length; l < w; l++) {
      const b = i && i[l], g = e[l];
      u && b && g.route.key === b.route.key ? h[l] = u[l] : (m = false, n[l] && n[l](), createRoot((v) => {
        n[l] = v, h[l] = Me(t.routerState, h[l - 1] || t.routerState.base, C(() => r()[l + 1]), () => {
          var _a;
          const p = t.routerState.matches();
          return (_a = p[l]) != null ? _a : p[0];
        });
      }));
    }
    return n.splice(e.length).forEach((l) => l()), u && m ? u : (o = h[0], h);
  }));
  return C(() => r() && o)();
}
const C = (t) => () => createComponent(Show, { get when() {
  return t();
}, keyed: true, children: (n) => createComponent(Ce.Provider, { value: n, get children() {
  return n.outlet();
} }) });
function et(t, n, o) {
  const r = new URL(t.request.url), e = $(o, new URL(t.router.previousUrl || t.request.url).pathname), i = $(o, r.pathname);
  for (let u = 0; u < i.length; u++) {
    (!e[u] || i[u].route !== e[u].route) && (t.router.dataOnly = true);
    const { route: m, params: h } = i[u];
    m.preload && m.preload({ params: h, location: n.location, intent: "preload" });
  }
}
function nt([t, n], o, r) {
  return [t, r ? (e) => n(r(e)) : n];
}
function rt(t) {
  let n = false;
  const o = (e) => typeof e == "string" ? { value: e } : e, r = nt(createSignal(o(t.get()), { equals: (e, i) => e.value === i.value && e.state === i.state }), void 0, (e) => (!n && t.set(e), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), e));
  return t.init && onCleanup(t.init((e = t.get()) => {
    n = true, r[1](o(e)), n = false;
  })), I({ signal: r, create: t.create, utils: t.utils });
}
function ot(t, n, o) {
  return t.addEventListener(n, o), () => t.removeEventListener(n, o);
}
function at(t, n) {
  const o = t && document.getElementById(t);
  o ? o.scrollIntoView() : n && window.scrollTo(0, 0);
}
function st(t) {
  const n = new URL(t);
  return n.pathname + n.search;
}
function it(t) {
  let n;
  const o = { value: t.url || (n = getRequestEvent()) && st(n.request.url) || "" };
  return I({ signal: [() => o, (r) => Object.assign(o, r)] })(t);
}
const ut = /* @__PURE__ */ new Map();
function ct(t = true, n = false, o = "/_server", r) {
  return (e) => {
    const i = e.base.path(), u = e.navigatorFactory(e.base);
    let m, h;
    function l(a) {
      return a.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(a) {
      if (a.defaultPrevented || a.button !== 0 || a.metaKey || a.altKey || a.ctrlKey || a.shiftKey) return;
      const s = a.composedPath().find((A) => A instanceof Node && A.nodeName.toUpperCase() === "A");
      if (!s || n && !s.hasAttribute("link")) return;
      const d = l(s), c = d ? s.href.baseVal : s.href;
      if ((d ? s.target.baseVal : s.target) || !c && !s.hasAttribute("state")) return;
      const R = (s.getAttribute("rel") || "").split(/\s+/);
      if (s.hasAttribute("download") || R && R.includes("external")) return;
      const y = d ? new URL(c, document.baseURI) : new URL(c);
      if (!(y.origin !== window.location.origin || i && y.pathname && !y.pathname.toLowerCase().startsWith(i.toLowerCase()))) return [s, y];
    }
    function b(a) {
      const s = w(a);
      if (!s) return;
      const [d, c] = s, E = e.parsePath(c.pathname + c.search + c.hash), R = d.getAttribute("state");
      a.preventDefault(), u(E, { resolve: false, replace: d.hasAttribute("replace"), scroll: !d.hasAttribute("noscroll"), state: R ? JSON.parse(R) : void 0 });
    }
    function g(a) {
      const s = w(a);
      if (!s) return;
      const [d, c] = s;
      r && (c.pathname = r(c.pathname)), e.preloadRoute(c, d.getAttribute("preload") !== "false");
    }
    function v(a) {
      clearTimeout(m);
      const s = w(a);
      if (!s) return h = null;
      const [d, c] = s;
      h !== d && (r && (c.pathname = r(c.pathname)), m = setTimeout(() => {
        e.preloadRoute(c, d.getAttribute("preload") !== "false"), h = d;
      }, 20));
    }
    function p(a) {
      if (a.defaultPrevented) return;
      let s = a.submitter && a.submitter.hasAttribute("formaction") ? a.submitter.getAttribute("formaction") : a.target.getAttribute("action");
      if (!s) return;
      if (!s.startsWith("https://action/")) {
        const c = new URL(s, we);
        if (s = e.parsePath(c.pathname + c.search), !s.startsWith(o)) return;
      }
      if (a.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const d = ut.get(s);
      if (d) {
        a.preventDefault();
        const c = new FormData(a.target, a.submitter);
        d.call({ r: e, f: a.target }, a.target.enctype === "multipart/form-data" ? c : new URLSearchParams(c));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", b), t && (document.addEventListener("mousemove", v, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", p), onCleanup(() => {
      document.removeEventListener("click", b), t && (document.removeEventListener("mousemove", v), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", p);
    });
  };
}
function lt(t) {
  if (isServer) return it(t);
  const n = () => {
    const r = window.location.pathname.replace(/^\/+/, "/") + window.location.search, e = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: r + window.location.hash, state: e };
  }, o = me();
  return rt({ get: n, set({ value: r, replace: e, scroll: i, state: u }) {
    e ? window.history.replaceState(_e(u), "", r) : window.history.pushState(u, "", r), at(decodeURIComponent(window.location.hash.slice(1)), i), J();
  }, init: (r) => ot(window, "popstate", je(r, (e) => {
    if (e) return !o.confirm(e);
    {
      const i = n();
      return !o.confirm(i.value, { state: i.state });
    }
  })), create: ct(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (r) => window.history.go(r), beforeLeave: o } })(t);
}
function pt() {
  return createComponent(lt, { root: (t) => createComponent(Suspense, { get children() {
    return t.children;
  } }), get children() {
    return createComponent(ct$1, {});
  } });
}

export { pt as default };
//# sourceMappingURL=root-BXSao_hG.mjs.map
