import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EducationService } from '../../services/education.service';
import { Education } from '../../models/education.model';

@Component({
  selector: 'app-education-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-timeline.component.html',
  styleUrls: ['./education-timeline.component.css'],
})
export class EducationTimelineComponent implements OnInit {
  educations = signal<Education[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private educationService: EducationService) {}

  ngOnInit(): void {
    this.loadEducations();
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  private loadEducations(): void {
    console.log('🔄 Loading educations for timeline...');
    this.loading.set(true);
    this.error.set(null);

    this.educationService.getEducations().subscribe({
      next: (data: any) => {
        console.log('✅ Educations loaded for timeline:', data);

        // Handle different response formats
        let educationsArray: any[] = [];

        if (Array.isArray(data)) {
          educationsArray = data;
        } else if (data && typeof data === 'object' && data.educations) {
          educationsArray = data.educations;
        } else if (data && typeof data === 'object') {
          educationsArray = [data];
        }

        // Sort by start date (most recent first)
        educationsArray.sort((a, b) => {
          const dateA = new Date(a.startDate || 0).getTime();
          const dateB = new Date(b.startDate || 0).getTime();
          return dateB - dateA;
        });

        this.educations.set(educationsArray);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading educations:', error);
        this.error.set('Failed to load education history');
        this.loading.set(false);
        this.educations.set([]);
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  }

  formatDateRange(
    startDate: string,
    endDate?: string,
    current?: boolean
  ): string {
    const start = this.formatDate(startDate);

    if (current) {
      return `${start} - Present`;
    }

    if (endDate) {
      const end = this.formatDate(endDate);
      return `${start} - ${end}`;
    }

    return start;
  }

  calculateDuration(
    startDate: string,
    endDate?: string,
    current?: boolean
  ): string {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = current ? new Date() : endDate ? new Date(endDate) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month

    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;

    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${
      remainingMonths !== 1 ? 's' : ''
    }`;
  }

  getGradeDisplay(grade?: string): string {
    if (!grade) return '';

    // Handle different grade formats
    if (grade.includes('/')) {
      return `Grade: ${grade}`;
    } else if (grade.toLowerCase().includes('gpa')) {
      return grade;
    } else {
      return `Grade: ${grade}`;
    }
  }
}
