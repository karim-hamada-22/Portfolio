export interface Education {
  _id?: string;
  id?: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  grade?: string;
  description?: string;
  activities?: string[];
  institutionWebsite?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEducationRequest {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  grade?: string;
  description?: string;
  activities?: string[];
  institutionWebsite?: string;
}
