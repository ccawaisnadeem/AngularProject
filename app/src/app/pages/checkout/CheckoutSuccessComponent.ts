import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { StripeService } from '../../services/StripeService';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center">
            <div class="spinner-border text-primary mb-3"></div>
            <h3>Verifying your payment...</h3>
            <p class="text-muted">Please wait while we confirm your order.</p>
          </div>

          <!-- Success State -->
          <div *ngIf="!isLoading && !error" class="text-center">
            <div class="mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            </div>
            <h1 class="text-success mb-3">Payment Successful!</h1>
            <p class="lead mb-4">Thank you for your purchase. Your order has been confirmed.</p>
            
            <div *ngIf="sessionDetails" class="card mb-4">
              <div class="card-header bg-light">
                <h5 class="mb-0">Order Details</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-sm-6">
                    <strong>Session ID:</strong>
                  </div>
                  <div class="col-sm-6">
                    {{ sessionId }}
                  </div>
                </div>
                <div class="row mt-2">
                  <div class="col-sm-6">
                    <strong>Email:</strong>
                  </div>
                  <div class="col-sm-6">
                    {{ sessionDetails.customerEmail }}
                  </div>
                </div>
                <div class="row mt-2">
                  <div class="col-sm-6">
                    <strong>Total Amount:</strong>
                  </div>
                  <div class="col-sm-6">
                    {{ (sessionDetails.totalAmount / 100) | currency }}
                  </div>
                </div>
                <div class="row mt-2">
                  <div class="col-sm-6">
                    <strong>Payment Status:</strong>
                  </div>
                  <div class="col-sm-6">
                    <span class="badge bg-success">{{ sessionDetails.paymentStatus | titlecase }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2 d-md-block">
              <a routerLink="/orders" class="btn btn-warning">
                <i class="bi bi-list-ul me-2"></i>View My Orders
              </a>
              <a routerLink="/products" class="btn btn-outline-warning">
                <i class="bi bi-arrow-left me-2"></i>Continue Shopping
              </a>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="text-center">
            <div class="mb-4">
              <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 4rem;"></i>
            </div>
            <h1 class="text-warning mb-3">Payment Verification Failed</h1>
            <p class="lead mb-4">{{ error }}</p>
            <div class="d-grid gap-2 d-md-block">
              <a routerLink="/checkout" class="btn btn-warning">
                <i class="bi bi-arrow-left me-2"></i>Back to Checkout
              </a>
              <a routerLink="/cart" class="btn btn-outline-warning">
                <i class="bi bi-cart me-2"></i>View Cart
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CheckoutSuccessComponent implements OnInit {
  sessionId: string | null = null;
  sessionDetails: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private stripeService: StripeService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        this.verifyPayment();
      } else {
        this.error = 'No session ID provided.';
        this.isLoading = false;
      }
    });
  }

  private verifyPayment(): void {
    if (!this.sessionId) return;

    this.stripeService.getCheckoutSession(this.sessionId).subscribe({
      next: (session) => {
        this.sessionDetails = session;
        this.isLoading = false;
        
        // After successful payment, create order and clear cart
        this.createOrderAndClearCart(session);

        // Show success notification
        this.notificationService.success(
          'Payment Successful!',
          'Your order has been confirmed and you will receive an email shortly.',
          5000
        );
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
        this.error = 'Failed to verify payment. Please contact support if you were charged.';
        this.isLoading = false;
        
        this.notificationService.error(
          'Payment Verification Failed',
          'Please contact support if you believe this is an error.',
          0
        );
      }
    });
  }

  private createOrderAndClearCart(session: any): void {
    const userId = this.getCurrentUserId();
    
    // Use the confirm-payment endpoint which creates order with correct payment status and clears cart
    this.orderService.confirmPayment(userId, {
      sessionId: this.sessionId,
      customerEmail: session.customerEmail,
      totalAmount: session.totalAmount
    }).subscribe({
      next: (order) => {
        console.log('Order created successfully with payment confirmation:', order);
        // Cart items are automatically cleared by the backend
        // Force reload the cart state to reflect the changes
        this.cartStateService.clearCart().subscribe({
          next: () => console.log('Cart state cleared in frontend'),
          error: (error) => console.log('Cart state clear failed, but order was created:', error)
        });
      },
      error: (error) => {
        console.error('Error confirming payment and creating order:', error);
        // Try manual cart clearing as fallback
        this.cartStateService.clearCart().subscribe({
          next: () => console.log('Cart cleared manually after order creation failure'),
          error: (clearError) => console.error('Both order creation and cart clearing failed:', clearError)
        });
      }
    });
  }

  private clearCartSafely(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cartStateService.clearCart().subscribe({
        next: () => {
          console.log('Cart cleared after successful payment');
          resolve();
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          // Don't show error to user as payment was successful
          reject(error);
        }
      });
    });
  }

  private createOrder(session: any): void {
    // Try to create order, but don't fail the user experience if it doesn't work
    try {
      const sessionData = {
        userId: this.getCurrentUserId(),
        sessionId: this.sessionId,
        customerEmail: session.customerEmail,
        totalAmount: session.totalAmount,
        paymentStatus: session.paymentStatus
      };
      
      // Use the createOrderFromSession method
      this.orderService.createOrderFromSession(sessionData).subscribe({
        next: (order) => {
          console.log('Order created successfully:', order);
        },
        error: (error) => {
          console.error('Error creating order record:', error);
          // Just log the error, don't show it to user since payment was successful
          console.warn('Order creation failed, but payment was successful. User will see payment confirmation.');
        }
      });
    } catch (error) {
      console.error('Error in createOrder method:', error);
      // Silent fail - payment was successful, which is what matters most
    }
  }

  private getCurrentUserId(): number {
    // Get user ID from auth service or return 0 as fallback
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return parseInt(user.id) || 0;
  }
}