export interface Portfolio {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  category: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePortfolioRequest {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  category: string;
  featured?: boolean;
}
