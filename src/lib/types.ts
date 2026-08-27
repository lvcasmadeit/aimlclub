export interface SiteData {
  name: string;
  university: string;
  tagline: string;
  mission: string;
  email: string;
  discord: string;
  instagram: string;
  github: string;
  linkedin: string;
  campusGroups: string;
  joinUrl: string;
  stats: { label: string; value: string }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "active" | "shipped" | "exploring";
  githubUrl?: string;
  demoUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  isLead: boolean;
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

export interface FaqItem {
  question: string;
  answer: string;
}
