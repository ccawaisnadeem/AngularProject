import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  productId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id?: number;
  userId?: number;
  status?: string;
  paymentStatus?: string;
  totalAmount: number;
  orderDate?: string;
  orderItems: OrderItem[];
  deliveryAddress?: string;
  trackingNumber?: string;
  shipmentStatus?: string;
  estimatedDelivery?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Order`;

  constructor(private http: HttpClient) {}

  // Place order from cart
  placeOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/place`, orderData)
      .pipe(catchError(this.handleError));
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

  // Get logged-in user's orders
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user`)
      .pipe(catchError(this.handleError));
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
