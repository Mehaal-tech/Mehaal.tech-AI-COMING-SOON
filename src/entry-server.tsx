// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* SEO Meta Tags */}
          <title>Mehaal.tech - Revolutionary AI Voice Platform | Launching Soon</title>
          <meta name="description" content="Experience the future of AI-powered voice interactions. Mehaal.tech is launching soon with revolutionary voice AI technology for seamless human-AI communication." />
          <meta name="keywords" content="AI voice, voice AI, OpenAI, Whisper, speech recognition, voice assistant, AI technology, Mehaal.tech" />
          <meta name="author" content="Mehaal.tech" />
          <meta name="robots" content="index, follow" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://mehaal.tech/" />
          <meta property="og:title" content="Mehaal.tech - Revolutionary AI Voice Platform" />
          <meta property="og:description" content="Experience the future of AI-powered voice interactions. Launching soon with revolutionary voice AI technology." />
          <meta property="og:image" content="https://mehaal.tech/brand/FULL-LOGO-LIGHT.png" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://mehaal.tech/" />
          <meta property="twitter:title" content="Mehaal.tech - Revolutionary AI Voice Platform" />
          <meta property="twitter:description" content="Experience the future of AI-powered voice interactions. Launching soon." />
          <meta property="twitter:image" content="https://mehaal.tech/brand/FULL-LOGO-LIGHT.png" />
          
          {/* Favicons */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
          
          {/* Theme Color */}
          <meta name="theme-color" content="#000000" />
          
          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Mehaal.tech",
              "url": "https://mehaal.tech",
              "logo": "https://mehaal.tech/brand/LOGO-LIGHT.png",
              "description": "Revolutionary AI voice platform for seamless human-AI communication",
              "foundingDate": "2026",
              "sameAs": [
                "https://twitter.com/mehaaltech",
                "https://linkedin.com/company/mehaaltech"
              ]
            })}
          </script>
          
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
