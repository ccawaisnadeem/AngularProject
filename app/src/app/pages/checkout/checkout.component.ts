import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order';
import { ProductService, Product } from '../../services/product';
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
            <div class="card mb-4">
              <div class="card-header">
                <h5><i class="bi bi-person me-2"></i>Billing Information</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
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

                  <div class="d-flex justify-content-between mt-4">
                    <a routerLink="/cart" class="btn btn-outline-secondary">
                      <i class="bi bi-arrow-left me-2"></i>Back to Cart
                    </a>
                    <button type="submit" class="btn btn-primary" [disabled]="checkoutForm.invalid || isProcessing">
                      <span *ngIf="!isProcessing">
                        <i class="bi bi-check-circle me-2"></i>Place Order
                      </span>
                      <span *ngIf="isProcessing">
                        <i class="bi bi-hourglass-split me-2"></i>Processing...
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
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
                  <span>Tax (8%)</span>
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
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartState: any = { items: [], totalItems: 0, totalPrice: 0, isLoading: false, error: null };
  products: Product[] = [];
  isLoading = false;
  isProcessing = false;
  error: string | null = null;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private productService: ProductService,
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
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      return;
    }

    this.isProcessing = true;
    this.error = null;

         const orderData = {
       items: this.cartState.items.map((item: CartItem) => ({
         productId: item.productId,
         quantity: item.quantity,
         priceAtPurchase: item.priceAtAdd
       })),
       totalAmount: this.getTotalAmount()
     };

    this.orderService.placeOrder(orderData).subscribe({
      next: (order: any) => {
        this.isProcessing = false;
        this.notificationService.success(
          'Order Placed Successfully!',
          `Your order #${order.id} has been placed successfully.`,
          5000
        );
        this.cartStateService.clearCart().subscribe(() => {
          this.router.navigate(['/order-confirmation', order.id]);
        });
      },
      error: (error: any) => {
        this.isProcessing = false;
        console.error('Error placing order:', error);
        this.error = 'Failed to place order. Please try again.';
        this.notificationService.error(
          'Order Failed',
          'There was an error processing your order. Please try again.',
          5000
        );
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  getTaxAmount(): number {
    return this.cartState.totalPrice * 0.08;
  }

  getShippingCost(): number {
    return this.cartState.totalPrice > 50 ? 0 : 5.99;
  }

  getTotalAmount(): number {
    return this.cartState.totalPrice + this.getTaxAmount() + this.getShippingCost();
  }
}
