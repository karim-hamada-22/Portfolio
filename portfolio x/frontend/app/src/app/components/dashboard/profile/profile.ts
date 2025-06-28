import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  user = signal(this.authService.currentUser);
  message = signal('');
  isSuccess = signal(false);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Component initialization
  }

  logout(): void {
    this.authService.logout();
  }
}
