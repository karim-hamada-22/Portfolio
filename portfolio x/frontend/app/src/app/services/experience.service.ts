import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Experience,
  CreateExperienceRequest,
} from '../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private readonly API_URL = 'http://localhost:5000/api/experience';

  constructor(private http: HttpClient) {
    console.log('🔧 ExperienceService initialized with API_URL:', this.API_URL);
  }

  getExperiences(featured?: boolean): Observable<Experience[]> {
    let url = this.API_URL;
    if (featured) {
      url += '?featured=true';
    }
    console.log('📡 Getting experiences from:', url);
    return this.http.get<Experience[]>(url);
  }

  getExperience(id: string): Observable<Experience> {
    console.log('📡 Getting experience:', id);
    return this.http.get<Experience>(`${this.API_URL}/${id}`);
  }

  createExperience(
    experience: CreateExperienceRequest
  ): Observable<{ message: string; experience: Experience }> {
    console.log('📡 Creating experience:', experience);
    return this.http.post<{ message: string; experience: Experience }>(
      this.API_URL,
      experience
    );
  }

  updateExperience(
    id: string,
    experience: Partial<CreateExperienceRequest>
  ): Observable<{ message: string; experience: Experience }> {
    console.log('📡 Updating experience:', id, experience);
    return this.http.put<{ message: string; experience: Experience }>(
      `${this.API_URL}/${id}`,
      experience
    );
  }

  deleteExperience(id: string): Observable<{ message: string }> {
    console.log('📡 Deleting experience:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
