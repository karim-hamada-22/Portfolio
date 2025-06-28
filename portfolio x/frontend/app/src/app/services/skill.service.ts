import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill, CreateSkillRequest } from '../models/skill.model';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly API_URL = 'http://localhost:5000/api/skills';

  constructor(private http: HttpClient) {
    console.log('🔧 SkillService initialized with API_URL:', this.API_URL);
  }

  getSkills(params?: {
    category?: string;
    featured?: boolean;
  }): Observable<Skill[]> {
    let url = this.API_URL;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.featured) queryParams.append('featured', 'true');
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    console.log('📡 Getting skills from:', url);
    return this.http.get<Skill[]>(url);
  }

  getSkill(id: string): Observable<Skill> {
    console.log('📡 Getting skill:', id);
    return this.http.get<Skill>(`${this.API_URL}/${id}`);
  }

  createSkill(
    skill: CreateSkillRequest
  ): Observable<{ message: string; skill: Skill }> {
    console.log('📡 Creating skill:', skill);
    return this.http.post<{ message: string; skill: Skill }>(
      this.API_URL,
      skill
    );
  }

  updateSkill(
    id: string,
    skill: Partial<CreateSkillRequest>
  ): Observable<{ message: string; skill: Skill }> {
    console.log('📡 Updating skill:', id, skill);
    return this.http.put<{ message: string; skill: Skill }>(
      `${this.API_URL}/${id}`,
      skill
    );
  }

  deleteSkill(id: string): Observable<{ message: string }> {
    console.log('📡 Deleting skill:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
