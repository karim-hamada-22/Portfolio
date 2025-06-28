export interface Skill {
  _id: string;
  name: string;
  category:
    | 'frontend'
    | 'backend'
    | 'database'
    | 'tools'
    | 'soft-skills'
    | 'other';
  proficiency: number;
  icon: string;
  description: string;
  yearsOfExperience: number;
  featured: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillRequest {
  name: string;
  category:
    | 'frontend'
    | 'backend'
    | 'database'
    | 'tools'
    | 'soft-skills'
    | 'other';
  proficiency: number;
  icon?: string;
  description?: string;
  yearsOfExperience?: number;
  featured: boolean;
}
