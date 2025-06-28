import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  PersonalInfo,
  CreatePersonalInfoRequest,
} from '../models/personal-info.model';

@Injectable({
  providedIn: 'root',
})
export class PersonalInfoService {
  private readonly API_URL = 'http://localhost:5000/api/personal-info';

  constructor(private http: HttpClient) {}

  getPersonalInfo(): Observable<PersonalInfo> {
    console.log('🔍 Fetching personal info from:', this.API_URL);
    return this.http.get<PersonalInfo>(this.API_URL).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error fetching personal info:', error);
        return throwError(() => error);
      })
    );
  }

  createOrUpdatePersonalInfo(
    personalInfo: CreatePersonalInfoRequest
  ): Observable<{ message: string; personalInfo: PersonalInfo }> {
    console.log('💾 Saving personal info to:', this.API_URL);
    console.log('📤 Data being sent:', personalInfo);

    return this.http
      .post<{ message: string; personalInfo: PersonalInfo }>(
        this.API_URL,
        personalInfo
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error saving personal info:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
          return throwError(() => error);
        })
      );
  }
}
