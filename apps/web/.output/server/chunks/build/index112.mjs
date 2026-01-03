import { ssr, ssrHydrationKey, escape, createComponent, ssrStyleProperty, ssrStyle, ssrAttribute } from 'solid-js/web';
import { Show, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const [c, u] = createStore({ phase: "black", logoVisible: false, glowExpanded: false, glowRetracted: false, persistentGlow: false, contentVisible: false });
function g(t) {
  switch (t) {
    case "logo-emerge":
      u({ phase: t, logoVisible: true });
      break;
    case "glow-expand":
      u({ phase: t, glowExpanded: true });
      break;
    case "glow-retract":
      u({ phase: t, glowRetracted: true, persistentGlow: true });
      break;
    case "content-load":
      u({ phase: t, contentVisible: true });
      break;
    case "steady":
      u({ phase: t });
      break;
  }
}
var k = ["<div", ' class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style="', '"></div>'], z = ["<div", ' class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none" style="', '"></div>'], A = ["<div", ' class="relative"><img src="/icon.svg" alt="AI Logo" class="w-32 h-32 relative z-10" style="', '"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"], M = ["<div", ' class="', '" style="', '">', "</div>"];
function S() {
  const [t, s] = createSignal({});
  onMount(() => {
    (async () => {
      await p(500), g("logo-emerge"), await p(1200), g("glow-expand"), s({ animation: "glow-expand 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }), await p(1500), g("glow-retract"), s({ animation: "glow-retract 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }), await p(1200), g("content-load"), await p(800), g("steady");
    })();
  });
  const b = () => c.phase !== "steady";
  return createComponent(Show, { get when() {
    return b();
  }, get children() {
    return ssr(M, ssrHydrationKey(), `fixed inset-0 z-50 bg-black flex items-center justify-center ${c.phase !== "content-load" && c.phase !== "steady" ? "opacity-100" : ""} ${c.phase === "content-load" || c.phase === "steady" ? "opacity-0 pointer-events-none" : ""}`, ssrStyleProperty("transition:", "opacity 0.8s ease-out"), escape(createComponent(Show, { get when() {
      return c.logoVisible;
    }, get children() {
      return ssr(A, ssrHydrationKey(), ssrStyleProperty("animation:", "emerge 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"), escape(createComponent(Show, { get when() {
        return c.glowExpanded;
      }, get children() {
        return ssr(k, ssrHydrationKey(), ssrStyle({ background: "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)", filter: "blur(30px)", ...t() }));
      } })), escape(createComponent(Show, { get when() {
        return c.persistentGlow;
      }, get children() {
        return ssr(z, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)") + ssrStyleProperty(";filter:", "blur(20px)") + ssrStyleProperty(";opacity:", "0.4"));
      } })));
    } })));
  } });
}
function p(t) {
  return new Promise((s) => setTimeout(s, t));
}
var _ = ["<header", ' class="relative h-20 overflow-hidden" style="', '"><div class="absolute inset-0 scroll-bg-slow" style="', '"></div><div class="relative z-10 h-full container-center flex items-center justify-between"><div class="emerge" style="', '"><img src="/icon.svg" alt="Mehaal.Tech AI" class="h-12 w-auto"></div><nav class="slide-in-right" style="', '"><ul class="flex gap-8 items-center text-sm font-medium"><li><a href="#" class="hover:text-brand-primary transition-colors">Features</a></li><li><a href="#" class="hover:text-brand-primary transition-colors">Pricing</a></li><li><a href="#" class="hover:text-brand-primary transition-colors">About</a></li><li><a href="/auth/login" class="px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 transition-opacity">Sign In</a></li></ul></nav></div></header>'];
function T() {
  return ssr(_, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("animation-delay:", "0.2s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"), ssrStyleProperty("animation-delay:", "0.4s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"));
}
var I = ["<footer", ' class="relative h-24 overflow-hidden mt-auto" style="', '"><div class="absolute inset-0 scroll-bg-slow" style="', '"></div><div class="relative z-10 h-full container-center flex items-center justify-between"><div class="emerge" style="', '"><img src="/footer-logo.png" alt="Mehaal.Tech" class="h-8 w-auto"></div><div class="slide-in-right" style="', '"><ul class="flex gap-6 items-center text-xs text-gray-400"><li><a href="#" class="hover:text-brand-primary transition-colors">Privacy</a></li><li><a href="#" class="hover:text-brand-primary transition-colors">Terms</a></li><li><a href="#" class="hover:text-brand-primary transition-colors">Contact</a></li><li class="text-gray-500">\xA9 2026 Mehaal.Tech. All rights reserved.</li></ul></div></div></footer>'];
function E() {
  return ssr(I, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("animation-delay:", "0.6s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"), ssrStyleProperty("animation-delay:", "0.8s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"));
}
const [o, d] = createStore({ state: "init", currentText: "", isMicEnabled: false, audioPlaying: false });
function h(t) {
  switch (d({ state: t }), t) {
    case "speaking":
      d({ isMicEnabled: false, audioPlaying: true });
      break;
    case "listening":
      d({ isMicEnabled: true, audioPlaying: false });
      break;
    case "processing":
      d({ isMicEnabled: false, audioPlaying: false });
      break;
    case "ready":
      d({ isMicEnabled: false, audioPlaying: false, currentText: "" });
      break;
  }
}
function C(t) {
  d({ currentText: t });
}
class P {
  constructor(s) {
    __publicField(this, "duration");
    __publicField(this, "endCallback");
    this.duration = s;
  }
  async play() {
    return new Promise((s) => {
      setTimeout(() => {
        this.endCallback && this.endCallback(), s();
      }, this.duration);
    });
  }
  stop() {
  }
  onEnd(s) {
    this.endCallback = s;
  }
}
async function V(t) {
  const b = t.split(" ").length * 100;
  await new P(b).play();
}
var H = ["<div", ' class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" style="', '"></div>'], j = ["<div", ' class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" style="', '"></div>'], L = ["<p", ' class="text-xl text-gray-200 leading-relaxed">', "</p>"], G = ["<div", ' class="absolute inset-0 -m-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style="', '"></div>'], q = ["<div", ' class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>'], R = ["<div", ' class="flex flex-col items-center justify-center gap-12 py-20"><div class="relative"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none breathe-glow" style="', '"></div><img src="/icon.svg" alt="AI Agent" class="w-40 h-40 relative z-10"><!--$-->', "<!--/--><!--$-->", '<!--/--></div><div class="max-w-2xl px-8 text-center">', "</div><button", ' class="', '" style="', '"><!--$-->', '<!--/--><div class="relative w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">', '</div></button><p class="text-sm text-gray-500"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></p></div>"], F = ["<p", ' class="text-gray-400 text-lg italic">Initializing AI...</p>'], W = ["<svg", ' class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>'];
function B() {
  return onMount(() => {
    D();
  }), ssr(R, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)") + ssrStyleProperty(";filter:", "blur(30px)"), escape(createComponent(Show, { get when() {
    return o.state === "speaking";
  }, get children() {
    return ssr(H, ssrHydrationKey(), ssrStyleProperty("box-shadow:", "0 0 10px rgba(0, 255, 0, 0.5)"));
  } })), escape(createComponent(Show, { get when() {
    return o.state === "listening";
  }, get children() {
    return ssr(j, ssrHydrationKey(), ssrStyleProperty("box-shadow:", "0 0 10px rgba(0, 100, 255, 0.5)"));
  } })), escape(createComponent(Show, { get when() {
    return o.currentText;
  }, get fallback() {
    return ssr(F, ssrHydrationKey());
  }, get children() {
    return ssr(L, ssrHydrationKey(), escape(o.currentText));
  } })), ssrAttribute("disabled", !o.isMicEnabled, true), `relative group ${o.isMicEnabled ? "" : "opacity-50 cursor-not-allowed"} ${o.isMicEnabled ? "hover:scale-110" : ""}`, ssrStyleProperty("transition:", "all 0.3s ease"), escape(createComponent(Show, { get when() {
    return o.isMicEnabled;
  }, get children() {
    return ssr(G, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)") + ssrStyleProperty(";filter:", "blur(15px)"));
  } })), escape(createComponent(Show, { get when() {
    return o.state === "listening";
  }, get fallback() {
    return ssr(W, ssrHydrationKey());
  }, get children() {
    return ssr(q, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    return o.state === "speaking";
  }, children: "AI is speaking..." })), escape(createComponent(Show, { get when() {
    return o.state === "listening";
  }, children: "Listening..." })), escape(createComponent(Show, { get when() {
    return o.state === "processing";
  }, children: "Processing..." })), escape(createComponent(Show, { get when() {
    return o.state === "ready";
  }, children: "Ready" })));
}
async function D() {
  h("boot"), await m(1e3), h("ready"), await m(500), h("speaking"), C("Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?"), await V("Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?"), h("ready");
}
function m(t) {
  return new Promise((s) => setTimeout(s, t));
}
var K = ["<div", ' class="fixed inset-0 -z-10 scroll-bg" style="', '"></div>'], J = ["<div", ' class="flex flex-col min-h-screen"><!--$-->', '<!--/--><main class="flex-1 flex items-center justify-center">', "</main><!--$-->", "<!--/--></div>"], N = ["<div", ' class="relative min-h-screen"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"];
function X() {
  const t = () => c.phase === "steady";
  return ssr(N, ssrHydrationKey(), escape(createComponent(S, {})), escape(createComponent(Show, { get when() {
    return t();
  }, get children() {
    return [ssr(K, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/body-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x")), ssr(J, ssrHydrationKey(), escape(createComponent(T, {})), escape(createComponent(B, {})), escape(createComponent(E, {})))];
  } })));
}

export { X as default };
//# sourceMappingURL=index112.mjs.map
