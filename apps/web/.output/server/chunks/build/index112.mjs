import { ssr, ssrHydrationKey, escape, createComponent, ssrStyleProperty, ssrAttribute, ssrStyle } from 'solid-js/web';
import { Show, createSignal, onMount, onCleanup, For } from 'solid-js';
import { createStore } from 'solid-js/store';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const [o, m] = createStore({ phase: "black", progress: 0, logoVisible: false, glowExpanded: false, glowRetracted: false, persistentGlow: false, contentVisible: false });
function h(e) {
  const r = { black: 0, "logo-emerge": 20, "glow-expand": 45, "glow-retract": 70, "content-load": 90, steady: 100 };
  switch (e) {
    case "logo-emerge":
      m({ phase: e, progress: r[e], logoVisible: true });
      break;
    case "glow-expand":
      m({ phase: e, progress: r[e], glowExpanded: true });
      break;
    case "glow-retract":
      m({ phase: e, progress: r[e], glowRetracted: true, persistentGlow: true });
      break;
    case "content-load":
      m({ phase: e, progress: r[e], contentVisible: true });
      break;
    case "steady":
      m({ phase: e, progress: r[e] });
      break;
  }
}
var _ = ["<div", ' class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style="', '"></div>'], V = ["<div", ' class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none" style="', '"></div>'], C = ["<div", ' class="relative"><img src="/icon.svg" alt="AI Logo" class="w-32 h-32 relative z-10" style="', '"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"], L = ["<div", ' class="', '" style="', '" role="progressbar"', ' aria-valuemin="0" aria-valuemax="100" aria-label="Loading application"><!--$-->', '<!--/--><div class="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 md:w-96"><div class="flex items-center gap-3 text-gray-400 text-sm mb-2"><span class="font-mono"><!--$-->', '<!--/-->%</span><div class="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300" style="', '"></div></div></div><p class="text-center text-xs text-gray-500"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></p></div></div>"];
function P() {
  const [e, r] = createSignal({});
  onMount(() => {
    (async () => {
      await f(500), h("logo-emerge"), await f(1200), h("glow-expand"), r({ animation: "glow-expand 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }), await f(1500), h("glow-retract"), r({ animation: "glow-retract 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }), await f(1200), h("content-load"), await f(800), h("steady");
    })();
  });
  const u = () => o.phase !== "steady";
  return createComponent(Show, { get when() {
    return u();
  }, get children() {
    return ssr(L, ssrHydrationKey(), `fixed inset-0 z-50 bg-black flex flex-col items-center justify-center ${o.phase !== "content-load" && o.phase !== "steady" ? "opacity-100" : ""} ${o.phase === "content-load" || o.phase === "steady" ? "opacity-0 pointer-events-none" : ""}`, ssrStyleProperty("transition:", "opacity 0.8s ease-out"), ssrAttribute("aria-valuenow", escape(o.progress, true), false), escape(createComponent(Show, { get when() {
      return o.logoVisible;
    }, get children() {
      return ssr(C, ssrHydrationKey(), ssrStyleProperty("animation:", "emerge 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"), escape(createComponent(Show, { get when() {
        return o.glowExpanded;
      }, get children() {
        return ssr(_, ssrHydrationKey(), ssrStyle({ background: "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)", filter: "blur(30px)", ...e() }));
      } })), escape(createComponent(Show, { get when() {
        return o.persistentGlow;
      }, get children() {
        return ssr(V, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)") + ssrStyleProperty(";filter:", "blur(20px)") + ssrStyleProperty(";opacity:", "0.4"));
      } })));
    } })), escape(o.progress), ssrStyleProperty("width:", `${escape(o.progress, true)}%`), o.phase === "black-screen" && "Initializing...", o.phase === "logo-emerge" && "Loading AI Core...", o.phase === "glow-expand" && "Activating Systems...", o.phase === "glow-retract" && "Preparing Interface...", o.phase === "content-load" && "Almost Ready...");
  } });
}
function f(e) {
  return new Promise((r) => setTimeout(r, e));
}
var H = ["<header", ' class="relative h-16 md:h-20 overflow-hidden" style="', '" role="banner"><a href="#main-content" class="skip-to-content">Skip to main content</a><div class="absolute inset-0 scroll-bg-slow" style="', '" aria-hidden="true"></div><div class="relative z-10 h-full container-center px-4 md:px-8 flex items-center justify-between"><div class="emerge" style="', '"><a href="/" aria-label="Mehaal.Tech AI Home"><img src="/icon.svg" alt="Mehaal.Tech AI" class="h-10 md:h-12 w-auto"></a></div><nav class="slide-in-right" style="', '" aria-label="Primary navigation"><ul class="flex gap-4 md:gap-8 items-center text-xs md:text-sm font-medium"><li><a href="#features" class="hover:text-brand-primary transition-colors focus-trap">Features</a></li><li class="hidden sm:block"><a href="#pricing" class="hover:text-brand-primary transition-colors focus-trap">Pricing</a></li><li class="hidden md:block"><a href="#about" class="hover:text-brand-primary transition-colors focus-trap">About</a></li><li><a href="/auth/login" class="px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 transition-opacity">Sign In</a></li></ul></nav></div></header>'];
function j() {
  return ssr(H, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("animation-delay:", "0.2s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"), ssrStyleProperty("animation-delay:", "0.4s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"));
}
var R = ["<footer", ' class="relative h-20 md:h-24 overflow-hidden mt-auto" style="', '" role="contentinfo"><div class="absolute inset-0 scroll-bg-slow" style="', '" aria-hidden="true"></div><div class="relative z-10 h-full container-center px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0"><div class="emerge" style="', '"><img src="/footer-logo.png" alt="Mehaal.Tech" class="h-6 md:h-8 w-auto"></div><nav class="slide-in-right" style="', '" aria-label="Footer navigation"><ul class="flex gap-4 md:gap-6 items-center text-xs text-gray-400"><li><a href="/privacy" class="hover:text-brand-primary transition-colors focus-trap">Privacy</a></li><li><a href="/terms" class="hover:text-brand-primary transition-colors focus-trap">Terms</a></li><li><a href="/contact" class="hover:text-brand-primary transition-colors focus-trap">Contact</a></li><li class="text-gray-500 hidden sm:block">\xA9 2026 Mehaal.Tech. All rights reserved.</li></ul></nav></div></footer>'];
function D() {
  return ssr(R, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("background-image:", "url(/header-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x"), ssrStyleProperty("animation-delay:", "0.6s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"), ssrStyleProperty("animation-delay:", "0.8s") + ssrStyleProperty(";opacity:", 0) + ssrStyleProperty(";animation-fill-mode:", "forwards"));
}
const [l, g] = createStore({ state: "init", currentText: "", isMicEnabled: false, audioPlaying: false });
function p(e) {
  switch (g({ state: e }), e) {
    case "speaking":
      g({ isMicEnabled: false, audioPlaying: true });
      break;
    case "listening":
      g({ isMicEnabled: true, audioPlaying: false });
      break;
    case "processing":
      g({ isMicEnabled: false, audioPlaying: false });
      break;
    case "ready":
      g({ isMicEnabled: false, audioPlaying: false, currentText: "" });
      break;
  }
}
function k(e) {
  g({ currentText: e });
}
class F {
  constructor(r) {
    __publicField(this, "duration");
    __publicField(this, "endCallback");
    this.duration = r;
  }
  async play() {
    return new Promise((r) => {
      setTimeout(() => {
        this.endCallback && this.endCallback(), r();
      }, this.duration);
    });
  }
  stop() {
  }
  onEnd(r) {
    this.endCallback = r;
  }
}
async function G(e) {
  const u = e.split(" ").length * 100;
  await new F(u).play();
}
function q() {
  console.log("[Voice Agent] Started listening (dummy)"), setTimeout(() => {
    K({ text: "User spoke something" }.text);
  }, 3e3);
}
function K(e) {
  console.log("[Voice Agent] Speech detected:", e);
}
var N = ["<div", ' class="flex items-center justify-center gap-1 h-20 px-4" role="presentation" aria-label="Voice activity visualization">', "</div>"], B = ["<div", ' class="w-1 rounded-full transition-all duration-100 ease-out" style="', '"></div>'];
function U(e) {
  const [r, u] = createSignal(Array(24).fill(20));
  let d;
  onMount(() => {
    e.isActive && y();
  }), onCleanup(() => {
    d && clearInterval(d);
  });
  const y = () => {
    d = setInterval(() => {
      u(Array(24).fill(0).map(() => 20 + Math.random() * 60));
    }, 100);
  };
  return createComponent(Show, { get when() {
    return e.isActive;
  }, get children() {
    return ssr(N, ssrHydrationKey(), escape(createComponent(For, { get each() {
      return r();
    }, children: (x, M) => ssr(B, ssrHydrationKey(), ssrStyleProperty("height:", `${escape(x, true)}%`) + ssrStyleProperty(";background:", escape(e.color, true) || "var(--color-ai-glow)") + ssrStyleProperty(";opacity:", 0.8) + ssrStyleProperty(";animation:", "pulse 0.8s ease-in-out infinite") + ssrStyleProperty(";animation-delay:", `${escape(M(), true) * 0.03}s`)) })));
  } });
}
function W(e) {
  onMount(() => {
    const r = (u) => {
      const d = u.target;
      if (!(d.tagName === "INPUT" || d.tagName === "TEXTAREA")) switch (u.code) {
        case "Space":
          e.onSpace && (u.preventDefault(), e.onSpace());
          break;
        case "Escape":
          e.onEscape && (u.preventDefault(), e.onEscape());
          break;
        case "Enter":
          e.onEnter && (u.preventDefault(), e.onEnter());
          break;
      }
    };
    window.addEventListener("keydown", r), onCleanup(() => {
      window.removeEventListener("keydown", r);
    });
  });
}
var X = ["<div", ' class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" role="status" aria-label="AI is speaking" style="', '"></div>'], J = ["<div", ' class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" role="status" aria-label="AI is listening" style="', '"></div>'], O = ["<p", ' class="text-lg md:text-xl text-gray-200 leading-relaxed" role="status" aria-live="polite" aria-atomic="true">', "</p>"], Q = ["<div", ' class="absolute inset-0 -m-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" style="', '"></div>'], Y = ["<div", ' class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>'], Z = ["<p", ' class="text-xs md:text-sm text-gray-500 mt-3" role="note">Press <kbd class="px-2 py-1 bg-gray-800 rounded text-gray-300">Space</kbd> to speak</p>'], ee = ["<div", ' class="flex flex-col items-center justify-center gap-8 md:gap-12 py-12 md:py-20 px-4" role="main" aria-label="AI Voice Assistant Interface"><div class="relative" role="img" aria-label="AI Agent Core"><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full pointer-events-none breathe-glow" aria-hidden="true" style="', '"></div><img src="/icon.svg" alt="AI Agent" class="w-32 h-32 md:w-40 md:h-40 relative z-10"><!--$-->', "<!--/--><!--$-->", "<!--/--></div><!--$-->", '<!--/--><div class="max-w-xl md:max-w-2xl px-6 md:px-8 text-center">', "</div><button", ' class="', '" style="', '"', ' tabindex="0"><!--$-->', '<!--/--><div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">', "</div></button><!--$-->", '<!--/--><p class="text-sm md:text-base text-gray-500" role="status" aria-live="polite"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--></p></div>"], te = ["<p", ' class="text-gray-400 text-base md:text-lg italic" role="status" aria-live="polite">Initializing AI...</p>'], ae = ["<svg", ' class="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>'];
function re() {
  onMount(() => {
    ie();
  }), W({ onSpace: e, onEscape: () => p("ready") });
  const e = () => {
    l.isMicEnabled && (p("listening"), q());
  };
  return ssr(ee, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 60%)") + ssrStyleProperty(";filter:", "blur(30px)"), escape(createComponent(Show, { get when() {
    return l.state === "speaking";
  }, get children() {
    return ssr(X, ssrHydrationKey(), ssrStyleProperty("box-shadow:", "0 0 10px rgba(0, 255, 0, 0.5)"));
  } })), escape(createComponent(Show, { get when() {
    return l.state === "listening";
  }, get children() {
    return ssr(J, ssrHydrationKey(), ssrStyleProperty("box-shadow:", "0 0 10px rgba(0, 100, 255, 0.5)"));
  } })), escape(createComponent(U, { get isActive() {
    return l.state === "speaking";
  } })), escape(createComponent(Show, { get when() {
    return l.currentText;
  }, get fallback() {
    return ssr(te, ssrHydrationKey());
  }, get children() {
    return ssr(O, ssrHydrationKey(), escape(l.currentText));
  } })), ssrAttribute("disabled", !l.isMicEnabled, true), `relative group ripple-effect focus-trap ${l.isMicEnabled ? "" : "opacity-50 cursor-not-allowed"} ${l.isMicEnabled ? "hover:scale-110" : ""}`, ssrStyleProperty("transition:", "all 0.3s ease"), ssrAttribute("aria-label", l.isMicEnabled ? "Activate microphone (Space)" : "Microphone disabled", false) + ssrAttribute("aria-pressed", escape(l.state, true) === "listening", false), escape(createComponent(Show, { get when() {
    return l.isMicEnabled;
  }, get children() {
    return ssr(Q, ssrHydrationKey(), ssrStyleProperty("background:", "radial-gradient(circle, var(--color-ai-glow) 0%, transparent 70%)") + ssrStyleProperty(";filter:", "blur(15px)"));
  } })), escape(createComponent(Show, { get when() {
    return l.state === "listening";
  }, get fallback() {
    return ssr(ae, ssrHydrationKey());
  }, get children() {
    return ssr(Y, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    return l.isMicEnabled;
  }, get children() {
    return ssr(Z, ssrHydrationKey());
  } })), escape(createComponent(Show, { get when() {
    return l.state === "speaking";
  }, children: "AI is speaking..." })), escape(createComponent(Show, { get when() {
    return l.state === "listening";
  }, children: "Listening..." })), escape(createComponent(Show, { get when() {
    return l.state === "processing";
  }, children: "Processing..." })), escape(createComponent(Show, { get when() {
    return l.state === "ready";
  }, children: "Ready" })));
}
async function ie() {
  try {
    p("boot"), await $(1e3), p("ready"), await $(500), p("speaking");
    const e = "Welcome to Mehaal.Tech AI. I am your intelligent assistant. How may I help you today?";
    k(e), await G(e), p("ready");
  } catch (e) {
    console.error("[Hero] AI initialization failed:", e), k("Failed to initialize AI. Please refresh the page.");
  }
}
function $(e) {
  return new Promise((r) => setTimeout(r, e));
}
var ne = ["<div", ' class="fixed inset-0 -z-10 scroll-bg" style="', '" aria-hidden="true"></div>'], se = ["<div", ' class="flex flex-col min-h-screen"><!--$-->', '<!--/--><main id="main-content" class="flex-1 flex items-center justify-center px-4" role="main">', "</main><!--$-->", "<!--/--></div>"], le = ["<div", ' class="relative min-h-screen"><!--$-->', "<!--/--><!--$-->", "<!--/--></div>"];
function ue() {
  const e = () => o.phase === "steady";
  return ssr(le, ssrHydrationKey(), escape(createComponent(P, {})), escape(createComponent(Show, { get when() {
    return e();
  }, get children() {
    return [ssr(ne, ssrHydrationKey(), ssrStyleProperty("background-image:", "url(/body-bg.png)") + ssrStyleProperty(";background-size:", "200% 100%") + ssrStyleProperty(";background-repeat:", "repeat-x")), ssr(se, ssrHydrationKey(), escape(createComponent(j, {})), escape(createComponent(re, {})), escape(createComponent(D, {})))];
  } })));
}

export { ue as default };
//# sourceMappingURL=index112.mjs.map
