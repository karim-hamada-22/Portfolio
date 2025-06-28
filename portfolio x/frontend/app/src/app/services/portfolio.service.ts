import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Portfolio, CreatePortfolioRequest } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private readonly API_URL = 'http://localhost:5000/api/portfolio';

  constructor(private http: HttpClient) {
    console.log('🔧 PortfolioService initialized with API_URL:', this.API_URL);
  }

  getPortfolios(params?: {
    category?: string;
    featured?: boolean;
  }): Observable<Portfolio[]> {
    let url = this.API_URL;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.featured) queryParams.append('featured', 'true');
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    console.log('📡 Getting portfolios from:', url);

    return this.http.get<any>(url).pipe(
      map((response) => {
        // Handle both array response and object with portfolios property
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.portfolios) {
          return response.portfolios;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('❌ Portfolio API Error:', error);
        if (error.status === 500) {
          console.error(
            '🚨 Server Error: Check if portfolio API endpoints exist on backend'
          );
        }
        return throwError(() => error);
      })
    );
  }

  getPortfolio(id: string): Observable<Portfolio> {
    console.log('📡 Getting portfolio:', id);
    return this.http.get<Portfolio>(`${this.API_URL}/${id}`);
  }

  createPortfolio(
    portfolio: CreatePortfolioRequest
  ): Observable<{ message: string; portfolio: Portfolio }> {
    console.log('📡 Creating portfolio:', portfolio);
    return this.http.post<{ message: string; portfolio: Portfolio }>(
      this.API_URL,
      portfolio
    );
  }

  updatePortfolio(
    id: string,
    portfolio: Partial<CreatePortfolioRequest>
  ): Observable<{ message: string; portfolio: Portfolio }> {
    console.log('📡 Updating portfolio:', id, portfolio);
    return this.http.put<{ message: string; portfolio: Portfolio }>(
      `${this.API_URL}/${id}`,
      portfolio
    );
  }

  deletePortfolio(id: string): Observable<{ message: string }> {
    console.log('📡 Deleting portfolio:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  toggleFeatured(
    id: string
  ): Observable<{ message: string; portfolio: Portfolio }> {
    console.log('📡 Toggling featured status:', id);
    return this.http.patch<{ message: string; portfolio: Portfolio }>(
      `${this.API_URL}/${id}/featured`,
      {}
    );
  }
}
