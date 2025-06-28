import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceService } from '../../services/experience.service';
import { Experience } from '../../models/experience.model';

@Component({
  selector: 'app-experience-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience-timeline.html',
  styleUrls: ['./experience-timeline.css'],
})
export class ExperienceTimelineComponent implements OnInit {
  experiences = signal<Experience[]>([]);
  loading = signal(true);

  constructor(private experienceService: ExperienceService) {}

  ngOnInit(): void {
    this.fetchExperiences();
  }

  private fetchExperiences(): void {
    this.experienceService.getExperiences().subscribe({
      next: (data) => {
        this.experiences.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching experiences:', error);
        this.loading.set(false);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }
  trackByExperienceId(index: number): number {
    return index;
  }
}
