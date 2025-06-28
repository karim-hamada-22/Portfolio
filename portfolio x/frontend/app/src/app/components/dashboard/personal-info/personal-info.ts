import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout';
import { PersonalInfoService } from '../../../services/personal-info.service';
import { PersonalInfo } from '../../../models/personal-info.model';

@Component({
  selector: 'app-personal-info-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './personal-info.html',
  styleUrls: ['./personal-info.css'],
})
export class PersonalInfoManagementComponent implements OnInit {
  personalInfoForm: FormGroup;
  personalInfo = signal<PersonalInfo | null>(null);
  loading = signal(false);
  message = signal('');
  isSuccess = signal(false);

  constructor(
    private fb: FormBuilder,
    private personalInfoService: PersonalInfoService
  ) {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      title: ['', Validators.required],
      bio: ['', Validators.required],
      profileImage: [''],
      location: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      website: [''],
      linkedin: [''],
      github: [''],
      twitter: [''],
      instagram: [''],
      facebook: [''],
      resume: [''],
      availability: ['available', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPersonalInfo();
  }

  loadPersonalInfo(): void {
    console.log('🔄 Loading personal info...');
    this.personalInfoService.getPersonalInfo().subscribe({
      next: (data) => {
        console.log('✅ Personal info loaded:', data);
        this.personalInfo.set(data);
        this.personalInfoForm.patchValue({
          fullName: data.fullName,
          title: data.title,
          bio: data.bio,
          profileImage: data.profileImage,
          location: data.location,
          email: data.email,
          phone: data.phone,
          website: data.website,
          linkedin: data.socialLinks?.linkedin || '',
          github: data.socialLinks?.github || '',
          twitter: data.socialLinks?.twitter || '',
          instagram: data.socialLinks?.instagram || '',
          facebook: data.socialLinks?.facebook || '',
          resume: data.resume,
          availability: data.availability,
        });
      },
      error: (error) => {
        console.error('❌ Error loading personal info:', error);
        if (error.status === 404) {
          console.log('ℹ️ No personal info found, ready to create new');
        }
      },
    });
  }

  onSubmit(): void {
    console.log('🚀 Form submission started');
    console.log('Form valid:', this.personalInfoForm.valid);
    console.log('Form errors:', this.getFormErrors());

    if (this.personalInfoForm.valid) {
      this.loading.set(true);
      this.message.set('');

      const formData = {
        ...this.personalInfoForm.value,
        socialLinks: {
          linkedin: this.personalInfoForm.value.linkedin || '',
          github: this.personalInfoForm.value.github || '',
          twitter: this.personalInfoForm.value.twitter || '',
          instagram: this.personalInfoForm.value.instagram || '',
          facebook: this.personalInfoForm.value.facebook || '',
        },
      };

      // Remove individual social link fields from the main object
      delete formData.linkedin;
      delete formData.github;
      delete formData.twitter;
      delete formData.instagram;
      delete formData.facebook;

      console.log('📤 Submitting data:', formData);

      this.personalInfoService.createOrUpdatePersonalInfo(formData).subscribe({
        next: (response) => {
          console.log('✅ Save successful:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loading.set(false);
          this.personalInfo.set(response.personalInfo);
        },
        error: (error) => {
          console.error('❌ Save failed:', error);
          let errorMessage = 'Operation failed';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.message.set(errorMessage);
          this.isSuccess.set(false);
          this.loading.set(false);
        },
      });
    } else {
      console.log('❌ Form is invalid');
      this.message.set('Please fill in all required fields correctly');
      this.isSuccess.set(false);
    }
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.personalInfoForm.controls).forEach((key) => {
      const control = this.personalInfoForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
