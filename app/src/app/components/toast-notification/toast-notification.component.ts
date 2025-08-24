import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div 
        *ngFor="let notification of notifications" 
        class="toast show"
        [ngClass]="'toast-' + notification.type"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        
        <div class="toast-header">
          <div class="d-flex align-items-center">
            <i [class]="'bi bi-' + getIcon(notification.type) + ' me-2'" 
               [ngClass]="'text-' + notification.type"></i>
            <strong class="me-auto">{{ notification.title }}</strong>
          </div>
          <button 
            *ngIf="notification.showClose"
            type="button" 
            class="btn-close" 
            (click)="removeNotification(notification.id)"
            aria-label="Close">
          </button>
        </div>
        
        <div class="toast-body">
          {{ notification.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      max-width: 400px;
    }

    .toast {
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 1rem;
    }

    .toast-success {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
    }

    .toast-error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
    }

    .toast-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .toast-info {
      background-color: #d1ecf1;
      border-left: 4px solid #17a2b8;
    }

    .toast-header {
      background: transparent;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .btn-close {
      opacity: 0.7;
    }

    .btn-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'exclamation-triangle';
      case 'warning': return 'exclamation-circle';
      case 'info': return 'info-circle';
      default: return 'info-circle';
    }
  }
}
