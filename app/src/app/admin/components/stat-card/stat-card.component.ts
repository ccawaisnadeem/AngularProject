import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card h-100 shadow-sm stat-card" [ngClass]="'border-' + color">
      <div class="card-body p-3">
        <div class="d-flex align-items-center mb-2">
          <div class="icon-wrapper me-3" [ngClass]="'bg-' + color + ' bg-opacity-10'">
            <i [class]="'bi bi-' + icon" [ngClass]="'text-' + color"></i>
          </div>
          <div>
            <h6 class="mb-0 text-muted">{{ title }}</h6>
            <h3 class="mb-0">{{ value }}</h3>
          </div>
        </div>
        @if (subtitle) {
          <p class="text-muted mb-0">{{ subtitle }}</p>
        }
      </div>
      @if (link) {
        <div class="card-footer p-2 bg-transparent border-top-0">
          <a [routerLink]="link" class="btn btn-sm btn-link text-decoration-none" [ngClass]="'text-' + color">
            View Details <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
    }
    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-wrapper i {
      font-size: 24px;
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() value: string = '0';
  @Input() icon: string = 'graph-up';
  @Input() color: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary' = 'primary';
  @Input() link?: string;
}
