import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-grid.html',
  styleUrls: ['./portfolio-grid.css'],
})
export class PortfolioGridComponent implements OnInit {
  portfolios = signal<Portfolio[]>([]);
  loading = signal(true);

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.fetchPortfolios();
  }

  private fetchPortfolios(): void {
    this.portfolioService.getPortfolios({ featured: true }).subscribe({
      next: (data) => {
        this.portfolios.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching portfolios:', error);
        this.loading.set(false);
      },
    });
  }
  trackByPortfolioId(index: number): number {
    return index;
  }
}
