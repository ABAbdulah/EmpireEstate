// Generic project/activity engine — shared between construction, IT, pharma, etc.

export type StaffType = 'junior' | 'middle' | 'senior' | 'designer' | 'team_leader' | 'tester';

export interface ProjectDef {
  id: string;
  businessId: string;
  name: string;
  emoji: string;
  tier: number;
  unlockAfter: number;             // need N completed of previous tier (0 = unlocked by default)
  durationSeconds: number;
  cost: string;
  reward: string;
  staffRequired?: Partial<Record<StaffType, number>>;
  description?: string;
}

// ─── Construction projects (6 tiers) ────────────────────────────────────────
export const CONSTRUCTION_PROJECTS: ProjectDef[] = [
  { id: 'c_house',      businessId: 'construction', name: 'Private House',      emoji: '🏠', tier: 1, unlockAfter: 0,  durationSeconds: 15 * 60,         cost: '50000',     reward: '80000',     description: 'Small residential project' },
  { id: 'c_apartment',  businessId: 'construction', name: 'Apartment Building', emoji: '🏢', tier: 2, unlockAfter: 10, durationSeconds: 60 * 60,         cost: '500000',    reward: '900000',    description: 'Mid-rise residential' },
  { id: 'c_office',     businessId: 'construction', name: 'Office Building',    emoji: '🏬', tier: 3, unlockAfter: 10, durationSeconds: 3 * 60 * 60,     cost: '5000000',   reward: '9000000',   description: 'Commercial office space' },
  { id: 'c_penthouse',  businessId: 'construction', name: 'Penthouse Complex',  emoji: '🏯', tier: 4, unlockAfter: 10, durationSeconds: 6 * 60 * 60,     cost: '50000000',  reward: '90000000',  description: 'Luxury residential tower' },
  { id: 'c_skyscraper', businessId: 'construction', name: 'Skyscraper',         emoji: '🏙️', tier: 5, unlockAfter: 10, durationSeconds: 12 * 60 * 60,    cost: '500000000', reward: '900000000', description: 'Iconic city landmark' },
  { id: 'c_trade',      businessId: 'construction', name: 'Trade Center',       emoji: '🌆', tier: 6, unlockAfter: 10, durationSeconds: 24 * 60 * 60,    cost: '5000000000',reward: '9000000000',description: 'Massive mixed-use complex' },
];

// ─── IT projects (6 tiers, with staff requirements) ─────────────────────────
export const IT_PROJECTS: ProjectDef[] = [
  { id: 'it_website',   businessId: 'it', name: 'Website MVP',          emoji: '🌐', tier: 1, unlockAfter: 0,  durationSeconds: 20 * 60,         cost: '5000',      reward: '20000',     staffRequired: { junior: 2 },                                              description: 'Static landing page' },
  { id: 'it_mobile',    businessId: 'it', name: 'Mobile App',           emoji: '📱', tier: 2, unlockAfter: 10, durationSeconds: 60 * 60,         cost: '50000',     reward: '200000',    staffRequired: { junior: 2, middle: 1 },                                   description: 'iOS + Android MVP' },
  { id: 'it_ecommerce', businessId: 'it', name: 'E-commerce Platform',  emoji: '🛒', tier: 3, unlockAfter: 10, durationSeconds: 3 * 60 * 60,     cost: '500000',    reward: '2000000',   staffRequired: { middle: 2, senior: 1, designer: 1 },                      description: 'Full storefront with payments' },
  { id: 'it_cloud',     businessId: 'it', name: 'Cloud Migration',      emoji: '☁️', tier: 4, unlockAfter: 10, durationSeconds: 6 * 60 * 60,     cost: '5000000',   reward: '20000000',  staffRequired: { senior: 2, team_leader: 1, tester: 1 },                   description: 'AWS/Azure infrastructure project' },
  { id: 'it_erp',       businessId: 'it', name: 'ERP Implementation',   emoji: '⚙️', tier: 5, unlockAfter: 10, durationSeconds: 12 * 60 * 60,    cost: '50000000',  reward: '200000000', staffRequired: { senior: 3, team_leader: 2, designer: 2, tester: 2 },      description: 'Enterprise resource planning system' },
  { id: 'it_ai',        businessId: 'it', name: 'AI Platform',          emoji: '🤖', tier: 6, unlockAfter: 10, durationSeconds: 24 * 60 * 60,    cost: '500000000', reward: '2000000000',staffRequired: { senior: 4, team_leader: 3, designer: 3, tester: 3 },      description: 'End-to-end AI/ML platform' },
];

export const ALL_PROJECTS: ProjectDef[] = [
  ...CONSTRUCTION_PROJECTS,
  ...IT_PROJECTS,
];

export function getProjectsForBusiness(businessId: string): ProjectDef[] {
  return ALL_PROJECTS.filter((p) => p.businessId === businessId);
}

export function getProjectById(projectId: string): ProjectDef | undefined {
  return ALL_PROJECTS.find((p) => p.id === projectId);
}

// Check whether a project is unlocked given completion counts of its sector
export function isProjectUnlocked(project: ProjectDef, completedCounts: Record<string, number>): boolean {
  if (project.unlockAfter === 0) return true;
  const sectorProjects = ALL_PROJECTS.filter((p) => p.businessId === project.businessId);
  const previousTier = sectorProjects.find((p) => p.tier === project.tier - 1);
  if (!previousTier) return true;
  return (completedCounts[previousTier.id] ?? 0) >= project.unlockAfter;
}
