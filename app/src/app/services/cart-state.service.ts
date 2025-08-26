import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { CartService } from './carts';
import { Cart, CartItem } from '../Models/Cart.Model';
import { Product } from './product';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
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
    error: null,
    isEmpty: true
  });

  public cart$ = this.cartSubject.asObservable();
  private currentCartId: number | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
   private notificationService: NotificationService
  ) {
    this.initializeCart();
  }

  // ------------------------------------------------------
  // Init / Auth handling
  // ------------------------------------------------------
private initializeCart(): void {
  // Subscribe to auth changes to reload cart when user logs in/out
  this.authService.currentUser.subscribe(user => {
    if (user) {
      // On login → clear cart first, then load user cart
      this.currentCartId = null;
      this.updateCartState([]);
      this.loadUserCart();
    } else {
      // On logout → clear cart state
      this.currentCartId = null;
      this.updateCartState([]);
    }
  });
}

  private loadUserCart(): void {
  const user = this.authService.currentUserValue;
  if (!user?.id) return;

  this.setLoading(true);
  this.setError(null);
  
  this.cartService.getCart(parseInt(user.id)).subscribe({
    next: (cart) => {
      this.currentCartId = cart.id ?? null;
      this.updateCartState(cart.cartItems || []);
      this.setLoading(false);
    },
    error: (error) => {
      console.error('Error loading cart:', error);
      // If cart doesn't exist (404) or any error, just show empty cart
      console.log('No cart found for user, starting with empty cart');
      this.currentCartId = null;
      this.updateCartState([]);
      this.setLoading(false);
      // Don't set error - just show empty cart state
    }
  });
}

  // ------------------------------------------------------
  // Public Cart API
  // ------------------------------------------------------
  addToCart(product: Product, quantity: number = 1): Observable<boolean> {
  const user = this.authService.currentUserValue;
  if (!user?.id) {
    this.notificationService.loginRequired();
    this.router.navigate(['/login']);
    return of(false);
  }

  this.setLoading(true);
  this.setError(null);

  // First ensure we have a cart
  if (!this.currentCartId) {
    return this.createCartAndAddItem(product, quantity);
  }

  // Load fresh cart data to check for existing items
  return this.cartService.getCart(parseInt(user.id)).pipe(
    switchMap(cart => {
      // Update local cart state with fresh data
      this.currentCartId = cart.id ?? null;
      this.updateCartState(cart.cartItems || []);

      // Now check for existing item in the fresh data
      const existingItem = (cart.cartItems || []).find(
        item => item.productId === product.id
      );

      if (existingItem && existingItem.id) {
        // Item exists → update quantity
        console.log(`Product ${product.id} already in cart, updating quantity from ${existingItem.quantity} to ${existingItem.quantity + quantity}`);
        return this.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Item doesn't exist → add new
        console.log(`Adding new product ${product.id} to cart`);
        return this.addItemToExistingCart(product, quantity);
      }
    }),
    catchError(error => {
      console.error('Error in addToCart:', error);
      // If cart doesn't exist, create new one
      if (error.status === 404) {
        return this.createCartAndAddItem(product, quantity);
      }
      this.setError('Failed to add item to cart');
      this.setLoading(false);
      return of(false);
    })
  );
}
  // 🚨 Do NOT change — works already
  private createCartAndAddItem(product: Product, quantity: number): Observable<boolean> {
    const user = this.authService.currentUserValue;
    if (!user?.id) return of(false);

    const userId = parseInt(user.id);

    return this.cartService.getCart(userId).pipe(
      switchMap(cart => {
        this.currentCartId = cart.id ?? null;
        return this.addItemToExistingCart(product, quantity);
      }),
      catchError(error => {
        console.log('Cart not found for user, creating new cart...', error);

        return this.cartService.createCart({ userId }).pipe(
          switchMap(newCart => {
            if (!newCart?.id) {
              console.error("Cart creation failed - no ID in response", newCart);
              this.setError('Failed to create cart');
              this.setLoading(false);
              return of(false);
            }

            console.log('New cart created with ID:', newCart.id);
            this.currentCartId = newCart.id;
            return this.addItemToExistingCart(product, quantity);
          }),
          catchError(createError => {
            console.error('Error creating cart:', createError);
            this.setError('Failed to create cart. Please try again later.');
            this.setLoading(false);
            return of(false);
          })
        );
      })
    );
  }

  private addItemToExistingCart(product: Product, quantity: number): Observable<boolean> {
    if (!this.currentCartId) return of(false);

    return this.cartService.addItem(
      this.currentCartId,
      product.id!,
      quantity
    ).pipe(
      tap(() => {
        this.loadUserCart();
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
      tap(() => this.loadUserCart()),
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
      tap(() => this.loadUserCart()),
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
    const user = this.authService.currentUserValue;
    if (!user?.id) {
      this.updateCartState([]);
      return of(true);
    }

    const userId = parseInt(user.id);

    this.setLoading(true);
    this.setError(null);

    return this.cartService.clearCart(userId).pipe(
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

  // ------------------------------------------------------
  // Helpers
  // ------------------------------------------------------
  private updateCartState(items: CartItem[]): void {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

    this.cartSubject.next({
      items,
      totalItems,
      totalPrice,
      isLoading: false,
      error: null,
      isEmpty: items.length === 0
    });
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.cartSubject.value;
    this.cartSubject.next({ ...currentState, isLoading });
  }

  private setError(error: string | null): void {
    const currentState = this.cartSubject.value;
    this.cartSubject.next({ ...currentState, error });
  }

  // ------------------------------------------------------
  // Getters
  // ------------------------------------------------------
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
