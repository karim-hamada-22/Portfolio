import type { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./components/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./components/auth/register/register').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'dashboard/portfolio',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/portfolio/portfolio').then(
        (m) => m.PortfolioManagementComponent
      ),
  },
  {
    path: 'dashboard/skills',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/skills/skills').then(
        (m) => m.SkillsManagementComponent
      ),
  },
  {
    path: 'dashboard/experience',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/experience/experience').then(
        (m) => m.ExperienceManagementComponent
      ),
  },
  {
    path: 'dashboard/education',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/education/education').then(
        (m) => m.EducationManagementComponent
      ),
  },
  {
    path: 'dashboard/personal-info',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/personal-info/personal-info').then(
        (m) => m.PersonalInfoManagementComponent
      ),
  },
  {
    path: 'dashboard/messages',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard/messages/messages').then(
        (m) => m.MessagesComponent
      ),
  },
  {
    path: 'dashboard/profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/profile/profile').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
