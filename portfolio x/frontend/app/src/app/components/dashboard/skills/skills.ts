import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout';
import { SkillService } from '../../../services/skill.service';
import { Skill } from '../../../models/skill.model';

@Component({
  selector: 'app-skills-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardLayoutComponent],
  templateUrl: './skills.html',
  styleUrls: ['./skills.css'],
})
export class SkillsManagementComponent implements OnInit {
  skillForm: FormGroup;
  skills = signal<Skill[]>([]);
  skillsLoading = signal(true);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  message = signal('');
  isSuccess = signal(false);

  constructor(private fb: FormBuilder, private skillService: SkillService) {
    console.log('🔧 SkillsManagementComponent constructor called');
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      category: ['frontend', Validators.required],
      proficiency: [
        50,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      yearsOfExperience: [0, [Validators.min(0)]],
      description: [''],
      icon: [''],
      featured: [false],
    });
  }

  ngOnInit(): void {
    console.log('🔄 SkillsManagementComponent ngOnInit called');
    this.loadSkills();
  }

  // Use index-based tracking to avoid undefined errors
  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadSkills(): void {
    console.log('🔄 Loading skills...');
    this.skillsLoading.set(true);
    this.message.set('');

    this.skillService.getSkills().subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);
        console.log('📊 Response type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));

        // Handle different response formats
        let skillsArray: any[] = [];

        if (Array.isArray(data)) {
          skillsArray = data;
          console.log('📊 Using array directly:', skillsArray);
        } else if (data && typeof data === 'object' && data.skills) {
          skillsArray = data.skills;
          console.log('📊 Using data.skills:', skillsArray);
        } else if (data && typeof data === 'object') {
          skillsArray = [data];
          console.log('📊 Converting single object to array:', skillsArray);
        }

        console.log('📊 Final skills array:', skillsArray);
        console.log('📊 Array length:', skillsArray.length);

        // Log each skill individually
        skillsArray.forEach((skill, index) => {
          console.log(`📊 Skill ${index}:`, skill);
        });

        this.skills.set(skillsArray);
        this.skillsLoading.set(false);

        console.log('🔄 Skills signal value after setting:', this.skills());
      },
      error: (error) => {
        console.error('❌ Error loading skills:', error);
        this.message.set(
          'Failed to load skills: ' + (error.error?.message || error.message)
        );
        this.isSuccess.set(false);
        this.skillsLoading.set(false);
        this.skills.set([]);
      },
    });
  }

  getCategoryDisplay(category: string): string {
    if (!category) return 'Unknown Category';

    const categoryMap: { [key: string]: string } = {
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      database: 'Database & Storage',
      tools: 'Tools & Technologies',
      'soft-skills': 'Soft Skills',
      other: 'Other',
    };
    return categoryMap[category] || category;
  }

  editSkill(skill: any): void {
    if (!skill) {
      console.error('❌ Cannot edit skill: skill is null/undefined', skill);
      return;
    }

    const skillId = skill._id || skill.id;
    if (!skillId) {
      console.error('❌ Cannot edit skill: no valid ID found', skill);
      return;
    }

    console.log('✏️ Editing skill:', skill);
    this.editingId.set(skillId);
    this.showForm.set(true);
    this.skillForm.patchValue({
      name: skill.name || '',
      category: skill.category || 'frontend',
      proficiency: skill.proficiency || 50,
      yearsOfExperience: skill.yearsOfExperience || 0,
      description: skill.description || '',
      icon: skill.icon || '',
      featured: skill.featured || false,
    });
  }

  cancelEdit(): void {
    console.log('❌ Canceling edit');
    this.showForm.set(false);
    this.editingId.set(null);
    this.skillForm.reset({
      category: 'frontend',
      proficiency: 50,
      yearsOfExperience: 0,
      featured: false,
    });
    this.message.set('');
  }

  onSubmit(): void {
    if (this.skillForm.valid) {
      console.log('📤 Submitting skill form:', this.skillForm.value);
      this.loading.set(true);
      this.message.set('');

      const request = this.editingId()
        ? this.skillService.updateSkill(this.editingId()!, this.skillForm.value)
        : this.skillService.createSkill(this.skillForm.value);

      request.subscribe({
        next: (response) => {
          console.log('✅ Skill operation successful:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loading.set(false);
          this.cancelEdit();
          this.loadSkills();
        },
        error: (error) => {
          console.error('❌ Skill operation failed:', error);
          this.message.set(error.error?.message || 'Operation failed');
          this.isSuccess.set(false);
          this.loading.set(false);
        },
      });
    } else {
      console.log('❌ Form is invalid:', this.skillForm.errors);
      this.message.set('Please fill in all required fields');
      this.isSuccess.set(false);
    }
  }

  deleteSkill(id: string): void {
    if (!id) {
      console.error('❌ Cannot delete skill: invalid ID', id);
      return;
    }

    if (confirm('Are you sure you want to delete this skill?')) {
      console.log('🗑️ Deleting skill:', id);
      this.skillService.deleteSkill(id).subscribe({
        next: (response) => {
          console.log('✅ Skill deleted:', response);
          this.message.set(response.message);
          this.isSuccess.set(true);
          this.loadSkills();
        },
        error: (error) => {
          console.error('❌ Delete failed:', error);
          this.message.set(error.error?.message || 'Delete failed');
          this.isSuccess.set(false);
        },
      });
    }
  }
}
