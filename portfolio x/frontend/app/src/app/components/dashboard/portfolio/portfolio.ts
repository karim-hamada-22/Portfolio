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
import { PortfolioService } from '../../../services/portfolio.service';
import { Portfolio } from '../../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './portfolio.html',
  styleUrls: ['./portfolio.css'],
})
export class PortfolioManagementComponent implements OnInit {
  portfolioForm: FormGroup;
  portfolios = signal<Portfolio[]>([]);
  portfoliosLoading = signal(true);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  message = signal('');
  isSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService
  ) {
    console.log('🔧 PortfolioManagementComponent constructor called');
    this.portfolioForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technologies: this.fb.array([]),
      imageUrl: [''], // Remove pattern validator to make it truly optional
      projectUrl: [''], // Remove pattern validator to make it truly optional
      githubUrl: [''], // Remove pattern validator to make it truly optional
      category: ['web', Validators.required],
      featured: [false],
    });
  }

  get technologiesArray(): FormArray {
    return this.portfolioForm.get('technologies') as FormArray;
  }

  ngOnInit(): void {
    console.log('🔄 PortfolioManagementComponent ngOnInit called');
    this.loadPortfolios();
    this.addTechnology(); // Add one technology field by default
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadPortfolios(): void {
    console.log('🔄 Loading portfolios...');
    this.portfoliosLoading.set(true);
    this.message.set('');

    this.portfolioService.getPortfolios().subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);
        console.log('📊 Response type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));

        // Handle different response formats
        let portfoliosArray: any[] = [];

        if (Array.isArray(data)) {
          portfoliosArray = data;
          console.log('📊 Using array directly:', portfoliosArray);
        } else if (data && typeof data === 'object' && data.portfolios) {
          portfoliosArray = data.portfolios;
          console.log('📊 Using data.portfolios:', portfoliosArray);
        } else if (data && typeof data === 'object') {
          portfoliosArray = [data];
          console.log('📊 Converting single object to array:', portfoliosArray);
        }

        console.log('📊 Final portfolios array:', portfoliosArray);
        console.log('📊 Array length:', portfoliosArray.length);

        // Log each portfolio individually
        portfoliosArray.forEach((portfolio, index) => {
          console.log(`📊 Portfolio ${index}:`, portfolio);
        });

        this.portfolios.set(portfoliosArray);
        this.portfoliosLoading.set(false);

        console.log(
          '🔄 Portfolios signal value after setting:',
          this.portfolios()
        );
      },
      error: (error) => {
        console.error('❌ Error loading portfolios:', error);
        this.message.set(
          'Failed to load portfolios: ' +
            (error.error?.message || error.message)
        );
        this.isSuccess.set(false);
        this.portfoliosLoading.set(false);
        this.portfolios.set([]);
      },
    });
  }

  getCategoryDisplay(category: string): string {
    if (!category) return 'Unknown Category';

    const categoryMap: { [key: string]: string } = {
      web: 'Web Application',
      mobile: 'Mobile Application',
      desktop: 'Desktop Application',
      other: 'Other',
    };
    return categoryMap[category] || category;
  }

  addTechnology(): void {
    this.technologiesArray.push(this.fb.control('', Validators.minLength(1)));
  }

  removeTechnology(index: number): void {
    if (this.technologiesArray.length > 0) {
      this.technologiesArray.removeAt(index);
    }
  }

  editPortfolio(portfolio: any): void {
    if (!portfolio) {
      console.error(
        '❌ Cannot edit portfolio: portfolio is null/undefined',
        portfolio
      );
      return;
    }

    const portfolioId = portfolio._id || portfolio.id;
    if (!portfolioId) {
      console.error('❌ Cannot edit portfolio: no valid ID found', portfolio);
      return;
    }

    console.log('✏️ Editing portfolio:', portfolio);
    this.editingId.set(portfolioId);
    this.showForm.set(true);
    this.message.set('');

    // Clear existing technologies
    this.clearTechnologiesArray();

    // Add technologies from portfolio
    if (portfolio.technologies && portfolio.technologies.length > 0) {
      portfolio.technologies.forEach((tech: string) => {
        this.technologiesArray.push(
          this.fb.control(tech, Validators.minLength(1))
        );
      });
    } else {
      // Add at least one empty technology field
      this.addTechnology();
    }

    this.portfolioForm.patchValue({
      title: portfolio.title || '',
      description: portfolio.description || '',
      imageUrl: portfolio.imageUrl || '',
      projectUrl: portfolio.projectUrl || '',
      githubUrl: portfolio.githubUrl || '',
      category: portfolio.category || 'web',
      featured: portfolio.featured || false,
    });
  }

  private clearTechnologiesArray(): void {
    while (this.technologiesArray.length !== 0) {
      this.technologiesArray.removeAt(0);
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
    this.portfolioForm.reset({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      githubUrl: '',
      category: 'web',
      featured: false,
    });
    this.clearTechnologiesArray();
    this.addTechnology(); // Add one technology field by default
  }

  private validateOptionalUrl(url: string): boolean {
    if (!url || url.trim() === '') return true; // Empty is valid
    return /^https?:\/\/.+/.test(url); // Only validate if not empty
  }

  onSubmit(): void {
    // Custom URL validation
    const imageUrl = this.portfolioForm.get('imageUrl')?.value;
    const projectUrl = this.portfolioForm.get('projectUrl')?.value;
    const githubUrl = this.portfolioForm.get('githubUrl')?.value;

    if (imageUrl && !this.validateOptionalUrl(imageUrl)) {
      this.message.set('Please enter a valid image URL or leave it empty');
      this.isSuccess.set(false);
      return;
    }

    if (projectUrl && !this.validateOptionalUrl(projectUrl)) {
      this.message.set('Please enter a valid project URL or leave it empty');
      this.isSuccess.set(false);
      return;
    }

    if (githubUrl && !this.validateOptionalUrl(githubUrl)) {
      this.message.set('Please enter a valid GitHub URL or leave it empty');
      this.isSuccess.set(false);
      return;
    }

    if (!this.portfolioForm.valid) {
      console.log('❌ Form is invalid:', this.portfolioForm.errors);
      console.log('❌ Form status:', this.portfolioForm.status);
      console.log('❌ Form controls status:', {
        title: this.portfolioForm.get('title')?.status,
        description: this.portfolioForm.get('description')?.status,
        category: this.portfolioForm.get('category')?.status,
        technologies: this.portfolioForm.get('technologies')?.status,
      });
      this.markFormGroupTouched();
      this.message.set('Please fill in all required fields correctly');
      this.isSuccess.set(false);
      return;
    }

    console.log('📤 Submitting portfolio form:', this.portfolioForm.value);
    this.loading.set(true);
    this.message.set('');

    const formData = this.prepareFormData();

    const request = this.editingId()
      ? this.portfolioService.updatePortfolio(this.editingId()!, formData)
      : this.portfolioService.createPortfolio(formData);

    request.subscribe({
      next: (response) => {
        console.log('✅ Portfolio operation successful:', response);
        this.message.set(
          response.message || 'Operation completed successfully'
        );
        this.isSuccess.set(true);
        this.loading.set(false);
        this.cancelEdit();
        this.loadPortfolios();
      },
      error: (error) => {
        console.error('❌ Portfolio operation failed:', error);
        this.message.set(
          error.error?.message || error.message || 'Operation failed'
        );
        this.isSuccess.set(false);
        this.loading.set(false);
      },
    });
  }

  private prepareFormData(): any {
    const formValue = { ...this.portfolioForm.value };

    // Filter out empty technologies
    formValue.technologies = (formValue.technologies || []).filter(
      (tech: string) => tech && tech.trim() !== ''
    );

    // Remove empty optional fields
    Object.keys(formValue).forEach((key) => {
      if (
        formValue[key] === '' ||
        formValue[key] === null ||
        formValue[key] === undefined
      ) {
        if (!['title', 'description', 'category'].includes(key)) {
          delete formValue[key];
        }
      }
    });

    return formValue;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.portfolioForm.controls).forEach((key) => {
      const control = this.portfolioForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  deletePortfolio(id: string): void {
    if (!id) {
      console.error('❌ Cannot delete portfolio: invalid ID', id);
      return;
    }

    if (confirm('Are you sure you want to delete this project?')) {
      console.log('🗑️ Deleting portfolio:', id);
      this.portfolioService.deletePortfolio(id).subscribe({
        next: (response) => {
          console.log('✅ Portfolio deleted:', response);
          this.message.set(
            response.message || 'Portfolio deleted successfully'
          );
          this.isSuccess.set(true);
          this.loadPortfolios();
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

  hasFieldError(fieldName: string): boolean {
    const field = this.portfolioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.portfolioForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `${fieldName} is too short`;
    if (errors['pattern']) return 'Please enter a valid URL';

    return 'Invalid input';
  }

  // Debug method to check form status
  debugFormStatus(): void {
    console.log('🔍 Form Debug Info:');
    console.log('Form valid:', this.portfolioForm.valid);
    console.log('Form status:', this.portfolioForm.status);
    console.log('Loading:', this.loading());

    Object.keys(this.portfolioForm.controls).forEach((key) => {
      const control = this.portfolioForm.get(key);
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        status: control?.status,
      });
    });
  }
}
