import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order';
import { ProductService, Product } from '../../services/product';
import { AuthService } from '../../auth/services/auth.service';
import { StripeService } from '../../services/StripeService'; // Add Stripe service
import { CartItem } from '../../Models/Cart.Model';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
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
                      <input type="text" class="form-control" id="firstName" formControlName="firstName">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name *</label>
                      <input type="text" class="form-control" id="lastName" formControlName="lastName">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address *</label>
                    <input type="email" class="form-control" id="email" formControlName="email">
                  </div>

                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number *</label>
                    <input type="tel" class="form-control" id="phone" formControlName="phone">
                  </div>

                  <div class="mb-3">
                    <label for="address" class="form-label">Delivery Address *</label>
                    <textarea 
                      class="form-control" 
                      id="address" 
                      rows="3" 
                      formControlName="address"
                      placeholder="Enter your complete delivery address including street, city, state, and ZIP code"></textarea>
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
                <div class="payment-methods mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="stripe" value="stripe" 
                           [(ngModel)]="selectedPaymentMethod" checked>
                    <label class="form-check-label" for="stripe">
                      <i class="bi bi-credit-card me-2"></i>Credit/Debit Card (Stripe)
                    </label>
                  </div>
                </div>

                <!-- Stripe Card Element Container -->
                <div *ngIf="selectedPaymentMethod === 'stripe'" class="stripe-card-container">
                  <div id="card-element" class="form-control" style="height: 40px; padding: 10px;">
                    <!-- Stripe Elements will create form elements here -->
                  </div>
                  <div id="card-errors" role="alert" class="text-danger mt-2"></div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <a routerLink="/cart" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>Back to Cart
              </a>
              <button 
                type="button" 
                class="btn btn-primary btn-lg"
                [disabled]="checkoutForm.invalid || isProcessing || !isStripeReady"
                (click)="processPayment()">
                <span *ngIf="!isProcessing">
                  <i class="bi bi-lock me-2"></i>Pay {{ getTotalAmount() | currency }}
                </span>
                <span *ngIf="isProcessing">
                  <i class="bi bi-hourglass-split me-2"></i>Processing Payment...
                </span>
              </button>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card sticky-top" style="top: 20px;">
              <div class="card-header bg-primary text-white">
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
                  <span>Tax and delivery charges (5%)</span>
                  <span>{{ getTaxAmount() | currency }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>{{ getShippingCost() | currency }}</span>
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

    .stripe-card-container {
      margin-top: 1rem;
    }

    #card-element {
      background-color: white;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    #card-element:focus-within {
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .payment-methods {
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 1rem;
      background-color: #f8f9fa;
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
  selectedPaymentMethod = 'stripe';
  
  // Stripe properties
  private stripe: any;
  private cardElement: any;
  isStripeReady = false;
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService,
    private stripeService: StripeService, // Add Stripe service
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.initializeStripe();
    
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
    if (this.cardElement) {
      this.cardElement.destroy();
    }
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
          lastName = nameParts.slice(1).join(' ') || ''; // handles middle names too
        }

        this.checkoutForm.patchValue({
          firstName: firstName,
          lastName: lastName,
          email: user.email || '',
          address: user.address || ''
        });
      }
    })
  );
}


  private async initializeStripe(): Promise<void> {
    try {
      // Wait for Stripe service to load
      this.subscription.add(
        this.stripeService.stripeLoaded$.subscribe(loaded => {
          if (loaded) {
            this.setupStripeElements();
          }
        })
      );
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.error = 'Failed to load payment system. Please refresh the page.';
    }
  }

  private setupStripeElements(): void {
    // Create card element using Stripe service
    this.cardElement = this.stripeService.createElement('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    // Mount card element
    setTimeout(() => {
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        this.cardElement.mount('#card-element');
        this.isStripeReady = true;
      }
    }, 100);

    // Handle real-time validation errors
    this.cardElement.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  async processPayment(): Promise<void> {
    if (this.checkoutForm.invalid || !this.isStripeReady) {
      return;
    }

    // Check if user is authenticated
    if (!this.currentUser) {
      this.error = "You must be logged in to checkout. Please login and try again.";
      this.notificationService.error(
        'Authentication Required',
        'Please log in to continue with checkout.',
        5000
      );
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.isProcessing = true;
    this.error = null;

    try {
      // Prepare checkout data
      const checkoutData = {
        userId: this.currentUser?.id || 0,
        cartId: this.currentUser?.id || 0,
        customerEmail: this.checkoutForm.get('email')?.value,
        lineItems: this.cartState.items.map((item: CartItem) => ({
          name: this.getProductName(item.productId),
          description: `Product ID: ${item.productId}`,
          price: item.priceAtAdd,
          quantity: item.quantity,
          imageUrl: ''
        }))
      };

      // Create checkout session using Stripe service
      this.stripeService.createCheckoutSession(checkoutData).subscribe({
        next: async (response) => {
          // Redirect to Stripe Checkout using service
          const result = await this.stripeService.redirectToCheckout(response.sessionId);
          
          if (result.error) {
            this.handlePaymentError(result.error.message);
          }
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);
          this.handlePaymentError('Failed to initialize payment. Please try again.');
        }
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      this.handlePaymentError('An unexpected error occurred. Please try again.');
    }
  }

  private handlePaymentError(message: string): void {
    this.isProcessing = false;
    this.error = this.stripeService.handleStripeError({ message }) || message;
    this.notificationService.error(
      'Payment Failed',
      this.error,
      5000
    );
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  getTaxAmount(): number {
    return this.cartState.totalPrice * 0.05; // 5% as per your template
  }

  getShippingCost(): number {
    return this.cartState.totalPrice > 50 ? 0 : 5.99;
  }

  getTotalAmount(): number {
    return this.cartState.totalPrice + this.getTaxAmount() + this.getShippingCost();
  }
}