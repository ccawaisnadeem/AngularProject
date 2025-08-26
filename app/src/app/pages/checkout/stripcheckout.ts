import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { StripeService, CheckoutLineItem } from '../../services/StripeService';
import { CartStateService } from '../../services/cart-state.service';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem } from '../../Models/Cart.Model';

@Component({
  selector: 'app-stripe-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header bg-warning text-white">
              <h3 class="mb-0">Secure Checkout</h3>
            </div>
            <div class="card-body">
              <div *ngIf="isLoading" class="text-center p-5">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                <h4 class="mt-2">Preparing your checkout session...</h4>
                <p class="text-muted">Please wait, you'll be redirected to our secure payment provider shortly.</p>
              </div>

              <div *ngIf="error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Checkout Error:</strong> {{ error }}
                <button class="btn btn-link  p-0 ms-2" style="background:yellow" (click)="retryCheckout()">Retry</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StripeCheckoutComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  
  constructor(
    private stripeService: StripeService,
    private cartStateService: CartStateService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initiate checkout process immediately
    this.initiateCheckout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initiateCheckout(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.notificationService.error(
        'Authentication Required', 
        'Please log in to complete your purchase.',
        0
      );
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/checkout' } 
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Get checkout form data from session storage
    let checkoutFormData: any = {};
    try {
      const storedFormData = sessionStorage.getItem('checkoutFormData');
      if (storedFormData) {
        checkoutFormData = JSON.parse(storedFormData);
      }
    } catch (error) {
      console.error('Error parsing stored checkout data:', error);
    }

    // Use form email if available, otherwise fall back to user email
    const customerEmail = checkoutFormData?.email || currentUser.email || '';

    // Get cart data for checkout
    this.cartStateService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cartState => {
        if (cartState.isLoading) return;
        
        if (cartState.error) {
          this.error = 'Unable to load your cart. Please try again.';
          this.isLoading = false;
          return;
        }

        if (cartState.items.length === 0) {
          this.error = 'Your cart is empty.';
          this.isLoading = false;
          this.router.navigate(['/cart']);
          return;
        }

        // Prepare line items from cart
        this.createCheckoutSession(
          parseInt(currentUser.id),
          customerEmail,
          cartState.items
        );
      });
  }

  createCheckoutSession(userId: number, email: string, cartItems: CartItem[]): void {
    // Convert cart items to Stripe line items
    const lineItems: CheckoutLineItem[] = cartItems.map(item => ({
      name: `Product #${item.productId}`,
      description: `Product ID: ${item.productId}`, 
      price: item.priceAtAdd, // Price in the database currency format
      quantity: item.quantity,
      imageUrl: null // Product image is not available in the CartItem model
    }));

    this.stripeService.createCheckoutSession({
      userId: userId,
      cartId: cartItems[0]?.cartId || 0, // Get cartId from first item
      customerEmail: email,
      lineItems: lineItems
    }).subscribe({
      next: (response) => {
        if (!response || !response.sessionId || !response.url) {
          this.handleError('Invalid checkout session response');
          return;
        }

        // Redirect to Stripe checkout page
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Checkout session error:', error);
        this.handleError(this.stripeService.handleStripeError(error));
      }
    });
  }

  handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
    this.notificationService.error(
      'Checkout Error', 
      message,
      5000
    );
  }

  retryCheckout(): void {
    this.initiateCheckout();
  }
}
