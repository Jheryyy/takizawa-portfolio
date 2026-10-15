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
}

export interface GuestbookEntry {
  id: string;
  name: string;
  handle: string;
  role: string;
  time: string;
  message: string;
  likes: number;
}
