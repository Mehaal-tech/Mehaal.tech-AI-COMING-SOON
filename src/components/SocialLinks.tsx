import { For } from "solid-js";

interface SocialLink {
  name: string;
  url: string;
  icon: string;
  ariaLabel: string;
}

export default function SocialLinks() {
  const socialLinks: SocialLink[] = [
    {
      name: "Twitter",
      url: "https://twitter.com/mehaaltech",
      icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
      ariaLabel: "Follow us on Twitter"
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/company/mehaaltech",
      icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
      ariaLabel: "Connect with us on LinkedIn"
    },
    {
      name: "GitHub",
      url: "https://github.com/mehaaltech",
      icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
      ariaLabel: "Check out our GitHub"
    },
    {
      name: "Email",
      url: "mailto:hello@mehaal.tech",
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
      ariaLabel: "Email us"
    }
  ];

  return (
    <div class="flex gap-4 justify-center items-center">
      <For each={socialLinks}>
        {(link) => (
          <a
            href={link.url}
            target={link.name !== "Email" ? "_blank" : undefined}
            rel={link.name !== "Email" ? "noopener noreferrer" : undefined}
            class="group relative p-3 rounded-full bg-black/50 border border-cyan-500/30 hover:border-cyan-500 transition-all hover:scale-110 active:scale-95"
            style={{
              "box-shadow": "0 0 15px rgba(0, 255, 255, 0.2)"
            }}
            aria-label={link.ariaLabel}
          >
            <svg
              class="w-6 h-6 text-cyan-300 group-hover:text-cyan-100 transition-colors"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d={link.icon} />
            </svg>
            
            {/* Tooltip */}
            <span 
              class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-cyan-300 text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
              style={{
                "font-family": "CabinetGrotesk-Variable, sans-serif",
                "box-shadow": "0 0 10px rgba(0, 255, 255, 0.3)"
              }}
            >
              {link.name}
            </span>
          </a>
        )}
      </For>
    </div>
  );
}
