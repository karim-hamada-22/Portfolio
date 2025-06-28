import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContactService } from './contact.service';
import { ContactStats } from '../models/contact.model';

export interface DashboardStats {
  totalProjects: number;
  totalSkills: number;
  totalEducation: number;
  totalMessages: number;
  unreadMessages: number;
  profileViews: number;
  featuredProjects: number;
  recentActivity: ActivityItem[];
  contactStats?: ContactStats; // Add this line
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'skill' | 'education' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly API_BASE = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private contactService: ContactService
  ) {
    console.log('🔧 DashboardService initialized');
  }

  getDashboardStats(): Observable<DashboardStats> {
    console.log('📊 Fetching dashboard statistics...');

    // Fetch data from all APIs in parallel
    const portfolios$ = this.http.get<any>(`${this.API_BASE}/portfolio`).pipe(
      map((response) =>
        Array.isArray(response)
          ? response
          : response && Array.isArray(response.portfolios)
          ? response.portfolios
          : []
      ),
      catchError((error) => {
        console.error('❌ Error fetching portfolios for dashboard:', error);
        return of([]);
      })
    );

    const skills$ = this.http.get<any>(`${this.API_BASE}/skills`).pipe(
      map((response) =>
        Array.isArray(response)
          ? response
          : response && Array.isArray(response.skills)
          ? response.skills
          : []
      ),
      catchError((error) => {
        console.error('❌ Error fetching skills for dashboard:', error);
        return of([]);
      })
    );

    const education$ = this.http.get<any>(`${this.API_BASE}/education`).pipe(
      map((response) =>
        Array.isArray(response) ? response : response?.educations || []
      ),
      catchError((error) => {
        console.error('❌ Error fetching education for dashboard:', error);
        return of([]);
      })
    );

    // Use ContactService instead of direct HTTP call for consistency
    const messages$ = this.contactService.getContacts().pipe(
      map((response: any) =>
        Array.isArray(response)
          ? response
          : response && Array.isArray(response.contacts)
          ? response.contacts
          : []
      ),
      catchError((error) => {
        console.error('❌ Error fetching contacts for dashboard:', error);
        return of([]);
      })
    );

    const profileViews$ = of(Math.floor(Math.random() * 1000) + 100); // Simulated views

    return forkJoin({
      portfolios: portfolios$,
      skills: skills$,
      education: education$,
      messages: messages$,
      profileViews: profileViews$,
    }).pipe(
      map((data) => {
        const stats: DashboardStats = {
          totalProjects: data.portfolios.length,
          totalSkills: data.skills.length,
          totalEducation: data.education.length,
          totalMessages: data.messages.length,
          unreadMessages: data.messages.filter(
            (msg: any) => msg.status === 'unread'
          ).length,
          profileViews: data.profileViews,
          featuredProjects: data.portfolios.filter((p: any) => p.featured)
            .length,
          recentActivity: this.generateRecentActivity(data),
        };

        console.log('✅ Dashboard stats fetched:', stats);
        return stats;
      }),
      catchError((error) => {
        console.error('❌ Error fetching dashboard stats:', error);
        return of({
          totalProjects: 0,
          totalSkills: 0,
          totalEducation: 0,
          totalMessages: 0,
          unreadMessages: 0,
          profileViews: 0,
          featuredProjects: 0,
          recentActivity: [],
        });
      })
    );
  }

  private generateRecentActivity(data: any): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Add recent projects
    data.portfolios.slice(0, 3).forEach((project: any) => {
      activities.push({
        id: project._id,
        type: 'project',
        title: `Added project: ${project.title}`,
        description: project.description?.substring(0, 100) + '...',
        timestamp: new Date(project.createdAt || Date.now()),
        icon: '📁',
      });
    });

    // Add recent skills
    data.skills.slice(0, 2).forEach((skill: any) => {
      activities.push({
        id: skill._id,
        type: 'skill',
        title: `Added skill: ${skill.name}`,
        description: `${skill.category} - ${skill.proficiency}% proficiency`,
        timestamp: new Date(skill.createdAt || Date.now()),
        icon: '🛠️',
      });
    });

    // Add recent education
    data.education.slice(0, 2).forEach((edu: any) => {
      activities.push({
        id: edu._id,
        type: 'education',
        title: `Added education: ${edu.degree}`,
        description: `${edu.institution} - ${edu.fieldOfStudy}`,
        timestamp: new Date(edu.createdAt || Date.now()),
        icon: '🎓',
      });
    });

    // Add recent messages
    data.messages.slice(0, 2).forEach((message: any) => {
      activities.push({
        id: message._id,
        type: 'message',
        title: `New message: ${message.subject}`,
        description: `From ${message.name} (${message.email})`,
        timestamp: new Date(message.createdAt || Date.now()),
        icon: '📧',
      });
    });

    // Sort by timestamp (newest first)
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }

  // Method to refresh stats (useful for real-time updates)
  refreshStats(): Observable<DashboardStats> {
    return this.getDashboardStats();
  }
}
