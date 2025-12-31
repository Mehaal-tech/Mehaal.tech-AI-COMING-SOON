'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Header from './Header';
import Hero from './Hero';
import { ARIA_LABELS } from 'lib/accessibility';

interface PageLayoutProps {
  uiPhase: number;
  logoStyle: any;
  isSpeaking: boolean;
  voiceError: string;
}

export function PageLayout({ uiPhase, logoStyle, isSpeaking, voiceError }: PageLayoutProps) {
  const flashOverlayClass = useMemo(
    () =>
      uiPhase === 3
        ? 'opacity-80 pointer-events-auto duration-500 ease-in-out'
        : 'opacity-0 pointer-events-none duration-[1500ms] ease-out',
    [uiPhase]
  );

  const backgroundStyle = useMemo(
    () =>
      uiPhase >= 4
        ? {
            backgroundImage: 'url("/brand/wave-gradient.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }
        : {},
    [uiPhase]
  );

  return (
    <>
      {/* Error/Status Message */}
      {voiceError && uiPhase >= 4 && (
        <div
          className="fixed top-4 right-4 z-[60] bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md rounded-lg px-4 py-2 text-yellow-300 text-sm animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Warning:</span> ⚠️ {voiceError}
        </div>
      )}

      <div
        className="flex flex-col min-h-screen bg-black relative overflow-hidden transition-all duration-1000"
        style={backgroundStyle}
        id="main-content"
      >
        {/* FLASH OVERLAY */}
        <div className={`fixed inset-0 z-[100] bg-purple-300 mix-blend-overlay ${flashOverlayClass}`}></div>
        <div className={`fixed inset-0 z-[99] bg-white/80 ${flashOverlayClass}`}></div>

        {/* Overlay */}
        {uiPhase >= 4 && <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000"></div>}

        {/* HERO LOGO - Priority LCP Image */}
        <Image
          src="/brand/mehaal-logo.svg"
          alt={ARIA_LABELS.LOGO}
          className="fixed z-50 object-contain"
          style={logoStyle as any}
          priority
          draggable={false}
          width={400}
          height={400}
          aria-label={isSpeaking ? ARIA_LABELS.SPEAKING : ARIA_LABELS.LOGO}
        />

        {/* Content */}
        <div className={`relative z-10 transition-opacity duration-1000 ${uiPhase === 4 ? 'opacity-100' : 'opacity-0'}`}>
          <Header navItems={[]} showThemeSwitch={false} />
          <main>
            <Hero title="Coming Soon" subtitle="Intelligence beyond impossible" buttons={[]} />
          </main>
        </div>
      </div>
    </>
  );
}
