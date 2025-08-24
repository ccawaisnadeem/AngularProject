import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order';
import { ProductService, Product } from '../../services/product';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-page">
      <div class="container">
        <h2 class="mb-4">
          <i class="bi bi-list-ul me-2"></i>My Orders
        </h2>

        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Loading your orders...</p>
        </div>

        <div *ngIf="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div *ngIf="!isLoading && !error && orders.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted mb-3"></i>
          <h3 class="text-muted">No Orders Yet</h3>
          <p class="text-muted mb-4">Start shopping to see your orders here</p>
          <a routerLink="/inventory" class="btn btn-primary">Start Shopping</a>
        </div>

        <div *ngIf="!isLoading && !error && orders.length > 0" class="row">
          <div class="col-12">
            <div *ngFor="let order of orders" class="card mb-4">
              <div class="card-header">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h6 class="mb-0">
                      <i class="bi bi-receipt me-2"></i>Order #{{ order.id }}
                    </h6>
                    <small class="text-muted">{{ order.orderDate | date:'medium' }}</small>
                  </div>
                  <div class="col-md-6 text-end">
                    <span class="badge bg-primary me-2">{{ order.status }}</span>
                    <span class="badge bg-success">{{ order.paymentStatus }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div *ngFor="let item of order.orderItems" class="row align-items-center mb-2">
                  <div class="col-md-2">
                    <img [src]="getProductImage(item.productId)" class="img-fluid rounded" alt="Product">
                  </div>
                  <div class="col-md-6">
                    <h6>{{ getProductName(item.productId) }}</h6>
                    <small class="text-muted">Qty: {{ item.quantity }}</small>
                  </div>
                  <div class="col-md-4 text-end">
                    <strong>{{ (item.priceAtPurchase * item.quantity) | currency }}</strong>
                  </div>
                </div>
                <hr>
                                 <div class="row">
                   <div class="col-md-6">
                     <small class="text-muted">{{ order.orderItems.length }} item(s)</small>
                   </div>
                   <div class="col-md-3 text-end">
                     <h6>Total: {{ order.totalAmount | currency }}</h6>
                   </div>
                   <div class="col-md-3 text-end">
                     <a [routerLink]="['/order-tracking', order.id]" class="btn btn-sm btn-outline-primary">
                       <i class="bi bi-truck me-1"></i>Track
                     </a>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      min-height: 60vh;
      padding: 2rem 0;
    }
    .orders-page img {
      width: 60px;
      height: 60px;
      object-fit: cover;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders';
        this.isLoading = false;
        this.notificationService.error(
          'Error',
          'Failed to load orders',
          5000
        );
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  getProductImage(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.image || 'https://via.placeholder.com/60x60';
  }
}
