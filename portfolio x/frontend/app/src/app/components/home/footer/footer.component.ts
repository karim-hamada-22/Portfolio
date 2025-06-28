import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInfoService } from '../../../services/personal-info.service';
import { PersonalInfo } from '../../../models/personal-info.model';

@Component({
  selector: 'app-home-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class HomeFooterComponent implements OnInit {
  personalInfo = signal<PersonalInfo | null>(null);
  currentYear = new Date().getFullYear();

  constructor(private personalInfoService: PersonalInfoService) {}

  ngOnInit(): void {
    this.loadPersonalInfo();
  }

  private loadPersonalInfo(): void {
    this.personalInfoService.getPersonalInfo().subscribe({
      next: (data) => {
        this.personalInfo.set(data);
      },
      error: (error) => {
        console.error('Error loading personal info:', error);
      },
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
