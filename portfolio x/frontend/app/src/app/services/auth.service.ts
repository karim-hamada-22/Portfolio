import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isLoading = signal(true);

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSubject.next(token);
      this.getCurrentUser().subscribe({
        next: (response) => {
          this.currentUserSubject.next(response.user);
          this.isLoading.set(false);
        },
        error: () => {
          this.logout();
          this.isLoading.set(false);
        },
      });
    } else {
      this.isLoading.set(false);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log(
      '🔐 AuthService: Attempting login to:',
      `${this.API_URL}/login`
    );
    console.log('🔐 AuthService: Credentials:', {
      ...credentials,
      password: '[HIDDEN]',
    });

    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('✅ AuthService: Login successful:', response);
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error('❌ AuthService: Login failed:', error);
          console.error('❌ AuthService: Error status:', error.status);
          console.error('❌ AuthService: Error message:', error.message);
          console.error('❌ AuthService: Error body:', error.error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/me`);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}
