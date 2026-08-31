export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "active" | "shipped" | "exploring";
  githubUrl?: string;
  demoUrl?: string;
}

export interface ProjectsNotice {
  title: string;
  subtitle: string;
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
