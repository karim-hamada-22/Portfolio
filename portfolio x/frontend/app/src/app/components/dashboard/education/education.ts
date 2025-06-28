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
import { EducationService } from '../../../services/education.service';
import { Education } from '../../../models/education.model';

@Component({
  selector: 'app-education-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './education.html',
  styleUrls: ['./education.css'],
})
export class EducationManagementComponent implements OnInit {
  educationForm: FormGroup;
  educations = signal<Education[]>([]);
  educationsLoading = signal(true);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  message = signal('');
  isSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService
  ) {
    console.log('🔧 EducationManagementComponent constructor called');
    this.educationForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      degree: ['', [Validators.required, Validators.minLength(2)]],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(2)]],
      institution: ['', [Validators.required, Validators.minLength(2)]],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      grade: [''],
      description: [''],
      activities: this.fb.array([]),
      institutionWebsite: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  get activitiesArray(): FormArray {
    return this.educationForm.get('activities') as FormArray;
  }

  ngOnInit(): void {
    console.log('🔄 EducationManagementComponent ngOnInit called');
    this.loadEducations();
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions(): void {
    this.educationForm.get('current')?.valueChanges.subscribe((isCurrent) => {
      const endDateControl = this.educationForm.get('endDate');
      if (isCurrent) {
        endDateControl?.disable();
        endDateControl?.setValue('');
      } else {
        endDateControl?.enable();
      }
    });
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadEducations(): void {
    console.log('🔄 Loading educations...');
    this.educationsLoading.set(true);
    this.message.set('');

    this.educationService.getEducations().subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);
        console.log('📊 Response type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));

        // Handle different response formats
        let educationsArray: any[] = [];

        if (Array.isArray(data)) {
          educationsArray = data;
          console.log('📊 Using array directly:', educationsArray);
        } else if (data && typeof data === 'object' && data.educations) {
          educationsArray = data.educations;
          console.log('📊 Using data.educations:', educationsArray);
        } else if (data && typeof data === 'object') {
          educationsArray = [data];
          console.log('📊 Converting single object to array:', educationsArray);
        }

        console.log('📊 Final educations array:', educationsArray);
        console.log('📊 Array length:', educationsArray.length);

        // Log each education individually
        educationsArray.forEach((education, index) => {
          console.log(`📊 Education ${index}:`, education);
        });

        this.educations.set(educationsArray);
        this.educationsLoading.set(false);

        console.log(
          '🔄 Educations signal value after setting:',
          this.educations()
        );
      },
      error: (error) => {
        console.error('❌ Error loading educations:', error);
        this.message.set(
          'Failed to load educations: ' +
            (error.error?.message || error.message)
        );
        this.isSuccess.set(false);
        this.educationsLoading.set(false);
        this.educations.set([]);
      },
    });
  }

  addActivity(): void {
    this.activitiesArray.push(this.fb.control('', Validators.minLength(1)));
  }

  removeActivity(index: number): void {
    if (this.activitiesArray.length > 0) {
      this.activitiesArray.removeAt(index);
    }
  }

  editEducation(education: any): void {
    if (!education) {
      console.error(
        '❌ Cannot edit education: education is null/undefined',
        education
      );
      return;
    }

    const educationId = education._id || education.id;
    if (!educationId) {
      console.error('❌ Cannot edit education: no valid ID found', education);
      return;
    }

    console.log('✏️ Editing education:', education);
    this.editingId.set(educationId);
    this.showForm.set(true);
    this.message.set('');

    // Clear existing activities
    this.clearActivitiesArray();

    // Add activities if they exist
    if (education.activities && education.activities.length > 0) {
      education.activities.forEach((activity: string) => {
        this.activitiesArray.push(
          this.fb.control(activity, Validators.minLength(1))
        );
      });
    }

    // Format dates for input fields
    const startDate = education.startDate
      ? new Date(education.startDate).toISOString().split('T')[0]
      : '';
    const endDate = education.endDate
      ? new Date(education.endDate).toISOString().split('T')[0]
      : '';

    this.educationForm.patchValue({
      degree: education.degree || '',
      fieldOfStudy: education.fieldOfStudy || '',
      institution: education.institution || '',
      location: education.location || '',
      startDate: startDate,
      endDate: endDate,
      current: education.current || false,
      grade: education.grade || '',
      description: education.description || '',
      institutionWebsite: education.institutionWebsite || '',
    });
  }

  private clearActivitiesArray(): void {
    while (this.activitiesArray.length !== 0) {
      this.activitiesArray.removeAt(0);
    }
  }

  cancelEdit(): void {
    console.log('❌ Canceling edit');
    this.showForm.set(false);
    this.editingId.set(null);
    this.message.set('');
    this.resetForm();
  }

  private resetForm(): void {
    this.educationForm.reset({
      current: false,
      degree: '',
      fieldOfStudy: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: '',
      institutionWebsite: '',
    });
    this.clearActivitiesArray();
  }

  onSubmit(): void {
    if (!this.educationForm.valid) {
      console.log('❌ Form is invalid:', this.educationForm.errors);
      this.markFormGroupTouched();
      this.message.set('Please fill in all required fields correctly');
      this.isSuccess.set(false);
      return;
    }

    console.log('📤 Submitting education form:', this.educationForm.value);
    this.loading.set(true);
    this.message.set('');

    const formData = this.prepareFormData();

    const request = this.editingId()
      ? this.educationService.updateEducation(this.editingId()!, formData)
      : this.educationService.createEducation(formData);

    request.subscribe({
      next: (response) => {
        console.log('✅ Education operation successful:', response);
        this.message.set(
          response.message || 'Operation completed successfully'
        );
        this.isSuccess.set(true);
        this.loading.set(false);
        this.cancelEdit();
        this.loadEducations();
      },
      error: (error) => {
        console.error('❌ Education operation failed:', error);
        this.message.set(
          error.error?.message || error.message || 'Operation failed'
        );
        this.isSuccess.set(false);
        this.loading.set(false);
      },
    });
  }

  private prepareFormData(): any {
    const formValue = { ...this.educationForm.value };

    // Filter out empty activities
    formValue.activities = (formValue.activities || []).filter(
      (activity: string) => activity && activity.trim() !== ''
    );

    // Handle current education (no end date)
    if (formValue.current) {
      formValue.endDate = null;
    }

    // Remove empty optional fields
    Object.keys(formValue).forEach((key) => {
      if (
        formValue[key] === '' ||
        formValue[key] === null ||
        formValue[key] === undefined
      ) {
        if (
          !['degree', 'fieldOfStudy', 'institution', 'startDate'].includes(key)
        ) {
          delete formValue[key];
        }
      }
    });

    return formValue;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.educationForm.controls).forEach((key) => {
      const control = this.educationForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  deleteEducation(id: string): void {
    if (!id) {
      console.error('❌ Cannot delete education: invalid ID', id);
      return;
    }

    if (confirm('Are you sure you want to delete this education?')) {
      console.log('🗑️ Deleting education:', id);
      this.educationService.deleteEducation(id).subscribe({
        next: (response) => {
          console.log('✅ Education deleted:', response);
          this.message.set(
            response.message || 'Education deleted successfully'
          );
          this.isSuccess.set(true);
          this.loadEducations();
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
          this.message.set(
            error.error?.message || error.message || 'Delete failed'
          );
          this.isSuccess.set(false);
        },
      });
    }
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

  hasFieldError(fieldName: string): boolean {
    const field = this.educationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.educationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `${fieldName} is too short`;
    if (errors['pattern'] && fieldName === 'institutionWebsite')
      return 'Please enter a valid URL';

    return 'Invalid input';
  }
}
