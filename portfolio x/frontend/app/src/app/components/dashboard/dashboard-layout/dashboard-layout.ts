import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
})
export class DashboardLayoutComponent {
  user = signal(this.authService.currentUser);

  navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      iconPath:
        'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
      adminOnly: false,
    },
    {
      name: 'Personal Info',
      href: '/dashboard/personal-info',
      iconPath:
        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      adminOnly: true,
    },
    {
      name: 'Skills',
      href: '/dashboard/skills',
      iconPath:
        'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      adminOnly: true,
    },
    {
      name: 'Experience',
      href: '/dashboard/experience',
      iconPath:
        'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8',
      adminOnly: true,
    },
    {
      name: 'Education',
      href: '/dashboard/education',
      iconPath:
        'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      adminOnly: true,
    },
    {
      name: 'Portfolio',
      href: '/dashboard/portfolio',
      iconPath:
        'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      adminOnly: true,
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      iconPath:
        'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      adminOnly: true,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      iconPath:
        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      adminOnly: false,
    },
  ];

  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
