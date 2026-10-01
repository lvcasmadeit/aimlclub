export type AboutCardId = "hacks" | "speakers" | "workshops" | "projects";

export interface AboutCard {
  id: AboutCardId;
  title: string;
  blurb: string;
  /** Floating "+ chip" tags shown while the card is spotlighted. */
  chips?: string[];
  /** In-page anchor or URL for the arrow button. */
  href: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "active" | "shipped" | "exploring";
  githubUrl?: string;
  demoUrl?: string;
  coverImageUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  /** Optional end time; when set, event cards show a start–end range. */
  endDate?: string;
  location: string;
  description: string;
  rsvpUrl?: string;
}

export interface PastMeeting {
  id: string;
  title: string;
  date: string;
  summary: string;
  recapUrl?: string;
}

export interface MeetingsData {
  upcoming: UpcomingMeeting[];
  past: PastMeeting[];
}

export type TimelineEntry =
  | (PastMeeting & { kind: "past" })
  | (UpcomingMeeting & { kind: "upcoming" });

export interface FaqItem {
  question: string;
  answer: string;
}
