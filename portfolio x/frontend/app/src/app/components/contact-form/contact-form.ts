import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.css'],
})
export class ContactFormComponent {
  contactForm: FormGroup;
  loading = signal(false);
  message = signal('');
  isSuccess = signal(false);

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading.set(true);
      this.message.set('');

      this.contactService.submitContact(this.contactForm.value).subscribe({
        next: (response) => {
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.contactForm.reset();
          this.loading.set(false);
        },
        error: (error) => {
          this.message.set(error.error?.message || 'Failed to send message');
          this.isSuccess.set(false);
          this.loading.set(false);
        },
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.contactForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
    }
    return null;
  }
}
