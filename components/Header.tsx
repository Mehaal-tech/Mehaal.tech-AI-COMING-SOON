import Link from "next/link";
import Image from "next/image";
import ThemeSwitch from "./ThemeSwitch";

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  brandName?: string;
  navItems?: NavItem[];
  showThemeSwitch?: boolean;
}

export default function Header({
  logoSrc = "/brand/mehaal-logo.svg",
  logoAlt = "Mehaal Logo",
  logoWidth = 180,
  logoHeight = 60,
  brandName,
  navItems = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ],
  showThemeSwitch = true,
}: HeaderProps) {
  return (
    <header className="bg-white/5 dark:bg-black/30 backdrop-blur-md border-b border-gray-200/10 dark:border-white/10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {logoSrc ? (
            <Image 
              src={logoSrc} 
              alt={logoAlt} 
              width={logoWidth} 
              height={logoHeight}
              className="h-16 w-auto"
            />
          ) : brandName ? (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
          ) : null}
        </Link>
        <nav className="flex items-center">
          {navItems.length > 0 ? (
            <>
              <ul className="flex space-x-2 mr-2">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-700 dark:text-white/90 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-md hover:bg-gray-100/50 dark:hover:bg-white/10 transition-all"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {showThemeSwitch && <ThemeSwitch />}
            </>
          ) : (
            showThemeSwitch && <ThemeSwitch />
          )}
        </nav>
      </div>
    </header>
  );
}
