import { Reveal, Stagger, RevealItem } from "@/components/ui/AnimatedSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import team from "@/lib/data/team.json";
import type { TeamMember } from "@/lib/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="flex h-full flex-col items-start">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-accent-soft font-mono text-lg text-accent">
        {initials(member.name)}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {member.role}
      </p>
      {(member.githubUrl || member.linkedinUrl) && (
        <div className="mt-4 flex gap-4 text-sm">
          {member.githubUrl && (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              GitHub
            </a>
          )}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

export function Team() {
  const members = team as TeamMember[];

  return (
    <section id="team" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel index="04">Team</SectionLabel>
      </Reveal>
      <Reveal>
        <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Meet your e-board.
        </h2>
      </Reveal>

      <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <RevealItem key={member.id} className="h-full">
            <MemberCard member={member} />
          </RevealItem>
        ))}
      </Stagger>
    </section>
  );
}
