import HeroAnimation from "~/components/HeroAnimation";

export default function Home() {
  console.log("Home component rendering");
  
  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "#000"
    }}>
      {/* Header Section */}
      <header style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: "60px",
        "z-index": "50",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "background": "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)"
      }}
      role="banner">
        <img 
          src="/brand/LOGO-LIGHT.png" 
          alt="Mehaal.tech" 
          style={{
            height: "36px",
            "object-fit": "contain"
          }}
          loading="eager"
        />
      </header>

      {/* Main Body Section */}
      <main style={{
        position: "absolute",
        inset: "0",
        overflow: "hidden"
      }}
      role="main">
        {/* Hero Animation */}
        <HeroAnimation />
      </main>

      {/* Footer Section */}
      <footer style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "40px",
        "z-index": "50",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "background": "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)"
      }}
      role="contentinfo">
        <p style={{
          color: "rgba(0, 255, 255, 0.6)",
          "font-size": "12px",
          "font-family": "CabinetGrotesk-Variable, sans-serif"
        }}>
          © 2026 Mehaal.tech — AI Voice Platform
        </p>
      </footer>
    </div>
  );
}
