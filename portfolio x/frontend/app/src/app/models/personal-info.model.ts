export interface PersonalInfo {
  _id: string;
  fullName: string;
  title: string;
  bio: string;
  profileImage: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
  resume: string;
  availability: 'available' | 'busy' | 'not-available';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonalInfoRequest {
  fullName: string;
  title: string;
  bio: string;
  profileImage?: string;
  location?: string;
  email: string;
  phone?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  resume?: string;
  availability: 'available' | 'busy' | 'not-available';
}
