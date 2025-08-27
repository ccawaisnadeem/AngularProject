import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService, Product } from '../../services/product';
import { AuthService } from '../../auth/services/auth.service';
import { StripeService } from '../../services/StripeService';
import { CartItem } from '../../Models/Cart.Model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h2 class="mb-4">
          <i class="bi bi-credit-card me-2"></i>Checkout
        </h2>

        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Processing your order...</p>
        </div>

        <div *ngIf="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div *ngIf="!isLoading && !error" class="row">
          <div class="col-lg-8">
            <!-- Billing Information Card -->
            <div class="card mb-4">
              <div class="card-header">
                <h5><i class="bi bi-person me-2"></i>Billing Information</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="checkoutForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name *</label>
                      <input type="text" class="form-control" id="firstName" formControlName="firstName"
                             [class.is-invalid]="checkoutForm.get('firstName')?.invalid && checkoutForm.get('firstName')?.touched">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name *</label>
                      <input type="text" class="form-control" id="lastName" formControlName="lastName"
                             [class.is-invalid]="checkoutForm.get('lastName')?.invalid && checkoutForm.get('lastName')?.touched">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address *</label>
                    <input type="email" class="form-control" id="email" formControlName="email"
                           [class.is-invalid]="checkoutForm.get('email')?.invalid && checkoutForm.get('email')?.touched">
                  </div>
                </form>
              </div>
            </div>

            <!-- Payment Information Card -->
            <div class="card mb-4">
              <div class="card-header">
                <h5><i class="bi bi-credit-card-2-front me-2"></i>Payment Information</h5>
              </div>
              <div class="card-body">
                <div class="alert alert-warning" role="alert">
                  <i class="bi bi-info-circle me-2"></i>
                  You will be redirected to Stripe's secure payment page to complete your purchase.
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <a routerLink="/cart" class="btn btn-outline-warning" style="color:white">
                <i class="bi bi-arrow-left me-2"></i>Back to Cart
              </a>
              <button style="color:white"
                type="button" 
                class="btn btn-warning btn-lg"
                [disabled]="checkoutForm.invalid || isProcessing || cartState.items.length === 0"
                (click)="processPayment()">
                <span *ngIf="!isProcessing">
                  <i class="bi bi-lock me-2"></i>Pay {{ getTotalAmount() | currency }}
                </span>
                <span *ngIf="isProcessing">
                  <i class="bi bi-hourglass-split me-2"></i>Processing...
                </span>
              </button>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card sticky-top" style="top: 20px;">
              <div class="card-header bg-warning text-white">
                <h5><i class="bi bi-receipt me-2"></i>Order Summary</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let item of cartState.items" class="d-flex justify-content-between mb-2">
                  <div>
                    <small class="fw-bold">{{ getProductName(item.productId) }}</small>
                    <br>
                    <small class="text-muted">Qty: {{ item.quantity }}</small>
                  </div>
                  <small class="fw-bold">{{ (item.priceAtAdd * item.quantity) | currency }}</small>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{{ cartState.totalPrice | currency }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tax and shipping charges (10%)</span>
                  <span>{{ getTaxAmount() | currency }}</span>
                </div>
                
                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <span class="fw-bold fs-5">Total</span>
                  <span class="fw-bold fs-5">{{ getTotalAmount() | currency }}</span>
                </div>

                <!-- Security badges -->
                <div class="text-center mt-3">
                  <small class="text-muted">
                    <i class="bi bi-shield-check text-success me-1"></i>
                    Secure payment powered by Stripe
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      min-height: 60vh;
      padding: 2rem 0;
    }

    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartState: any = { items: [], totalItems: 0, totalPrice: 0, isLoading: false, error: null };
  products: Product[] = [];
  currentUser: any = null;
  isLoading = false;
  isProcessing = false;
  error: string | null = null;
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private productService: ProductService,
    private authService: AuthService,
    private stripeService: StripeService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    
    this.subscription.add(
      this.cartStateService.cart$.subscribe(state => {
        this.cartState = state;
        if (state.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      })
    );
    
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.stripeService.destroy();
  }

  private loadCurrentUser(): void {
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        if (user) {
          // Split fullName into first + last name
          let firstName = '';
          let lastName = '';

          if (user.fullName) {
            const nameParts = user.fullName.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          this.checkoutForm.patchValue({
            firstName: firstName,
            lastName: lastName,
            email: user.email || ''
          });
        }
      })
    );
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  async processPayment(): Promise<void> {
    // Mark form as touched to show validation errors
    this.markFormGroupTouched(this.checkoutForm);
    
    if (this.checkoutForm.invalid) {
      this.error = "Please fill in all required fields correctly.";
      return;
    }

    // Check if user is authenticated
    if (!this.currentUser) {
      this.error = "You must be logged in to checkout.";
      this.notificationService.error(
        'Authentication Required',
        'Please log in to continue with checkout.',
        5000
      );
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Check if cart has items
    if (!this.cartState.items || this.cartState.items.length === 0) {
      this.error = "Your cart is empty.";
      return;
    }

    this.isProcessing = true;
    this.error = null;

    try {
      // Prepare checkout data that exactly matches backend expectations
      const checkoutData = {
        userId: this.currentUser?.id || 0,
        cartId: this.cartState.cartId || this.currentUser?.id || 0,
        customerEmail: this.checkoutForm.get('email')?.value || '',
        lineItems: this.cartState.items.map((item: CartItem) => ({
          name: this.getProductName(item.productId) || 'Product',
          description: `Product ID: ${item.productId}`,
          price: item.priceAtAdd > 0 ? item.priceAtAdd : 0.01, // Ensure price is positive
          quantity: item.quantity > 0 ? item.quantity : 1, // Ensure quantity is positive
          imageUrl: null // Using null instead of empty string as it's not a valid URL
        }))
      };
      
      // Validate the data matches the backend expectations
      if (!checkoutData.lineItems.length) {
        this.handlePaymentError('No items in cart to checkout');
        return;
      }
      
      // Ensure email is valid
      if (!checkoutData.customerEmail || !checkoutData.customerEmail.includes('@')) {
        this.handlePaymentError('Please provide a valid email address');
        this.error = 'Please provide a valid email address';
        return;
      }

      console.log('Sending checkout data:', checkoutData);

      // Check authentication status before proceeding
      if (!this.authService.getToken()) {
        this.handlePaymentError('Authentication token not found. Please log in again.');
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
        return;
      }

      // Create checkout session using Stripe service with proper error handling
      this.stripeService.createCheckoutSession(checkoutData).subscribe({
        next: async (response) => {
          if (!response || !response.sessionId) {
            this.handlePaymentError('Invalid response from payment service.');
            return;
          }
          
          console.log('Checkout session created:', response);
          
          // Redirect to Stripe Checkout
          try {
            const result = await this.stripeService.redirectToCheckout(response.sessionId);
            
            if (result.error) {
              this.handlePaymentError(result.error.message || 'Failed to redirect to payment.');
            }
          } catch (redirectError) {
            console.error('Redirect error:', redirectError);
            this.handlePaymentError('Failed to open payment page. Please try again.');
          }
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);
          let errorMessage = 'Failed to initialize payment. Please try again.';
          
          // Handle specific error types
          if (error.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 400) {
            errorMessage = error.error?.error || 'Invalid request data. Please check your information.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.handlePaymentError(errorMessage);
        }
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      this.handlePaymentError('An unexpected error occurred. Please try again.');
    }
  }

  private handlePaymentError(message: string): void {
    this.isProcessing = false;
    this.error = message;
    this.notificationService.error(
      'Payment Failed',
      message,
      5000
    );
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || `Product ${productId}`;
  }

  getTaxAmount(): number {
    return this.cartState.totalPrice * 0.10; // 10% tax
  }

  getShippingCost(): number {
    return 0;
  }

  getTotalAmount(): number {
    return this.cartState.totalPrice  + this.getTaxAmount();
  }
}