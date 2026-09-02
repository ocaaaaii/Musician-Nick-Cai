"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeNames } from "@/i18n/locale-names";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { FadeDivider } from "@/components/ui/FadeDivider";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const navLinks = [
    { href: "/#about", label: t("about") },
    { href: "/sheets", label: t("sheets") },
    { href: "/lessons", label: t("lessons") },
    { href: "/commissions", label: t("commissions") },
  ] as const;

  // A hash link to a section on the *current* page (e.g. clicking "/#about"
  // while already on "/") doesn't trigger a real route change, so Next's
  // own scroll-to-hash handling never runs and its default scroll-restore
  // behavior fights any manual scroll we attempt. Cross-page hash links
  // (e.g. clicking it from /sheets) go through an actual navigation, where
  // Next's default `scroll` behavior already lands correctly on its own -
  // so only the same-page case needs `scroll={false}` + manual handling.
  const isSamePageHash = (href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return false;
    const targetPath = href.slice(0, hashIndex) || "/";
    return pathname === targetPath;
  };

  const handleHashNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1 || !isSamePageHash(href)) return;

    const targetId = href.slice(hashIndex + 1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", `${pathname}#${targetId}`);
  };

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [langOpen]);

  return (
    <header className="sticky top-0 z-40 bg-bone/90 backdrop-blur">
      <FadeDivider className="absolute bottom-0" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Nick Cai
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <UnderlineLink
              key={link.href}
              href={link.href}
              scroll={!isSamePageHash(link.href)}
              onClick={(e) => handleHashNav(e, link.href)}
              className="font-mono text-xs uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-ink"
            >
              {link.label}
            </UnderlineLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div ref={langRef} className="relative">
            <button
              type="button"
              aria-label={t("switchLocale")}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((open) => !open)}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-brass"
            >
              {localeNames[locale as keyof typeof localeNames]}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                strokeWidth={1.5}
              />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-28 border border-ink/5 bg-bone py-1 shadow-[0_2px_8px_rgba(28,29,31,0.1)]">
                {routing.locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname}
                    locale={loc}
                    onClick={() => setLangOpen(false)}
                    className={`block px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors hover:bg-ink/5 ${
                      loc === locale ? "text-brass" : "text-ink/80"
                    }`}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={t("cart")}
            className="text-ink/80 transition-colors hover:text-brass"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className="text-ink/80 transition-colors hover:text-brass md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-ink/10 px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              scroll={!isSamePageHash(link.href)}
              className="py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-brass"
              onClick={(e) => {
                setMenuOpen(false);
                handleHashNav(e, link.href);
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
