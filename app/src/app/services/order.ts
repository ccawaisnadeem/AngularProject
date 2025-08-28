import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  unitPrice: number;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface Shipment {
  id?: number;
  orderId?: number;
  status?: ShipmentStatus;
  trackingNumber?: string;
  courierName?: string;
  shipmentDate?: string;
  deliveredAt?: string;
}

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3
}




/////////////

export enum ShipmentStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}



export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  orderItems: OrderItem[];
  shipment?: Shipment;
  user?: User;
}

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Order`;

  constructor(private http: HttpClient) {}

  // Checkout user's cart - creates order from existing cart
  checkoutCart(userId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout/${userId}`, {})
      .pipe(catchError(this.handleError));
  }
  
  // Confirm payment after successful Stripe payment - creates order and clears cart
  confirmPayment(userId: number, paymentData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/confirm-payment/${userId}`, {
      stripeSessionId: paymentData.sessionId || '',
      customerEmail: paymentData.customerEmail || '',
      totalAmount: paymentData.totalAmount || 0
    }).pipe(catchError(this.handleError));
  }
  
  // Create order after successful payment - use confirm-payment endpoint
  createOrderFromSession(sessionData: any): Observable<Order> {
    const userId = sessionData.userId || 0;
    return this.confirmPayment(userId, {
      sessionId: sessionData.sessionId,
      customerEmail: sessionData.customerEmail,
      totalAmount: sessionData.totalAmount
    });
  }

  // Place order from cart - use checkout endpoint
  placeOrder(orderData: any): Observable<Order> {
    const userId = orderData.userId || 0;
    return this.checkoutCart(userId);
  }

  // Update order status (admin only)
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // Get order tracking information
  getOrderTracking(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${orderId}/tracking`)
      .pipe(catchError(this.handleError));
  }

  // Get logged-in user's orders - updated to match backend endpoint
  getUserOrders(userId: number): Observable<Order[]> {
  return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`)
    .pipe(
      catchError((error) => {
        console.error('Error fetching user orders:', error);
        
        // If 404 or no orders found, return empty array instead of error
        if (error.status === 404) {
          console.log('No orders found for user, returning empty array');
          return new Observable<Order[]>(observer => {
            observer.next([]);
            observer.complete();
          });
        }
        
        // For other errors, still throw error
        return throwError(() => error);
      })
    );
}

  // Get logged-in user's orders (convenience method)
  getCurrentUserOrders(): Observable<Order[]> {
  // Get user ID from auth service or localStorage
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = parseInt(user.id) || 0;
  
  if (!userId) {
    // If no user ID, return empty array instead of making API call
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }
  
  return this.getUserOrders(userId);
}
  // Get order details by ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Order API error:', error);
    return throwError(() => new Error('Something went wrong with orders.'));
  }
}
