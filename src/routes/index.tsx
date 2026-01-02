import HeroAnimation from "~/components/HeroAnimation";

export default function Home() {
  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "#0a0a12"
    }}>
      {/* Header Section */}
      <header style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: "70px",
        "z-index": "100",
        display: "flex",
        "align-items": "center",
        "padding-left": "24px",
        "padding-right": "24px",
        gap: "20px"
      }}
      role="banner">
        {/* Header Background - Scrolling */}
        <div 
          style={{
            position: "absolute",
            inset: "0",
            "background-image": "url(/brand/header-bg.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            animation: "scroll-bg-rtl 60s linear infinite",
            opacity: "0.4"
          }}
          aria-hidden="true"
        />
        
        {/* Header Logo - Left */}
        <img 
          src="/brand/LOGO-LIGHT.png" 
          alt="Mehaal.tech" 
          style={{
            position: "relative",
            height: "44px",
            "object-fit": "contain",
            "z-index": "10"
          }}
          loading="eager"
        />
        
        {/* Tagline */}
        <h2 style={{
          position: "relative",
          color: "#7c6aef",
          "font-size": "clamp(14px, 2.5vw, 22px)",
          "font-weight": "600",
          "font-style": "italic",
          "font-family": "CabinetGrotesk-Variable, sans-serif",
          "letter-spacing": "0.15em",
          "z-index": "10",
          margin: "0"
        }}>
          Intelligence Beyond Impossible
        </h2>
      </header>

      {/* Main Body Section */}
      <main style={{
        position: "absolute",
        top: "70px",
        bottom: "50px",
        left: "0",
        right: "0",
        overflow: "hidden"
      }}
      role="main">
        {/* Body Background - Scrolling */}
        <div 
          style={{
            position: "absolute",
            inset: "0",
            "background-image": "url(/brand/body-bg.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            animation: "scroll-bg-rtl 120s linear infinite",
            opacity: "0.15"
          }}
          aria-hidden="true"
        />
        
        {/* Hero Animation */}
        <HeroAnimation />
      </main>

      {/* Footer Section */}
      <footer style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "50px",
        "z-index": "100",
        display: "flex",
        "align-items": "center",
        "padding-left": "24px",
        "padding-right": "24px",
        gap: "16px"
      }}
      role="contentinfo">
        {/* Footer Background */}
        <div 
          style={{
            position: "absolute",
            inset: "0",
            background: "#0d0d18",
            "border-top": "1px solid rgba(124, 106, 239, 0.3)"
          }}
          aria-hidden="true"
        />
        
        {/* Footer Logo - Left */}
        <img 
          src="/brand/LOGO-LIGHT.png" 
          alt="Mehaal.tech" 
          style={{
            position: "relative",
            height: "28px",
            "object-fit": "contain",
            "z-index": "10"
          }}
          loading="lazy"
        />
        
        {/* Copyright Text */}
        <p style={{
          position: "relative",
          color: "rgba(124, 106, 239, 0.8)",
          "font-size": "13px",
          "font-family": "CabinetGrotesk-Variable, sans-serif",
          "letter-spacing": "0.2em",
          "z-index": "10",
          margin: "0"
        }}>
          Mehaal.Tech AI Pvt Ltd. All rights reserved 2026
        </p>
      </footer>
    </div>
  );
}
