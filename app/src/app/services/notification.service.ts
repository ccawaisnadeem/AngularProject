import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  success(title: string, message: string, duration: number = 3000): void {
    this.show({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      showClose: true
    });
  }

  error(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      showClose: true
    });
  }

  warning(title: string, message: string, duration: number = 4000): void {
    this.show({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      showClose: true
    });
  }

  info(title: string, message: string, duration: number = 3000): void {
    this.show({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      showClose: true
    });
  }

  private show(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Cart-specific notifications
  itemAddedToCart(productName: string): void {
    this.success(
      'Added to Cart!',
      `${productName} has been added to your cart successfully.`,
      2000
    );
  }

  itemRemovedFromCart(productName: string): void {
    this.info(
      'Item Removed',
      `${productName} has been removed from your cart.`,
      2000
    );
  }

  cartUpdated(): void {
    this.success(
      'Cart Updated',
      'Your cart has been updated successfully.',
      2000
    );
  }

  cartError(message: string): void {
    this.error(
      'Cart Error',
      message,
      4000
    );
  }

  loginRequired(): void {
    this.warning(
      'Login Required',
      'Please login to add items to your cart.',
      3000
    );
  }
}
