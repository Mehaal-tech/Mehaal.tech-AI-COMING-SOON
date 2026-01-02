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
      {/* Header Section with animated background */}
      <header style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: "80px",
        "z-index": "10",
        overflow: "hidden"
      }}
      role="banner">
        <div 
          style={{
            position: "absolute",
            inset: "0",
            opacity: "0.3",
            "background-image": "url(/backgroundh.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            animation: "scroll-bg 30s linear infinite",
            "will-change": "background-position"
          }}
          aria-hidden="true"
        />
      </header>

      {/* Main Body Section with animated background */}
      <main style={{
        position: "absolute",
        inset: "0",
        overflow: "hidden"
      }}
      role="main">
        <div 
          style={{
            position: "absolute",
            inset: "0",
            opacity: "0.2",
            "background-image": "url(/background.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            animation: "scroll-bg 40s linear infinite",
            "will-change": "background-position"
          }}
          aria-hidden="true"
        />
        
        {/* Hero Animation */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "100%"
        }}>
          <HeroAnimation />
        </div>
      </main>

      {/* Footer Section with animated background */}
      <footer style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "80px",
        "z-index": "10",
        overflow: "hidden",
        display: "flex",
        "align-items": "center",
        "justify-content": "center"
      }}
      role="contentinfo">
        <div 
          style={{
            position: "absolute",
            inset: "0",
            opacity: "0.3",
            "background-image": "url(/backgroundh.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            animation: "scroll-bg 30s linear infinite",
            "will-change": "background-position"
          }}
          aria-hidden="true"
        />
        
        {/* Footer Logo */}
        <img 
          src="/footer-logo.png" 
          alt="Mehaal.tech - Powered by AI" 
          style={{
            position: "relative",
            height: "64px",
            "object-fit": "contain",
            "z-index": "10",
            filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))"
          }}
          loading="lazy"
        />
      </footer>
    </div>
  );
}
