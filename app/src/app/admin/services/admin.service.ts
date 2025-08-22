import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../auth/models/user.model';
import { OrderService } from '../../services/order';
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
  getOrders(): Observable<any[]> {
  return this.http.get<any[]>(`${this.API_URL}/Order`)
    .pipe(
      catchError(error => {
        console.error('Error fetching orders:', error);
        return of([]);
      })
    );
 }

  getOrderById(id: number): Observable<any> {
   return this.http.get<any>(`${this.API_URL}/Order/${id}`)
    .pipe(
      catchError(error => {
        console.error(`Error fetching order ${id}:`, error);
        throw error;
      })
    );
  }

 updateOrderStatus(id: number, status: string): Observable<any> {
   return this.http.put<any>(`${this.API_URL}/Order/${id}/status`, { status })
    .pipe(
      catchError(error => {
        console.error(`Error updating order ${id} status:`, error);
        throw error;
      })
    );
 }

  
  // User Management Methods
  getUsers(): Observable<User[]> {
    console.log('Fetching users from:', `${this.API_URL}/User`);
    return this.http.get<User[]>(`${this.API_URL}/User`)
      .pipe(
        map(response => {
          console.log('API response:', response);
          // Process each user to ensure correct mapping
          const processedUsers = Array.isArray(response) ? response.map(user => {
            // Make sure the user object has consistent properties
            const processedUser: User = {
              ...user,
              // If name is missing but fullName exists, copy it
              name: user.name || user.fullName
            };
            console.log('Processed user:', processedUser);
            return processedUser;
          }) : [];
          return processedUsers;
        }),
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]); // Return empty array in case of error
        })
      );
  }
  
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/User/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching user ${id}:`, error);
          throw error;
        })
      );
  }
  
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/User/${id}`, userData)
      .pipe(
        catchError(error => {
          console.error(`Error updating user ${id}:`, error);
          throw error;
        })
      );
  }
  
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/User/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting user ${id}:`, error);
          throw error;
        })
      );
  }
  
  // Get admin users only
  getAdminUsers(): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.role === 'Admin'))
    );
  }
  
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/User/profile`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user profile:', error);
          throw error;
        })
      );
  }
  
  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/User/profile`, userData)
      .pipe(
        catchError(error => {
          console.error('Error updating user profile:', error);
          throw error;
        })
      );
  }
  // Shipment Services 
    createShipment(orderId: number, shipmentData: any): Observable<any> {
      return this.http.post<any>(`${this.API_URL}/Shipment`, {
         orderId,
         ...shipmentData
      }).pipe(
         catchError(error => {
         console.error(`Error creating shipment for order ${orderId}:`, error);
         throw error;
      })
     );
   }

  updateShipmentStatus(shipmentId: number, status: string): Observable<any> {
   return this.http.put<any>(`${this.API_URL}/Shipment/${shipmentId}/status`, { status })
    .pipe(
      catchError(error => {
        console.error(`Error updating shipment ${shipmentId} status:`, error);
        throw error;
      })
    );
 }

  getShipmentByOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/Shipment/order/${orderId}`)
    .pipe(
      catchError(error => {
        console.error(`Error fetching shipment for order ${orderId}:`, error);
        throw error;
      })
    );
 }

}
