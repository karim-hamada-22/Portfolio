import {
  Component,
  OnInit,
  signal,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeHeaderComponent } from './header/header.component';
import { HomeFooterComponent } from './footer/footer.component';
import { PortfolioGridComponent } from '../portfolio-grid/portfolio-grid';
import { ContactFormComponent } from '../contact-form/contact-form';
import { SkillsGridComponent } from '../skills-grid/skills-grid';
import { ExperienceTimelineComponent } from '../experience-timeline/experience-timeline';
import { EducationTimelineComponent } from '../education-timeline/education-timeline.component';
import { PersonalInfoService } from '../../services/personal-info.service';
import { PersonalInfo } from '../../models/personal-info.model';

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
  activity: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HomeHeaderComponent,
    HomeFooterComponent,
    PortfolioGridComponent,
    ContactFormComponent,
    SkillsGridComponent,
    ExperienceTimelineComponent,
    EducationTimelineComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  personalInfo = signal<PersonalInfo | null>(null);
  loading = signal(true);

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private nodes: NeuralNode[] = [];
  private mouseX = 0;
  private mouseY = 0;

  constructor(private personalInfoService: PersonalInfoService) {}

  ngOnInit(): void {
    this.loadPersonalInfo();
  }

  ngAfterViewInit(): void {
    this.initNeuralNetwork();
    this.addMouseListener();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private loadPersonalInfo(): void {
    this.personalInfoService.getPersonalInfo().subscribe({
      next: (data) => {
        this.personalInfo.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading personal info:', error);
        this.loading.set(false);
      },
    });
  }

  private initNeuralNetwork(): void {
    this.canvas = document.getElementById('neuralCanvas') as HTMLCanvasElement;
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    this.createNodes();
    this.animate();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createNodes(): void {
    const nodeCount = Math.floor(
      (window.innerWidth * window.innerHeight) / 15000
    );
    this.nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
        activity: Math.random(),
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const distance = this.getDistance(this.nodes[i], this.nodes[j]);
        if (distance < 150 && Math.random() < 0.3) {
          this.nodes[i].connections.push(j);
        }
      }
    }
  }

  private animate(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw nodes
    this.nodes.forEach((node, index) => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > this.canvas!.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.canvas!.height) node.vy *= -1;

      // Update activity
      node.activity += (Math.random() - 0.5) * 0.02;
      node.activity = Math.max(0, Math.min(1, node.activity));

      // Mouse interaction
      const mouseDistance = Math.sqrt(
        Math.pow(node.x - this.mouseX, 2) + Math.pow(node.y - this.mouseY, 2)
      );
      if (mouseDistance < 100) {
        node.activity = Math.min(1, node.activity + 0.05);
      }

      // Draw node
      this.drawNode(node);

      // Draw connections
      node.connections.forEach((connectionIndex) => {
        if (connectionIndex < this.nodes.length) {
          this.drawConnection(node, this.nodes[connectionIndex]);
        }
      });
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawNode(node: NeuralNode): void {
    if (!this.ctx) return;

    const size = 2 + node.activity * 3;
    const alpha = 0.3 + node.activity * 0.7;

    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);

    // Create gradient
    const gradient = this.ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      size * 2
    );
    gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(124, 58, 237, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(6, 255, 165, 0)`);

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Add glow effect for highly active nodes
    if (node.activity > 0.7) {
      this.ctx.shadowColor = '#00d4ff';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  private drawConnection(node1: NeuralNode, node2: NeuralNode): void {
    if (!this.ctx) return;

    const distance = this.getDistance(node1, node2);
    if (distance > 150) return;

    const alpha =
      (1 - distance / 150) * 0.3 * Math.min(node1.activity, node2.activity);

    this.ctx.beginPath();
    this.ctx.moveTo(node1.x, node1.y);
    this.ctx.lineTo(node2.x, node2.y);

    // Create gradient for connection
    const gradient = this.ctx.createLinearGradient(
      node1.x,
      node1.y,
      node2.x,
      node2.y
    );
    gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(124, 58, 237, ${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(6, 255, 165, ${alpha})`);

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Add data flow effect
    if (node1.activity > 0.5 && node2.activity > 0.5) {
      const time = Date.now() * 0.005;
      const flowPosition = (Math.sin(time + distance * 0.01) + 1) * 0.5;

      const flowX = node1.x + (node2.x - node1.x) * flowPosition;
      const flowY = node1.y + (node2.y - node1.y) * flowPosition;

      this.ctx.beginPath();
      this.ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(6, 255, 165, ${alpha * 2})`;
      this.ctx.fill();
    }
  }

  private getDistance(node1: NeuralNode, node2: NeuralNode): number {
    return Math.sqrt(
      Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
    );
  }

  private addMouseListener(): void {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  scrollToContact(): void {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }
}
