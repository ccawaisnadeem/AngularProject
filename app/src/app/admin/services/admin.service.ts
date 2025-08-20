import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  // Get dashboard statistics
  getDashboardStats(): Observable<any> {
    // In a real app, this would be an API call
    // For now, return mock data
    return of({
      totalProducts: 120,
      totalOrders: 48,
      totalUsers: 250,
      revenue: 5230
    }).pipe(delay(500)); // Simulate API delay
  }
  
  // Get products for inventory management
  getProducts(page: number = 1, limit: number = 10): Observable<any> {
    // In a real app, this would be an API call
    // For now, return mock data
    return of({
      products: Array(limit).fill(0).map((_, i) => ({
        id: i + 1 + (page - 1) * limit,
        name: `Product ${i + 1 + (page - 1) * limit}`,
        price: Math.floor(Math.random() * 100) + 10,
        stock: Math.floor(Math.random() * 100),
        category: ['Electronics', 'Fashion', 'Home', 'Books'][Math.floor(Math.random() * 4)]
      })),
      total: 120,
      page,
      limit
    }).pipe(delay(500)); // Simulate API delay
  }
  
  // Get orders for order management
  getOrders(page: number = 1, limit: number = 10): Observable<any> {
    // In a real app, this would be an API call
    // For now, return mock data
    return of({
      orders: Array(limit).fill(0).map((_, i) => ({
        id: `ORD-${String(i + 1 + (page - 1) * limit).padStart(3, '0')}`,
        customer: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
        status: ['Processing', 'Shipped', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 200) + 50
      })),
      total: 48,
      page,
      limit
    }).pipe(delay(500)); // Simulate API delay
  }
}
