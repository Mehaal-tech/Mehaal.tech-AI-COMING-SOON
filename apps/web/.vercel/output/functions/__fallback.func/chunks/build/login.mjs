import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { h } from './Button-rjMnZ3ec.mjs';
import { b } from './Input-0sOzVmib.mjs';
import { g } from './Card-D9smAXyI.mjs';
import { createSignal, useContext, createContext } from 'solid-js';
import { i } from './routing-wKbSS_gE.mjs';

const C = { "owner@mehaal.tech": { id: "1", email: "owner@mehaal.tech", name: "Admin User", role: "owner", permissions: ["*"] }, "manager@mehaal.tech": { id: "2", email: "manager@mehaal.tech", name: "Manager User", role: "management", permissions: ["read:projects", "write:projects", "read:team", "write:team"] }, "client@mehaal.tech": { id: "3", email: "client@mehaal.tech", name: "Client User", role: "client", permissions: ["read:services", "read:billing", "write:support"] } };
async function k(e) {
  await A(1e3);
  const t = C[e.email];
  if (!t) throw new Error("Invalid credentials");
  const r = { token: I(), expiresAt: Date.now() + 1440 * 60 * 1e3, user: t };
  return localStorage.setItem("auth_session", JSON.stringify(r)), console.log("[Auth] User logged in:", t.email), r;
}
function A(e) {
  return new Promise((t) => setTimeout(t, e));
}
function I() {
  return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const _ = createContext();
function M() {
  const e = useContext(_);
  if (!e) throw new Error("useAuth must be used within AuthProvider");
  return e;
}
var D = ["<form", ' class="space-y-4"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--><div class="text-center text-sm text-gray-400"><p>Demo accounts:</p><p class="mt-1">owner@mehaal.tech (Owner)</p><p>manager@mehaal.tech (Management)</p><p>client@mehaal.tech (Client)</p><p class="mt-2 text-xs">Password: any</p></div></form>'], E = ["<div", ' class="min-h-screen flex items-center justify-center bg-black p-4"><div class="w-full max-w-md"><div class="text-center mb-8"><img src="/icon.svg" alt="Logo" class="h-16 w-auto mx-auto mb-4"><h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1><p class="text-gray-400">Sign in to continue to Mehaal.Tech AI</p></div><!--$-->', `<!--/--><div class="mt-6 text-center"><a href="/auth/register" class="text-sm text-brand-primary hover:underline">Don't have an account? Sign up</a></div></div></div>`], P = ["<div", ' class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">', "</div>"];
function N() {
  const e = i(), { setSession: t } = M(), [r, p] = createSignal(""), [m, g$1] = createSignal(""), [i$1, d] = createSignal(""), [w, u] = createSignal(false), f = async (v) => {
    v.preventDefault(), d(""), u(true);
    try {
      const n = await k({ email: r(), password: m() });
      t(n), e({ owner: "/dashboard/owner", management: "/dashboard/management", client: "/dashboard/client", franchise: "/dashboard/franchise", partner: "/dashboard/partner" }[n.user.role] || "/");
    } catch (n) {
      d(n.message || "Login failed");
    } finally {
      u(false);
    }
  };
  return ssr(E, ssrHydrationKey(), escape(createComponent(g, { get children() {
    return ssr(D, ssrHydrationKey(), escape(createComponent(b, { type: "email", label: "Email", placeholder: "you@example.com", get value() {
      return r();
    }, onInput: p, required: true, get error() {
      return i$1() ? " " : void 0;
    } })), escape(createComponent(b, { type: "password", label: "Password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", get value() {
      return m();
    }, onInput: g$1, required: true })), i$1() && ssr(P, ssrHydrationKey(), escape(i$1())), escape(createComponent(h, { variant: "primary", class: "w-full", get loading() {
      return w();
    }, onClick: f, children: "Sign In" })));
  } })));
}

export { N as default };
//# sourceMappingURL=login.mjs.map
