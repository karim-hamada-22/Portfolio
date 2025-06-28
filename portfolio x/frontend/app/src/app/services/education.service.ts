import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Education, CreateEducationRequest } from '../models/education.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  private readonly API_URL = 'http://localhost:5000/api/education';

  constructor(private http: HttpClient) {
    console.log('🔧 EducationService initialized with API_URL:', this.API_URL);
  }

  getEducations(): Observable<Education[]> {
    console.log('📡 Getting educations from:', this.API_URL);
    return this.http.get<Education[]>(this.API_URL).pipe(
      catchError((error) => {
        console.error('❌ API Error:', error);
        if (error.status === 500) {
          console.error(
            '🚨 Server Error: Check if education API endpoints exist on backend'
          );
        }
        return throwError(() => error);
      })
    );
  }

  getEducation(id: string): Observable<Education> {
    console.log('📡 Getting education:', id);
    return this.http.get<Education>(`${this.API_URL}/${id}`);
  }

  createEducation(
    education: CreateEducationRequest
  ): Observable<{ message: string; education: Education }> {
    console.log('📡 Creating education:', education);
    return this.http.post<{ message: string; education: Education }>(
      this.API_URL,
      education
    );
  }

  updateEducation(
    id: string,
    education: Partial<CreateEducationRequest>
  ): Observable<{ message: string; education: Education }> {
    console.log('📡 Updating education:', id, education);
    return this.http.put<{ message: string; education: Education }>(
      `${this.API_URL}/${id}`,
      education
    );
  }

  deleteEducation(id: string): Observable<{ message: string }> {
    console.log('📡 Deleting education:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
