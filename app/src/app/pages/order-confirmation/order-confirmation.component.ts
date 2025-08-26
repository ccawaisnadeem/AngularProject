import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService, Order, OrderStatus, PaymentStatus } from '../../services/order';
import { ProductService, Product } from '../../services/product';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="order-confirmation-page">
      <div class="container">
        <div class="text-center mb-4">
          <i class="bi bi-check-circle text-success display-1"></i>
          <h2 class="mt-3">Order Confirmed!</h2>
          <p class="text-muted">Thank you for your purchase</p>
        </div>

        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Loading order details...</p>
        </div>

        <div *ngIf="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div *ngIf="!isLoading && !error && order" class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-receipt me-2"></i>Order Details</h5>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Order ID:</strong> #{{ order.id }}
                  </div>
                  <div class="col-md-6">
                    <strong>Order Date:</strong> {{ order.createdAt | date:'medium' }}
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Status:</strong> 
                    <span class="badge bg-warning">{{ getOrderStatusText(order.orderStatus) }}</span>
                  </div>
                  <div class="col-md-6">
                    <strong>Payment Status:</strong> 
                    <span class="badge bg-success">{{ getPaymentStatusText(order.paymentStatus) }}</span>
                  </div>
                </div>

                <h6 class="mt-4 mb-3">Order Items</h6>
                <div *ngFor="let item of order.orderItems" class="border-bottom py-2">
                  <div class="row align-items-center">
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
                </div>

                <div class="text-end mt-3">
                  <h5>Total: {{ order.totalAmount | currency }}</h5>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
              <div class="card-header bg-success text-white">
                <h5><i class="bi bi-check-circle me-2"></i>What's Next?</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <i class="bi bi-envelope text-primary me-2"></i>
                  <strong>Email Confirmation</strong>
                  <p class="small text-muted">You'll receive an Order confirmation shortly.</p>
                </div>
                <div class="mb-3">
                  <i class="bi bi-truck text-primary me-2"></i>
                  <strong>Shipping Updates</strong>
                  <p class="small text-muted">Track your Order status in your account.</p>
                </div>
                <div class="mb-3">
                  <i class="bi bi-headset text-primary me-2"></i>
                  <strong>Need Help?</strong>
                  <p class="small text-muted">Contact our support team if you have questions.</p>
                </div>
              </div>
            </div>

                         <div class="card mt-3">
               <div class="card-body text-center">
                 <a routerLink="/inventory" class="btn btn-warning me-2">
                   <i class="bi bi-shop me-2"></i>Continue Shopping
                 </a>
                 <a [routerLink]="['/order-tracking', order.id]" class="btn btn-outline-warning me-2">
                   <i class="bi bi-truck me-2"></i>Track Order
                 </a>
                 <a routerLink="/orders" class="btn btn-outline-warning">
                   <i class="bi bi-list-ul me-2"></i>View Orders
                 </a>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-confirmation-page {
      min-height: 60vh;
      padding: 2rem 0;
    }
    .order-confirmation-page img {
      width: 60px;
      height: 60px;
      object-fit: cover;
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrder();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  private loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.error = 'Order ID not found';
      return;
    }

    this.isLoading = true;
    this.orderService.getOrderById(parseInt(orderId)).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details';
        this.isLoading = false;
        this.notificationService.error(
          'Error',
          'Failed to load order details',
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

  // Helper methods for enum text display
  getOrderStatusText(status: OrderStatus | undefined): string {
    if (status === undefined || status === null) return 'Unknown';
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Confirmed:
        return 'Confirmed';
      case OrderStatus.Shipped:
        return 'Shipped';
      case OrderStatus.Delivered:
        return 'Delivered';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPaymentStatusText(status: PaymentStatus | undefined): string {
    if (status === undefined || status === null) return 'Unknown';
    switch (status) {
      case PaymentStatus.Pending:
        return 'Pending';
      case PaymentStatus.Paid:
        return 'Paid';
      case PaymentStatus.Failed:
        return 'Failed';
      case PaymentStatus.Refunded:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  }
}
