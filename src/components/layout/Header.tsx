"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import blackLogo from "@/assets/blacktransparent.png";
import whiteLogo from "@/assets/whitetransparent.png";
import site from "@/lib/data/site.json";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#meetings", label: "Meetings" },
  { href: "#projects", label: "Projects" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
];

function overlayOffset() {
  const eventBar = document.querySelector("[data-next-event-bar]");
  return 64 + (eventBar ? 40 : 0);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    function updateActive() {
      const offset = overlayOffset();
      let current: string | null = null;
      for (const link of navLinks) {
        const section = document.getElementById(link.href.slice(1));
        if (!section) continue;
        if (section.getBoundingClientRect().top <= offset + 16) {
          current = link.href;
        }
      }
      setActiveHref((prev) => (prev === current ? prev : current));
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, []);

  function linkClass(href: string) {
    const selected = activeHref === href;
    return cn(
      "text-sm text-white light:text-black underline-offset-4 decoration-2",
      "hover:underline focus-visible:underline",
      selected && "underline",
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-8">
          <a
            href="#hero"
            className="flex shrink-0 items-center"
            aria-label={site.name}
          >
            <Image
              src={whiteLogo}
              alt=""
              width={whiteLogo.width}
              height={whiteLogo.height}
              className="h-8 w-auto light:hidden"
              aria-hidden
              priority
            />
            <Image
              src={blackLogo}
              alt=""
              width={blackLogo.width}
              height={blackLogo.height}
              className="hidden h-8 w-auto light:block"
              aria-hidden
              priority
            />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                aria-current={activeHref === link.href ? "true" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <a
            href={site.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_var(--color-accent-soft)]"
          >
            Join
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"
          >
            <span className="relative flex h-3 w-4 flex-col justify-between">
              <span
                className={cn(
                  "h-0.5 w-full bg-foreground transition-transform",
                  open && "translate-y-[5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full bg-foreground transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-full bg-foreground transition-transform",
                  open && "-translate-y-[5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-background/90 md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn("px-2 py-2", linkClass(link.href))}
                  aria-current={activeHref === link.href ? "true" : undefined}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={site.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-background"
              >
                Join the club
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
