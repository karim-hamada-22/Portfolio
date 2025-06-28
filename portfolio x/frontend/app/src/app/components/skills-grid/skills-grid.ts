import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillService } from '../../services/skill.service';
import { Skill } from '../../models/skill.model';

@Component({
  selector: 'app-skills-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills-grid.html',
  styleUrls: ['./skills-grid.css'],
})
export class SkillsGridComponent implements OnInit {
  skills = signal<Skill[]>([]);
  loading = signal(true);

  skillCategories = [
    { key: 'frontend', label: 'Frontend Development' },
    { key: 'backend', label: 'Backend Development' },
    { key: 'database', label: 'Database & Storage' },
    { key: 'tools', label: 'Tools & Technologies' },
    { key: 'soft-skills', label: 'Soft Skills' },
    { key: 'other', label: 'Other Skills' },
  ];

  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.fetchSkills();
  }

  get skillsByCategory() {
    const categoryMap = new Map<string, Skill[]>();
    this.skills().forEach((skill) => {
      if (!categoryMap.has(skill.category)) {
        categoryMap.set(skill.category, []);
      }
      categoryMap.get(skill.category)!.push(skill);
    });
    return categoryMap;
  }

  private fetchSkills(): void {
    this.skillService.getSkills().subscribe({
      next: (data) => {
        this.skills.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching skills:', error);
        this.loading.set(false);
      },
    });
  }
}
