export interface Experience {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'freelance'
    | 'internship';
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  companyLogo: string;
  companyWebsite: string;
  featured: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceRequest {
  jobTitle: string;
  company: string;
  location?: string;
  employmentType:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'freelance'
    | 'internship';
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  companyLogo?: string;
  companyWebsite?: string;
  featured: boolean;
}
