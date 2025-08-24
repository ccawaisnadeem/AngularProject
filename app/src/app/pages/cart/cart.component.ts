import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService, Product } from '../../services/product';
import { CartItem } from '../../Models/Cart.Model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page">
      <div class="container">
        <h2 class="mb-4">
          <i class="bi bi-cart3 me-2"></i>Shopping Cart
        </h2>

        <!-- Loading State -->
        <div *ngIf="cartState.isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Loading your cart...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="cartState.error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ cartState.error }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="retryLoad()">
            <i class="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="!cartState.isLoading && !cartState.error && cartState.isEmpty" class="text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted mb-3"></i>
          <h3 class="text-muted">Your cart is empty</h3>
          <p class="text-muted mb-4">Start shopping to add items to your cart</p>
          <a routerLink="/inventory" class="btn btn-primary">Start Shopping</a>
        </div>

        <!-- Cart Items -->
        <div *ngIf="!cartState.isLoading && !cartState.error && !cartState.isEmpty" class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5>Cart Items ({{ cartState.totalItems }})</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let item of cartState.items" class="cart-item border-bottom py-3">
                  <div class="row align-items-center">
                    <div class="col-md-2">
                      <img [src]="getProductImage(item.productId)" class="img-fluid rounded" alt="Product">
                    </div>
                    <div class="col-md-4">
                      <h6>{{ getProductName(item.productId) }}</h6>
                      <p class="text-muted small">{{ getProductCategory(item.productId) }}</p>
                    </div>
                    <div class="col-md-2">
                      <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary" 
                                (click)="updateQuantity(item, item.quantity - 1)"
                                [disabled]="item.quantity <= 1">
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="mx-2">{{ item.quantity }}</span>
                        <button class="btn btn-sm btn-outline-secondary" 
                                (click)="updateQuantity(item, item.quantity + 1)">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div class="col-md-2 text-end">
                      <div class="fw-bold">{{ (item.priceAtAdd * item.quantity) | currency }}</div>
                    </div>
                    <div class="col-md-2 text-end">
                      <button class="btn btn-sm btn-outline-danger" 
                              (click)="removeItem(item)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h5>Order Summary</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{{ cartState.totalPrice | currency }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <span>{{ getTaxAmount() | currency }}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between mb-3">
                  <span class="fw-bold">Total</span>
                  <span class="fw-bold">{{ getTotalAmount() | currency }}</span>
                </div>
                <button class="btn btn-primary w-100 mb-2" (click)="proceedToCheckout()">
                  Proceed to Checkout
                </button>
                <button class="btn btn-outline-secondary w-100" (click)="continueShopping()">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: 60vh;
      padding: 2rem 0;
    }
    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cartState: any = { items: [], totalItems: 0, totalPrice: 0, isLoading: false, error: null, isEmpty: true };
  products: Product[] = [];
  private subscription = new Subscription();

  constructor(
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.cartStateService.cart$.subscribe(state => {
        this.cartState = state;
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

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }
    this.cartStateService.updateItemQuantity(item.id!, newQuantity).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.cartUpdated();
        }
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartStateService.removeItem(item.id!).subscribe({
      next: (success) => {
        if (success) {
          const productName = this.getProductName(item.productId);
          this.notificationService.itemRemovedFromCart(productName);
        }
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/inventory']);
  }

  retryLoad(): void {
    // This will trigger cart reload through the service
    this.cartStateService.cart$.subscribe();
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  getProductCategory(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.category || '';
  }

  getProductImage(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.image || 'https://via.placeholder.com/80x80';
  }

  getTaxAmount(): number {
    return this.cartState.totalPrice * 0.08;
  }

  getTotalAmount(): number {
    return this.cartState.totalPrice + this.getTaxAmount();
  }
}
