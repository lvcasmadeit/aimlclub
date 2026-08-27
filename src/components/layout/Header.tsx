"use client";

import { useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import site from "@/lib/data/site.json";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#meetings", label: "Meetings" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        style={{ scaleX: progress }}
      />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#hero"
          className="font-mono text-sm font-medium tracking-tight"
        >
          <span className="text-accent">{"//"}</span> {site.name}
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
          <a
            href={site.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_var(--color-accent-soft)]"
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
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-hover hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={site.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-accent px-4 py-2 text-center text-sm font-medium text-background"
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
