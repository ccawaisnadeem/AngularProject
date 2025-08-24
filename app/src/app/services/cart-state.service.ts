import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { CartService } from './carts';
import { Cart, CartItem } from '../Models/Cart.Model';
import { Product } from './product';
import { AuthService } from '../auth/services/auth.service';

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private cartSubject = new BehaviorSubject<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null
  });

  public cart$ = this.cartSubject.asObservable();
  private currentCartId: number | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.initializeCart();
  }

  private initializeCart(): void {
    // Subscribe to auth changes to reload cart when user logs in/out
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.loadUserCart();
      } else {
        this.clearCart();
      }
    });
  }

  private loadUserCart(): void {
    const user = this.authService.currentUserValue;
    if (!user?.id) return;

    this.setLoading(true);
    this.cartService.getCart(parseInt(user.id)).subscribe({
      next: (cart) => {
        this.currentCartId = cart.id || null;
        this.updateCartState(cart.cartItems || []);
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.setError('Failed to load cart');
        this.setLoading(false);
      }
    });
  }

  addToCart(product: Product, quantity: number = 1): Observable<boolean> {
    const user = this.authService.currentUserValue;
    if (!user?.id) {
      this.setError('Please login to add items to cart');
      return of(false);
    }

    this.setLoading(true);
    this.setError(null);

    // Check if item already exists in cart
    const existingItem = this.cartSubject.value.items.find(
      item => item.productId === product.id
    );

    if (existingItem) {
      // Update existing item quantity
      return this.updateItemQuantity(existingItem.id!, existingItem.quantity + quantity);
    } else {
      // Add new item
      if (!this.currentCartId) {
        // Create new cart first
        return this.createCartAndAddItem(product, quantity);
      } else {
        return this.addItemToExistingCart(product, quantity);
      }
    }
  }

  private createCartAndAddItem(product: Product, quantity: number): Observable<boolean> {
    const user = this.authService.currentUserValue;
    if (!user?.id) return of(false);

    // Create new cart and add item
    return this.cartService.getCart(parseInt(user.id)).pipe(
      switchMap(cart => {
        this.currentCartId = cart.id || null;
        return this.addItemToExistingCart(product, quantity);
      }),
      catchError(error => {
        console.error('Error creating cart:', error);
        this.setError('Failed to create cart');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  private addItemToExistingCart(product: Product, quantity: number): Observable<boolean> {
    if (!this.currentCartId) return of(false);

    return this.cartService.addItem(
      this.currentCartId,
      product.id!,
      quantity,
      product.price
    ).pipe(
      tap(() => {
        this.loadUserCart(); // Reload cart to get updated state
      }),
      map(() => true),
      catchError(error => {
        console.error('Error adding item to cart:', error);
        this.setError('Failed to add item to cart');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<boolean> {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    this.setLoading(true);
    this.setError(null);

    return this.cartService.updateItem(itemId, quantity).pipe(
      tap(() => {
        this.loadUserCart(); // Reload cart to get updated state
      }),
      map(() => true),
      catchError(error => {
        console.error('Error updating item quantity:', error);
        this.setError('Failed to update quantity');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  removeItem(itemId: number): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.cartService.removeItem(itemId).pipe(
      tap(() => {
        this.loadUserCart(); // Reload cart to get updated state
      }),
      map(() => true),
      catchError(error => {
        console.error('Error removing item:', error);
        this.setError('Failed to remove item');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  clearCart(): Observable<boolean> {
    if (!this.currentCartId) {
      this.updateCartState([]);
      return of(true);
    }

    this.setLoading(true);
    this.setError(null);

    return this.cartService.clearCart(this.currentCartId).pipe(
      tap(() => {
        this.currentCartId = null;
        this.updateCartState([]);
        this.setLoading(false);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error clearing cart:', error);
        this.setError('Failed to clear cart');
        this.setLoading(false);
        return of(false);
      })
    );
  }

  private updateCartState(items: CartItem[]): void {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

    this.cartSubject.next({
      items,
      totalItems,
      totalPrice,
      isLoading: false,
      error: null
    });
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.cartSubject.value;
    this.cartSubject.next({
      ...currentState,
      isLoading
    });
  }

  private setError(error: string | null): void {
    const currentState = this.cartSubject.value;
    this.cartSubject.next({
      ...currentState,
      error
    });
  }

  // Getters for easy access
  get cartItems(): CartItem[] {
    return this.cartSubject.value.items;
  }

  get totalItems(): number {
    return this.cartSubject.value.totalItems;
  }

  get totalPrice(): number {
    return this.cartSubject.value.totalPrice;
  }

  get isLoading(): boolean {
    return this.cartSubject.value.isLoading;
  }

  get error(): string | null {
    return this.cartSubject.value.error;
  }

  // Check if cart is empty
  get isEmpty(): boolean {
    return this.cartSubject.value.items.length === 0;
  }

  // Get cart item by product ID
  getCartItem(productId: number): CartItem | undefined {
    return this.cartSubject.value.items.find(item => item.productId === productId);
  }

  // Check if product is in cart
  isInCart(productId: number): boolean {
    return this.cartSubject.value.items.some(item => item.productId === productId);
  }
}
