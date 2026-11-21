export type SkillCategory = 'frontend' | 'uiux' | 'backend';

export interface SkillItem {
  name: string;
  category: SkillCategory;
  level: string;
  tag: string;
}

export type ProjectCategory = 'Frontend Web' | 'UI/UX Case Study' | 'Fullstack';

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: ProjectCategory;
  shortDesc: string;
  role: string;
  timeline: string;
  arch: string;
  outcome: string;
  image: string;
  tech: string[];
  problem: string;
  design: string;
  code: string;
  liveUrl?: string;
  githubUrl?: string;
}

export interface GuestbookReply {
  id: string;
  parentId: string;
  name: string;
  handle: string;
  role: string;
  time: string;
  message: string;
  likes: number;
  isAdmin?: boolean;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  handle: string;
  role: string;
  time: string;
  message: string;
  likes: number;
  isAdmin?: boolean;
  replies?: GuestbookReply[];
}

export interface SiteContent {
  heroGreeting: string;
  heroName: string;
  heroTypingTexts: string[];
  heroPhilosophyTitle: string;
  heroPhilosophyDesc: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutSchoolBadge: string;
  aboutBioP1: string;
  aboutBioP2: string;
  contactEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  githubUrl: string;
  skills: SkillItem[];
  primaryColor?: string;
  tertiaryColor?: string;
  colorPresetId?: string;
}
