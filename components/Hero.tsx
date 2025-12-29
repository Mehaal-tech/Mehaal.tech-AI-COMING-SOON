import Link from "next/link";

interface ButtonProps {
  text: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface HeroProps {
  title?: string;
  subtitle?: string;
  buttons?: ButtonProps[];
}

export default function Hero({
  title = "NextJS Template amazing hero!",
  subtitle = "Add something about your saas service or app here.",
  buttons = [
    { text: "Get Started", href: "/get-started", variant: "primary" },
    { text: "Download", href: "https://github.com", variant: "secondary" },
  ],
}: HeroProps) {
  return (
    <section className="text-center my-32 mx-4 sm:mx-8 md:mx-16 lg:mx-24 min-h-[70vh] flex flex-col items-center justify-center pt-32">
      <h1 className="font-sans text-5xl tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-white mb-8 font-bold animate-pulse">
        {title}
      </h1>
      <p className="text-2xl sm:text-3xl md:text-4xl text-white/80 mb-12 font-light max-w-3xl">
        {subtitle}
      </p>
      <div className="flex justify-center gap-6 flex-wrap">
        {buttons.map((button, index) => (
          <Link
            key={index}
            href={button.href}
            className={`px-8 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${
              button.variant === "primary"
                ? "bg-primary text-white hover:bg-primary/90 hover:scale-105"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105"
            }`}
          >
            {button.text}
          </Link>
        ))}
      </div>
    </section>
  );
}
