import site from "@/lib/data/site.json";

const marqueeWords = [
  "Students with GPUs",
  "Ship before the syllabus catches up",
  "Learn in public",
  "Build the future",
  "From notebook to product",
];

const socials = [
  { label: "Discord", href: site.discord },
  { label: "Instagram", href: site.instagram },
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "CampusGroups", href: site.campusGroups },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="overflow-hidden border-b border-border py-4">
        <div className="flex w-max animate-marquee gap-8 font-mono text-sm uppercase tracking-[0.2em] text-muted">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={i} className="flex items-center gap-8">
              {word}
              <span className="text-accent">+</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm">
            <span className="text-accent">{"//"}</span> {site.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {site.university} · {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
