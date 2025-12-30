import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

import "styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mehaal.Tech AI - Intelligence Beyond Impossible",
    template: "%s | Mehaal.Tech AI",
  },
  description: "Experience the future of AI technology with Mehaal.Tech. Advanced voice AI, intelligent automation, and cutting-edge solutions powered by next-generation artificial intelligence.",
  keywords: ["AI", "Artificial Intelligence", "Mehaal", "Voice AI", "Tech Innovation", "Machine Learning", "OpenAI", "Voice Assistant"],
  authors: [{ name: "Mehaal.Tech", url: "https://mehaal.tech" }],
  creator: "Mehaal.Tech",
  publisher: "Mehaal.Tech",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://mehaal.tech",
    languages: {
      "en-US": "https://mehaal.tech/en",
      "ur": "https://mehaal.tech/ur",
      "hi": "https://mehaal.tech/hi",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ur_PK", "hi_IN"],
    url: "https://mehaal.tech",
    title: "Mehaal.Tech AI - Intelligence Beyond Impossible",
    description: "Experience the future of AI technology with Mehaal.Tech. Advanced voice AI, intelligent automation, and cutting-edge solutions.",
    siteName: "Mehaal.Tech AI",
    images: [
      {
        url: "https://mehaal.tech/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mehaal.Tech AI - Intelligence Beyond Impossible",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehaal.Tech AI - Intelligence Beyond Impossible",
    description: "Experience the future of AI technology with Mehaal.Tech.",
    images: ["https://mehaal.tech/og-image.png"],
    creator: "@mehaal_tech",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mehaal.Tech AI",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <link rel="icon" href="/brand/FAVICON.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/FAVICON.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9D00FF" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        
        {/* DNS Prefetch for external APIs */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        
        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Mehaal.Tech AI',
              description: 'AI-powered voice assistant with multi-language support',
              url: 'https://mehaal.tech',
              applicationCategory: 'Productivity',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="bg-white dark:bg-black min-h-screen" suppressHydrationWarning>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-purple-600 focus:text-white focus:p-2 focus:rounded-br"
        >
          Skip to main content
        </a>
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
