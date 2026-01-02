import HeroAnimation from "~/components/HeroAnimation";

export default function Home() {
  return (
    <div class="relative w-screen h-screen overflow-hidden bg-black">
      {/* Header Section with animated background */}
      <header class="absolute top-0 left-0 right-0 h-20 z-10 overflow-hidden">
        <div 
          class="absolute inset-0 opacity-30"
          style={{
            "background-image": "url(/backgroundh.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            "animation": "scroll-bg 30s linear infinite"
          }}
        />
      </header>

      {/* Main Body Section with animated background */}
      <main class="absolute inset-0 overflow-hidden">
        <div 
          class="absolute inset-0 opacity-20"
          style={{
            "background-image": "url(/background.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            "animation": "scroll-bg 40s linear infinite"
          }}
        />
        
        {/* Hero Animation */}
        <div class="relative w-full h-full">
          <HeroAnimation />
        </div>
      </main>

      {/* Footer Section with animated background */}
      <footer class="absolute bottom-0 left-0 right-0 h-20 z-10 overflow-hidden flex items-center justify-center">
        <div 
          class="absolute inset-0 opacity-30"
          style={{
            "background-image": "url(/backgroundh.png)",
            "background-size": "auto 100%",
            "background-repeat": "repeat-x",
            "animation": "scroll-bg 30s linear infinite"
          }}
        />
        
        {/* Footer Logo */}
        <img 
          src="/footer-logo.png" 
          alt="Footer Logo" 
          class="relative h-16 object-contain z-10"
          style={{
            filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))"
          }}
        />
      </footer>
    </div>
  );
}
