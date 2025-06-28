import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Contact,
  CreateContactRequest,
  ContactStats,
} from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly API_URL = 'http://localhost:5000/api/contact';

  constructor(private http: HttpClient) {
    console.log('🔧 ContactService initialized with API_URL:', this.API_URL);
  }

  submitContact(
    contact: CreateContactRequest
  ): Observable<{ message: string; contact: Partial<Contact> }> {
    console.log('📡 Submitting contact:', contact);
    return this.http
      .post<{ message: string; contact: Partial<Contact> }>(
        this.API_URL,
        contact
      )
      .pipe(
        catchError((error) => {
          console.error('❌ Contact submission error:', error);
          if (error.status === 500) {
            console.error(
              '🚨 Server Error: Check if contact API endpoints exist on backend'
            );
          }
          return throwError(() => error);
        })
      );
  }

  getContacts(status?: string): Observable<Contact[]> {
    let url = this.API_URL;
    if (status) {
      url += `?status=${status}`;
    }
    console.log('📡 Getting contacts from:', url);

    return this.http.get<any>(url).pipe(
      map((response) => {
        console.log('✅ Raw contacts response:', response);
        // Handle both array response and object with contacts property
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.contacts) {
          return response.contacts;
        } else if (response && typeof response === 'object') {
          return [response];
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('❌ Contacts API Error:', error);
        if (error.status === 500) {
          console.error(
            '🚨 Server Error: Check if contact API endpoints exist on backend'
          );
        }
        return throwError(() => error);
      })
    );
  }

  getContact(id: string): Observable<Contact> {
    console.log('📡 Getting contact:', id);
    return this.http.get<Contact>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error('❌ Get contact error:', error);
        return throwError(() => error);
      })
    );
  }

  updateContactStatus(
    id: string,
    status: 'unread' | 'read' | 'replied'
  ): Observable<{ message: string; contact: Contact }> {
    console.log('📡 Updating contact status:', id, 'to', status);
    return this.http
      .patch<{ message: string; contact: Contact }>(
        `${this.API_URL}/${id}/status`,
        { status }
      )
      .pipe(
        catchError((error) => {
          console.error('❌ Update contact status error:', error);
          return throwError(() => error);
        })
      );
  }

  deleteContact(id: string): Observable<{ message: string }> {
    console.log('📡 Deleting contact:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error('❌ Delete contact error:', error);
        return throwError(() => error);
      })
    );
  }

  // New method to get contact statistics for dashboard
  getContactStats(): Observable<ContactStats> {
    console.log('📡 Getting contact statistics');
    return this.http.get<ContactStats>(`${this.API_URL}/stats/summary`).pipe(
      catchError((error) => {
        console.error('❌ Contact stats error:', error);
        // Return default stats if API fails
        return throwError(() => ({
          total: 0,
          unread: 0,
          read: 0,
          replied: 0,
          responseRate: 0,
        }));
      })
    );
  }

  // Method to get recent contacts for dashboard activity
  getRecentContacts(limit = 5): Observable<Contact[]> {
    console.log('📡 Getting recent contacts, limit:', limit);
    return this.http.get<Contact[]>(`${this.API_URL}?limit=${limit}`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response.slice(0, limit);
        } else if (response && (response as any).contacts) {
          return (response as any).contacts.slice(0, limit);
        }
        return [];
      }),
      catchError((error) => {
        console.error('❌ Recent contacts error:', error);
        return throwError(() => []);
      })
    );
  }

  // Method to mark multiple contacts as read
  markMultipleAsRead(
    ids: string[]
  ): Observable<{ message: string; updated: number }> {
    console.log('📡 Marking multiple contacts as read:', ids);
    return this.http
      .patch<{ message: string; updated: number }>(
        `${this.API_URL}/bulk/status`,
        {
          ids,
          status: 'read',
        }
      )
      .pipe(
        catchError((error) => {
          console.error('❌ Bulk update error:', error);
          return throwError(() => error);
        })
      );
  }
}
