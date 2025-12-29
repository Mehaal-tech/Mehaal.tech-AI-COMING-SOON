import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import "styles/globals.css";

export const metadata: Metadata = {
  title: "Mehaal.Tech AI - Intelligence Beyond Impossible",
  description: "Experience the future of AI technology with Mehaal.Tech. Advanced voice AI, intelligent automation, and cutting-edge solutions powered by next-generation artificial intelligence.",
  keywords: ["AI", "Artificial Intelligence", "Mehaal", "Voice AI", "Tech Innovation", "Machine Learning"],
  authors: [{ name: "Mehaal.Tech" }],
  creator: "Mehaal.Tech",
  publisher: "Mehaal.Tech",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mehaal.tech",
    title: "Mehaal.Tech AI - Intelligence Beyond Impossible",
    description: "Experience the future of AI technology with Mehaal.Tech. Advanced voice AI, intelligent automation, and cutting-edge solutions.",
    siteName: "Mehaal.Tech AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehaal.Tech AI - Intelligence Beyond Impossible",
    description: "Experience the future of AI technology with Mehaal.Tech.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/FAVICON.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/FAVICON.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9D00FF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-black min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
