import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HomeHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('userDropdown', { static: false }) userDropdown!: ElementRef;

  user = signal(this.authService.currentUser);
  isAuthenticated = signal(this.authService.isAuthenticated);
  showUserDropdown = signal(false);

  private clickSubscription?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Listen for clicks outside dropdown to close it
    this.clickSubscription = fromEvent(document, 'click').subscribe(
      (event: Event) => {
        if (
          this.userDropdown &&
          !this.userDropdown.nativeElement.contains(event.target)
        ) {
          this.showUserDropdown.set(false);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  navigateToDashboard(): void {
    this.showUserDropdown.set(false);
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile(): void {
    this.showUserDropdown.set(false);
    this.router.navigate(['/dashboard/profile']);
  }

  navigateToSettings(): void {
    this.showUserDropdown.set(false);
    this.router.navigate(['/dashboard/personal-info']);
  }

  logout(): void {
    this.showUserDropdown.set(false);
    this.authService.logout();
  }

  login(): void {
    this.router.navigate(['/auth/login']);
  }

  getRoleDisplayName(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'User';
      case 'moderator':
        return 'Moderator';
      default:
        return 'User';
    }
  }

  getRoleColor(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'moderator':
        return 'role-moderator';
      default:
        return 'role-user';
    }
  }

  getUserInitials(username: string): string {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  }
}
