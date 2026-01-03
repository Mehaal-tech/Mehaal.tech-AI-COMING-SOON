import { createComponent, ssr, ssrHydrationKey, escape, isServer, getRequestEvent, delegateEvents, useAssets, spread } from 'solid-js/web';
import { ErrorBoundary, Suspense, createContext, createUniqueId, createSignal, onCleanup, sharedConfig, useContext, createRenderEffect, children, createMemo, getOwner, untrack, Show, on, createRoot } from 'solid-js';
import { c as ct } from '../_/nitro.mjs';
import { L as Le$1, I as Ie, A as Ae$1, w as we$1, $ as $e, M as Me, a as $, C as Ce$1, m as me$1, _ as _e$1, J, j as je$1 } from './routing-0hP7Sh6N.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'solid-js/web/storage';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const F = (e) => (t) => {
  const { base: r } = t, o = children(() => t.children), n = createMemo(() => Le$1(o(), t.base || ""));
  let a;
  const i = Ie(e, n, () => a, { base: r, singleFlight: t.singleFlight, transformUrl: t.transformUrl });
  return e.create && e.create(i), createComponent(Ae$1.Provider, { value: i, get children() {
    return createComponent(me, { routerState: i, get root() {
      return t.root;
    }, get preload() {
      return t.rootPreload || t.rootLoad;
    }, get children() {
      return [(a = getOwner()) && null, createComponent(pe, { routerState: i, get branches() {
        return n();
      } })];
    } });
  } });
};
function me(e) {
  const t = e.routerState.location, r = e.routerState.params, o = createMemo(() => e.preload && untrack(() => {
    e.preload({ params: r, location: t, intent: $e() || "initial" });
  }));
  return createComponent(Show, { get when() {
    return e.root;
  }, keyed: true, get fallback() {
    return e.children;
  }, children: (n) => createComponent(n, { params: r, location: t, get data() {
    return o();
  }, get children() {
    return e.children;
  } }) });
}
function pe(e) {
  if (isServer) {
    const n = getRequestEvent();
    if (n && n.router && n.router.dataOnly) {
      ge(n, e.routerState, e.branches);
      return;
    }
    n && ((n.router || (n.router = {})).matches || (n.router.matches = e.routerState.matches().map(({ route: a, path: i, params: u }) => ({ path: a.originalPath, pattern: a.pattern, match: i, params: u, info: a.info }))));
  }
  const t = [];
  let r;
  const o = createMemo(on(e.routerState.matches, (n, a, i) => {
    let u = a && n.length === a.length;
    const h = [];
    for (let l = 0, p = n.length; l < p; l++) {
      const w = a && a[l], g = n[l];
      i && w && g.route.key === w.route.key ? h[l] = i[l] : (u = false, t[l] && t[l](), createRoot((y) => {
        t[l] = y, h[l] = Me(e.routerState, h[l - 1] || e.routerState.base, I(() => o()[l + 1]), () => {
          var _a;
          const b = e.routerState.matches();
          return (_a = b[l]) != null ? _a : b[0];
        });
      }));
    }
    return t.splice(n.length).forEach((l) => l()), i && u ? i : (r = h[0], h);
  }));
  return I(() => o() && r)();
}
const I = (e) => () => createComponent(Show, { get when() {
  return e();
}, keyed: true, children: (t) => createComponent(Ce$1.Provider, { value: t, get children() {
  return t.outlet();
} }) });
function ge(e, t, r) {
  const o = new URL(e.request.url), n = $(r, new URL(e.router.previousUrl || e.request.url).pathname), a = $(r, o.pathname);
  for (let i = 0; i < a.length; i++) {
    (!n[i] || a[i].route !== n[i].route) && (e.router.dataOnly = true);
    const { route: u, params: h } = a[i];
    u.preload && u.preload({ params: h, location: t.location, intent: "preload" });
  }
}
function we([e, t], r, o) {
  return [e, o ? (n) => t(o(n)) : t];
}
function be(e) {
  let t = false;
  const r = (n) => typeof n == "string" ? { value: n } : n, o = we(createSignal(r(e.get()), { equals: (n, a) => n.value === a.value && n.state === a.state }), void 0, (n) => (!t && e.set(n), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), n));
  return e.init && onCleanup(e.init((n = e.get()) => {
    t = true, o[1](r(n)), t = false;
  })), F({ signal: o, create: e.create, utils: e.utils });
}
function ve(e, t, r) {
  return e.addEventListener(t, r), () => e.removeEventListener(t, r);
}
function ye(e, t) {
  const r = e && document.getElementById(e);
  r ? r.scrollIntoView() : t && window.scrollTo(0, 0);
}
function Re(e) {
  const t = new URL(e);
  return t.pathname + t.search;
}
function Se(e) {
  let t;
  const r = { value: e.url || (t = getRequestEvent()) && Re(t.request.url) || "" };
  return F({ signal: [() => r, (o) => Object.assign(r, o)] })(e);
}
const xe = /* @__PURE__ */ new Map();
function Ce(e = true, t = false, r = "/_server", o) {
  return (n) => {
    const a = n.base.path(), i = n.navigatorFactory(n.base);
    let u, h;
    function l(s) {
      return s.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function p(s) {
      if (s.defaultPrevented || s.button !== 0 || s.metaKey || s.altKey || s.ctrlKey || s.shiftKey) return;
      const c = s.composedPath().find((N) => N instanceof Node && N.nodeName.toUpperCase() === "A");
      if (!c || t && !c.hasAttribute("link")) return;
      const f = l(c), d = f ? c.href.baseVal : c.href;
      if ((f ? c.target.baseVal : c.target) || !d && !c.hasAttribute("state")) return;
      const v = (c.getAttribute("rel") || "").split(/\s+/);
      if (c.hasAttribute("download") || v && v.includes("external")) return;
      const R = f ? new URL(d, document.baseURI) : new URL(d);
      if (!(R.origin !== window.location.origin || a && R.pathname && !R.pathname.toLowerCase().startsWith(a.toLowerCase()))) return [c, R];
    }
    function w(s) {
      const c = p(s);
      if (!c) return;
      const [f, d] = c, T = n.parsePath(d.pathname + d.search + d.hash), v = f.getAttribute("state");
      s.preventDefault(), i(T, { resolve: false, replace: f.hasAttribute("replace"), scroll: !f.hasAttribute("noscroll"), state: v ? JSON.parse(v) : void 0 });
    }
    function g(s) {
      const c = p(s);
      if (!c) return;
      const [f, d] = c;
      o && (d.pathname = o(d.pathname)), n.preloadRoute(d, f.getAttribute("preload") !== "false");
    }
    function y(s) {
      clearTimeout(u);
      const c = p(s);
      if (!c) return h = null;
      const [f, d] = c;
      h !== f && (o && (d.pathname = o(d.pathname)), u = setTimeout(() => {
        n.preloadRoute(d, f.getAttribute("preload") !== "false"), h = f;
      }, 20));
    }
    function b(s) {
      if (s.defaultPrevented) return;
      let c = s.submitter && s.submitter.hasAttribute("formaction") ? s.submitter.getAttribute("formaction") : s.target.getAttribute("action");
      if (!c) return;
      if (!c.startsWith("https://action/")) {
        const d = new URL(c, we$1);
        if (c = n.parsePath(d.pathname + d.search), !c.startsWith(r)) return;
      }
      if (s.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const f = xe.get(c);
      if (f) {
        s.preventDefault();
        const d = new FormData(s.target, s.submitter);
        f.call({ r: n, f: s.target }, s.target.enctype === "multipart/form-data" ? d : new URLSearchParams(d));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", w), e && (document.addEventListener("mousemove", y, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", b), onCleanup(() => {
      document.removeEventListener("click", w), e && (document.removeEventListener("mousemove", y), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", b);
    });
  };
}
function Ee(e) {
  if (isServer) return Se(e);
  const t = () => {
    const o = window.location.pathname.replace(/^\/+/, "/") + window.location.search, n = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: o + window.location.hash, state: n };
  }, r = me$1();
  return be({ get: t, set({ value: o, replace: n, scroll: a, state: i }) {
    n ? window.history.replaceState(_e$1(i), "", o) : window.history.pushState(i, "", o), ye(decodeURIComponent(window.location.hash.slice(1)), a), J();
  }, init: (o) => ve(window, "popstate", je$1(o, (n) => {
    if (n) return !r.confirm(n);
    {
      const a = t();
      return !r.confirm(a.value, { state: a.state });
    }
  })), create: Ce(e.preload, e.explicitLinks, e.actionBase, e.transformUrl), utils: { go: (o) => window.history.go(o), beforeLeave: r } })(e);
}
const M = createContext(), B = ["title", "meta"], L = [], A = ["name", "http-equiv", "content", "charset", "media"].concat(["property"]), x = (e, t) => {
  const r = Object.fromEntries(Object.entries(e.props).filter(([o]) => t.includes(o)).sort());
  return (Object.hasOwn(r, "name") || Object.hasOwn(r, "property")) && (r.name = r.name || r.property, delete r.property), e.tag + JSON.stringify(r);
};
function Le() {
  if (!sharedConfig.context) {
    const r = document.head.querySelectorAll("[data-sm]");
    Array.prototype.forEach.call(r, (o) => o.parentNode.removeChild(o));
  }
  const e = /* @__PURE__ */ new Map();
  function t(r) {
    if (r.ref) return r.ref;
    let o = document.querySelector(`[data-sm="${r.id}"]`);
    return o ? (o.tagName.toLowerCase() !== r.tag && (o.parentNode && o.parentNode.removeChild(o), o = document.createElement(r.tag)), o.removeAttribute("data-sm")) : o = document.createElement(r.tag), o;
  }
  return { addTag(r) {
    if (B.indexOf(r.tag) !== -1) {
      const a = r.tag === "title" ? L : A, i = x(r, a);
      e.has(i) || e.set(i, []);
      let u = e.get(i), h = u.length;
      u = [...u, r], e.set(i, u);
      let l = t(r);
      r.ref = l, spread(l, r.props);
      let p = null;
      for (var o = h - 1; o >= 0; o--) if (u[o] != null) {
        p = u[o];
        break;
      }
      return l.parentNode != document.head && document.head.appendChild(l), p && p.ref && p.ref.parentNode && document.head.removeChild(p.ref), h;
    }
    let n = t(r);
    return r.ref = n, spread(n, r.props), n.parentNode != document.head && document.head.appendChild(n), -1;
  }, removeTag(r, o) {
    const n = r.tag === "title" ? L : A, a = x(r, n);
    if (r.ref) {
      const i = e.get(a);
      if (i) {
        if (r.ref.parentNode) {
          r.ref.parentNode.removeChild(r.ref);
          for (let u = o - 1; u >= 0; u--) i[u] != null && document.head.appendChild(i[u].ref);
        }
        i[o] = null, e.set(a, i);
      } else r.ref.parentNode && r.ref.parentNode.removeChild(r.ref);
    }
  } };
}
function Ae() {
  const e = [];
  return useAssets(() => ssr(Te(e))), { addTag(t) {
    if (B.indexOf(t.tag) !== -1) {
      const r = t.tag === "title" ? L : A, o = x(t, r), n = e.findIndex((a) => a.tag === t.tag && x(a, r) === o);
      n !== -1 && e.splice(n, 1);
    }
    return e.push(t), e.length;
  }, removeTag(t, r) {
  } };
}
const Pe = (e) => {
  const t = isServer ? Ae() : Le();
  return createComponent(M.Provider, { value: t, get children() {
    return e.children;
  } });
}, ke = (e, t, r) => (Oe({ tag: e, props: t, setting: r, id: createUniqueId(), get name() {
  return t.name || t.property;
} }), null);
function Oe(e) {
  const t = useContext(M);
  if (!t) throw new Error("<MetaProvider /> should be in the tree");
  createRenderEffect(() => {
    const r = t.addTag(e);
    onCleanup(() => t.removeTag(e, r));
  });
}
function Te(e) {
  return e.map((t) => {
    var _a, _b;
    const o = Object.keys(t.props).map((a) => a === "children" ? "" : ` ${a}="${escape(t.props[a], true)}"`).join("");
    let n = t.props.children;
    return Array.isArray(n) && (n = n.join("")), ((_a = t.setting) == null ? void 0 : _a.close) ? `<${t.tag} data-sm="${t.id}"${o}>${((_b = t.setting) == null ? void 0 : _b.escape) ? escape(n) : n || ""}</${t.tag}>` : `<${t.tag} data-sm="${t.id}"${o}/>`;
  }).join("");
}
const Ne = (e) => ke("title", e, { escape: true, close: true });
var je = ["<div", ' class="min-h-screen flex items-center justify-center bg-black text-white"><div class="text-center max-w-md p-8"><h1 class="text-3xl font-bold mb-4">\u26A0\uFE0F Something went wrong</h1><p class="text-gray-400 mb-6">', '</p><button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Try Again</button></div></div>'], Ue = ["<div", ' class="min-h-screen flex items-center justify-center bg-black"><div class="text-white text-xl">Loading...</div></div>'];
function _e() {
  return createComponent(Ee, { root: (e) => createComponent(Pe, { get children() {
    return [createComponent(Ne, { children: "Mehaal.Tech - AI-Powered Solutions" }), createComponent(ErrorBoundary, { fallback: (t, r) => ssr(je, ssrHydrationKey(), escape(t.toString())), get children() {
      return createComponent(Suspense, { get fallback() {
        return ssr(Ue, ssrHydrationKey());
      }, get children() {
        return e.children;
      } });
    } })];
  } }), get children() {
    return createComponent(ct, {});
  } });
}

export { _e as default };
//# sourceMappingURL=root-p0kWiATY.mjs.map
