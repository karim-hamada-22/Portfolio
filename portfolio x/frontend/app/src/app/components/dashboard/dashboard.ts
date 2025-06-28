import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  DashboardService,
  DashboardStats,
} from '../../services/dashboard.service';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout';
import { interval, type Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  user = signal(this.authService.currentUser);
  loading = signal(true);
  stats = signal<DashboardStats>({
    totalProjects: 0,
    totalSkills: 0,
    totalEducation: 0,
    totalMessages: 0,
    unreadMessages: 0,
    profileViews: 0,
    featuredProjects: 0,
    recentActivity: [],
  });
  lastUpdated = signal<Date>(new Date());

  private refreshSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    console.log('🔄 Loading dashboard data...');
    this.loading.set(true);

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('✅ Dashboard data loaded:', stats);
        this.stats.set(stats);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        this.loading.set(false);
      },
    });
  }

  private setupAutoRefresh(): void {
    // Refresh dashboard data every 30 seconds
    this.refreshSubscription = interval(30000)
      .pipe(switchMap(() => this.dashboardService.getDashboardStats()))
      .subscribe({
        next: (stats) => {
          console.log('🔄 Auto-refreshed dashboard data');
          this.stats.set(stats);
          this.lastUpdated.set(new Date());
        },
        error: (error) => {
          console.error('❌ Error auto-refreshing dashboard:', error);
        },
      });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  navigateToSection(section: string): void {
    this.router.navigate([`/dashboard/${section}`]);
  }
  trackByIndex(index: number): number {
    return index;
  }
}
