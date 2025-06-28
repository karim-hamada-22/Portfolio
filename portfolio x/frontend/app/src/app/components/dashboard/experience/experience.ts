import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout';
import { ExperienceService } from '../../../services/experience.service';
import { Experience } from '../../../models/experience.model';

@Component({
  selector: 'app-experience-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './experience.html',
  styleUrls: ['./experience.css'],
})
export class ExperienceManagementComponent implements OnInit {
  experienceForm: FormGroup;
  experiences = signal<Experience[]>([]);
  experiencesLoading = signal(true);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  message = signal('');
  isSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private experienceService: ExperienceService
  ) {
    this.experienceForm = this.fb.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      employmentType: ['full-time', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: ['', Validators.required],
      responsibilities: this.fb.array([]),
      technologies: this.fb.array([]),
      achievements: this.fb.array([]),
      featured: [false],
    });
  }

  get responsibilitiesArray(): FormArray {
    return this.experienceForm.get('responsibilities') as FormArray;
  }

  get technologiesArray(): FormArray {
    return this.experienceForm.get('technologies') as FormArray;
  }

  get achievementsArray(): FormArray {
    return this.experienceForm.get('achievements') as FormArray;
  }

  ngOnInit(): void {
    console.log('🔄 ExperienceManagementComponent initialized');
    this.loadExperiences();
    this.addResponsibility();
    this.addTechnology();
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadExperiences(): void {
    console.log('🔄 Loading experiences...');
    this.experiencesLoading.set(true);
    this.experienceService.getExperiences().subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);

        // Handle different response formats
        let experiencesArray: any[] = [];

        if (Array.isArray(data)) {
          experiencesArray = data;
        } else if (data && typeof data === 'object' && data.experiences) {
          experiencesArray = data.experiences;
        } else if (data && typeof data === 'object') {
          experiencesArray = [data];
        }

        console.log('📊 Final experiences array:', experiencesArray);
        this.experiences.set(experiencesArray);
        this.experiencesLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading experiences:', error);
        this.message.set(
          'Failed to load experiences: ' +
            (error.error?.message || error.message)
        );
        this.isSuccess.set(false);
        this.experiencesLoading.set(false);
        this.experiences.set([]);
      },
    });
  }

  addResponsibility(): void {
    this.responsibilitiesArray.push(this.fb.control(''));
  }

  removeResponsibility(index: number): void {
    this.responsibilitiesArray.removeAt(index);
  }

  addTechnology(): void {
    this.technologiesArray.push(this.fb.control(''));
  }

  removeTechnology(index: number): void {
    this.technologiesArray.removeAt(index);
  }

  addAchievement(): void {
    this.achievementsArray.push(this.fb.control(''));
  }

  removeAchievement(index: number): void {
    this.achievementsArray.removeAt(index);
  }

  editExperience(experience: any): void {
    if (!experience) {
      console.error(
        '❌ Cannot edit experience: experience is null/undefined',
        experience
      );
      return;
    }

    const experienceId = experience._id || experience.id;
    if (!experienceId) {
      console.error('❌ Cannot edit experience: no valid ID found', experience);
      return;
    }

    console.log('✏️ Editing experience:', experience);
    this.editingId.set(experienceId);
    this.showForm.set(true);

    // Clear existing arrays
    while (this.responsibilitiesArray.length !== 0) {
      this.responsibilitiesArray.removeAt(0);
    }
    while (this.technologiesArray.length !== 0) {
      this.technologiesArray.removeAt(0);
    }
    while (this.achievementsArray.length !== 0) {
      this.achievementsArray.removeAt(0);
    }

    // Add data from experience
    if (experience.responsibilities && experience.responsibilities.length > 0) {
      experience.responsibilities.forEach((resp: string) => {
        this.responsibilitiesArray.push(this.fb.control(resp));
      });
    } else {
      this.addResponsibility();
    }

    if (experience.technologies && experience.technologies.length > 0) {
      experience.technologies.forEach((tech: string) => {
        this.technologiesArray.push(this.fb.control(tech));
      });
    } else {
      this.addTechnology();
    }

    if (experience.achievements && experience.achievements.length > 0) {
      experience.achievements.forEach((ach: string) => {
        this.achievementsArray.push(this.fb.control(ach));
      });
    }

    this.experienceForm.patchValue({
      jobTitle: experience.jobTitle || '',
      company: experience.company || '',
      location: experience.location || '',
      employmentType: experience.employmentType || 'full-time',
      startDate: experience.startDate ? experience.startDate.split('T')[0] : '',
      endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
      current: experience.current || false,
      description: experience.description || '',
      featured: experience.featured || false,
    });
  }

  cancelEdit(): void {
    console.log('❌ Canceling edit');
    this.showForm.set(false);
    this.editingId.set(null);
    this.experienceForm.reset({
      employmentType: 'full-time',
      current: false,
      featured: false,
    });
    this.message.set('');

    // Reset arrays
    while (this.responsibilitiesArray.length !== 0) {
      this.responsibilitiesArray.removeAt(0);
    }
    while (this.technologiesArray.length !== 0) {
      this.technologiesArray.removeAt(0);
    }
    while (this.achievementsArray.length !== 0) {
      this.achievementsArray.removeAt(0);
    }
    this.addResponsibility();
    this.addTechnology();
  }

  onSubmit(): void {
    if (this.experienceForm.valid) {
      console.log('📤 Submitting experience form:', this.experienceForm.value);
      this.loading.set(true);
      this.message.set('');

      const formData = { ...this.experienceForm.value };
      formData.responsibilities = formData.responsibilities.filter(
        (resp: string) => resp.trim() !== ''
      );
      formData.technologies = formData.technologies.filter(
        (tech: string) => tech.trim() !== ''
      );
      formData.achievements = formData.achievements.filter(
        (ach: string) => ach.trim() !== ''
      );

      const request = this.editingId()
        ? this.experienceService.updateExperience(this.editingId()!, formData)
        : this.experienceService.createExperience(formData);

      request.subscribe({
        next: (response) => {
          console.log('✅ Experience operation successful:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loading.set(false);
          this.cancelEdit();
          this.loadExperiences();
        },
        error: (error) => {
          console.error('❌ Experience operation failed:', error);
          this.message.set(error.error?.message || 'Operation failed');
          this.isSuccess.set(false);
          this.loading.set(false);
        },
      });
    } else {
      console.log('❌ Form is invalid:', this.experienceForm.errors);
    }
  }

  deleteExperience(id: string): void {
    if (!id) {
      console.error('❌ Cannot delete experience: invalid ID', id);
      return;
    }

    if (confirm('Are you sure you want to delete this experience?')) {
      console.log('🗑️ Deleting experience:', id);
      this.experienceService.deleteExperience(id).subscribe({
        next: (response) => {
          console.log('✅ Experience deleted:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loadExperiences();
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
          this.message.set(error.error?.message || 'Delete failed');
          this.isSuccess.set(false);
        },
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }
}
