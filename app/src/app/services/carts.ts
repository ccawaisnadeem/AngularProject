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
  private apiUrl = `${environment.apiUrl}/Cart`;

  constructor(private http: HttpClient) {}

  //  Get active cart for user
  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  //  Add item to cart
  addItem(cartId: number, productId: number, quantity: number, priceAtAdd: number): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/items`, {
      cartId,
      productId,
      quantity,
      priceAtAdd
    }).pipe(catchError(this.handleError));
  }

  //  Update quantity of item
  updateItem(itemId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/items/${itemId}`, { quantity })
      .pipe(catchError(this.handleError));
  }

  //  Remove single item
  removeItem(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${itemId}`)
      .pipe(catchError(this.handleError));
  }

  //  Clear entire cart
  clearCart(cartId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cartId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Cart API error:', error);
    return throwError(() => new Error('Something went wrong with Cart. Please try again later.'));
  }
}

