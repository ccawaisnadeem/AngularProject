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
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Order`;

  constructor(private http: HttpClient) {}

  // Place order from cart
  placeOrder(): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/place`, {})
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
