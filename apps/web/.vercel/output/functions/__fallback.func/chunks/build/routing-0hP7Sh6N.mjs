import { useContext, createContext, createSignal, createMemo, createRenderEffect, on, runWithOwner, getOwner, startTransition, resetErrorBoundaries, batch, untrack, createComponent } from 'solid-js';
import { isServer, getRequestEvent } from 'solid-js/web';

function me() {
  let t = /* @__PURE__ */ new Set();
  function e(r) {
    return t.add(r), () => t.delete(r);
  }
  let n = false;
  function s(r, o) {
    if (n) return !(n = false);
    const a = { to: r, options: o, defaultPrevented: false, preventDefault: () => a.defaultPrevented = true };
    for (const c of t) c.listener({ ...a, from: c.location, retry: (f) => {
      f && (n = true), c.navigate(r, { ...o, resolve: false });
    } });
    return !a.defaultPrevented;
  }
  return { subscribe: e, confirm: s };
}
let I;
function J() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), I = window.history.state._depth;
}
isServer || J();
function _e(t) {
  return { ...t, _depth: window.history.state && window.history.state._depth };
}
function je(t, e) {
  let n = false;
  return () => {
    const s = I;
    J();
    const r = s == null ? null : I - s;
    if (n) {
      n = false;
      return;
    }
    r && e(r) ? (n = true, window.history.go(-r)) : t();
  };
}
const ge = /^(?:[a-z0-9]+:)?\/\//i, ye = /^\/+|(\/)\/+$/g, we = "http://sr";
function E(t, e = false) {
  const n = t.replace(ye, "$1");
  return n ? e || /^[?#]/.test(n) ? n : "/" + n : "";
}
function q(t, e, n) {
  if (ge.test(e)) return;
  const s = E(t), r = n && E(n);
  let o = "";
  return !r || e.startsWith("/") ? o = s : r.toLowerCase().indexOf(s.toLowerCase()) !== 0 ? o = s + r : o = r, (o || "/") + E(e, !o);
}
function ve(t, e) {
  if (t == null) throw new Error(e);
  return t;
}
function Re(t, e) {
  return E(t).replace(/\/*(\*.*)?$/g, "") + E(e);
}
function Q(t) {
  const e = {};
  return t.searchParams.forEach((n, s) => {
    s in e ? Array.isArray(e[s]) ? e[s].push(n) : e[s] = [e[s], n] : e[s] = n;
  }), e;
}
function Pe(t, e, n) {
  const [s, r] = t.split("/*", 2), o = s.split("/").filter(Boolean), a = o.length;
  return (c) => {
    const f = c.split("/").filter(Boolean), h = f.length - a;
    if (h < 0 || h > 0 && r === void 0 && !e) return null;
    const l = { path: a ? "" : "/", params: {} }, m = (d) => n === void 0 ? void 0 : n[d];
    for (let d = 0; d < a; d++) {
      const p = o[d], y = p[0] === ":", w = y ? f[d] : f[d].toLowerCase(), C = y ? p.slice(1) : p.toLowerCase();
      if (y && W(w, m(C))) l.params[C] = w;
      else if (y || !W(w, C)) return null;
      l.path += `/${w}`;
    }
    if (r) {
      const d = h ? f.slice(-h).join("/") : "";
      if (W(d, m(r))) l.params[r] = d;
      else return null;
    }
    return l;
  };
}
function W(t, e) {
  const n = (s) => s === t;
  return e === void 0 ? true : typeof e == "string" ? n(e) : typeof e == "function" ? e(t) : Array.isArray(e) ? e.some(n) : e instanceof RegExp ? e.test(t) : false;
}
function xe(t) {
  const [e, n] = t.pattern.split("/*", 2), s = e.split("/").filter(Boolean);
  return s.reduce((r, o) => r + (o.startsWith(":") ? 2 : 3), s.length - (n === void 0 ? 0 : 1));
}
function V(t) {
  const e = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(s, r) {
    return e.has(r) || runWithOwner(n, () => e.set(r, createMemo(() => t()[r]))), e.get(r)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(t());
  }, has(s, r) {
    return r in t();
  } });
}
function Y(t) {
  let e = /(\/?\:[^\/]+)\?/.exec(t);
  if (!e) return [t];
  let n = t.slice(0, e.index), s = t.slice(e.index + e[0].length);
  const r = [n, n += e[1]];
  for (; e = /^(\/\:[^\/]+)\?/.exec(s); ) r.push(n += e[1]), s = s.slice(e[0].length);
  return Y(s).reduce((o, a) => [...o, ...r.map((c) => c + a)], []);
}
const be = 100, Ae = createContext(), Ce = createContext(), Z = () => ve(useContext(Ae), "<A> and 'use' router primitives can be only used inside a Route."), qe = () => Z().navigatorFactory(), We = () => Z().params;
function Ee(t, e = "") {
  const { component: n, preload: s, load: r, children: o, info: a } = t, c = !o || Array.isArray(o) && !o.length, f = { key: t, component: n, preload: s || r, info: a };
  return ee(t.path).reduce((h, l) => {
    for (const m of Y(l)) {
      const d = Re(e, m);
      let p = c ? d : d.split("/*", 1)[0];
      p = p.split("/").map((y) => y.startsWith(":") || y.startsWith("*") ? y : encodeURIComponent(y)).join("/"), h.push({ ...f, originalPath: l, pattern: p, matcher: Pe(p, !c, t.matchFilters) });
    }
    return h;
  }, []);
}
function Se(t, e = 0) {
  return { routes: t, score: xe(t[t.length - 1]) * 1e4 - e, matcher(n) {
    const s = [];
    for (let r = t.length - 1; r >= 0; r--) {
      const o = t[r], a = o.matcher(n);
      if (!a) return null;
      s.unshift({ ...a, route: o });
    }
    return s;
  } };
}
function ee(t) {
  return Array.isArray(t) ? t : [t];
}
function Le(t, e = "", n = [], s = []) {
  const r = ee(t);
  for (let o = 0, a = r.length; o < a; o++) {
    const c = r[o];
    if (c && typeof c == "object") {
      c.hasOwnProperty("path") || (c.path = "");
      const f = Ee(c, e);
      for (const h of f) {
        n.push(h);
        const l = Array.isArray(c.children) && c.children.length === 0;
        if (c.children && !l) Le(c.children, h.pattern, n, s);
        else {
          const m = Se([...n], s.length);
          s.push(m);
        }
        n.pop();
      }
    }
  }
  return n.length ? s : s.sort((o, a) => a.score - o.score);
}
function $(t, e) {
  for (let n = 0, s = t.length; n < s; n++) {
    const r = t[n].matcher(e);
    if (r) return r;
  }
  return [];
}
function Oe(t, e, n) {
  const s = new URL(we), r = createMemo((l) => {
    const m = t();
    try {
      return new URL(m, s);
    } catch {
      return console.error(`Invalid path ${m}`), l;
    }
  }, s, { equals: (l, m) => l.href === m.href }), o = createMemo(() => r().pathname), a = createMemo(() => r().search, true), c = createMemo(() => r().hash), f = () => "", h = on(a, () => Q(r()));
  return { get pathname() {
    return o();
  }, get search() {
    return a();
  }, get hash() {
    return c();
  }, get state() {
    return e();
  }, get key() {
    return f();
  }, query: n ? n(h) : V(h) };
}
let v;
function $e() {
  return v;
}
function Ie(t, e, n, s = {}) {
  const { signal: [r, o], utils: a = {} } = t, c = a.parsePath || ((i) => i), f = a.renderPath || ((i) => i), h = a.beforeLeave || me(), l = q("", s.base || "");
  if (l === void 0) throw new Error(`${l} is not a valid base path`);
  l && !r().value && o({ value: l, replace: true, scroll: false });
  const [m, d] = createSignal(false);
  let p;
  const y = (i, u) => {
    u.value === w() && u.state === S() || (p === void 0 && d(true), v = i, p = u, startTransition(() => {
      p === u && (C(p.value), te(p.state), resetErrorBoundaries(), isServer || M[1]((g) => g.filter((P) => P.pending)));
    }).finally(() => {
      p === u && batch(() => {
        v = void 0, i === "navigate" && oe(p), d(false), p = void 0;
      });
    }));
  }, [w, C] = createSignal(r().value), [S, te] = createSignal(r().state), L = Oe(w, S, a.queryWrapper), O = [], M = createSignal(isServer ? ie() : []), D = createMemo(() => typeof s.transformUrl == "function" ? $(e(), s.transformUrl(L.pathname)) : $(e(), L.pathname)), U = () => {
    const i = D(), u = {};
    for (let g = 0; g < i.length; g++) Object.assign(u, i[g].params);
    return u;
  }, ne = a.paramsWrapper ? a.paramsWrapper(U, e) : V(U), z = { pattern: l, path: () => l, outlet: () => null, resolvePath(i) {
    return q(l, i);
  } };
  return createRenderEffect(on(r, (i) => y("native", i), { defer: true })), { base: z, location: L, params: ne, isRouting: m, renderPath: f, parsePath: c, navigatorFactory: se, matches: D, beforeLeave: h, preloadRoute: ae, singleFlight: s.singleFlight === void 0 ? true : s.singleFlight, submissions: M };
  function re(i, u, g) {
    untrack(() => {
      if (typeof u == "number") {
        u && (a.go ? a.go(u) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const P = !u || u[0] === "?", { replace: F, resolve: x, scroll: B, state: b } = { replace: false, resolve: !P, scroll: true, ...g }, A = x ? i.resolvePath(u) : q(P && L.pathname || "", u);
      if (A === void 0) throw new Error(`Path '${u}' is not a routable path`);
      if (O.length >= be) throw new Error("Too many redirects");
      const K = w();
      if (A !== K || b !== S()) if (isServer) {
        const N = getRequestEvent();
        N && (N.response = { status: 302, headers: new Headers({ Location: A }) }), o({ value: A, replace: F, scroll: B, state: b });
      } else h.confirm(A, g) && (O.push({ value: K, replace: F, scroll: B, state: S() }), y("navigate", { value: A, state: b }));
    });
  }
  function se(i) {
    return i = i || useContext(Ce) || z, (u, g) => re(i, u, g);
  }
  function oe(i) {
    const u = O[0];
    u && (o({ ...i, replace: u.replace, scroll: u.scroll }), O.length = 0);
  }
  function ae(i, u) {
    const g = $(e(), i.pathname), P = v;
    v = "preload";
    for (let F in g) {
      const { route: x, params: B } = g[F];
      x.component && x.component.preload && x.component.preload();
      const { preload: b } = x;
      u && b && runWithOwner(n(), () => b({ params: B, location: { pathname: i.pathname, search: i.search, hash: i.hash, query: Q(i), state: null, key: "" }, intent: "preload" }));
    }
    v = P;
  }
  function ie() {
    const i = getRequestEvent();
    return i && i.router && i.router.submission ? [i.router.submission] : [];
  }
}
function Me(t, e, n, s) {
  const { base: r, location: o, params: a } = t, { pattern: c, component: f, preload: h } = s().route, l = createMemo(() => s().path);
  f && f.preload && f.preload();
  const m = h ? h({ params: a, location: o, intent: v || "initial" }) : void 0;
  return { parent: e, pattern: c, path: l, outlet: () => f ? createComponent(f, { params: a, location: o, data: m, get children() {
    return n();
  } }) : n(), resolvePath(p) {
    return q(r.path(), p, l());
  } };
}

export { $e as $, Ae as A, Ce as C, Ie as I, J, Le as L, Me as M, We as W, _e as _, $ as a, je as j, me as m, qe as q, we as w };
//# sourceMappingURL=routing-0hP7Sh6N.mjs.map
