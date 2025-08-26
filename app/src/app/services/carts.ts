// services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart, CartItem } from '../Models/Cart.Model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private itemApi = `${environment.apiUrl}/cartitem`;

  constructor(private http: HttpClient) {}
  // POST: create new cart
createCart(data: { userId: number }): Observable<Cart> {
  return this.http.post<Cart>(`${this.apiUrl}`, data)
    .pipe(catchError(this.handleError));
}


  //  Get active cart for user
  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }


   addItem(cartId: number, productId: number, quantity: number): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.itemApi}`, { 
      cartId,      
      productId,   
      quantity     
    }).pipe(catchError(this.handleError));
  }

  // ✅ Update this method  
  updateItem(itemId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.itemApi}/${itemId}`, { quantity })
      .pipe(catchError(this.handleError));
  }

  // ✅ Update this method
  removeItem(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.itemApi}/${itemId}`)
      .pipe(catchError(this.handleError));
  }



  //  Clear entire cart - using the correct backend endpoint
  clearCart(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clear/${userId}`)
      .pipe(catchError(this.handleError));
  }
  
  // Clear cart by cart ID - alternative method if needed
  clearCartById(cartId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cartId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Cart API error:', error);
    return throwError(() => new Error('Something went wrong with Cart. Please try again later.'));
  }
}

