import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Product, ProductService } from '../../../services/product';
import { ShipmentService } from '../../../services/shipment';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '../../../services/order';
import { forkJoin } from 'rxjs';


interface OrderDetailData {
  order: any;
  user: any;
  products: any[];
  shipment: any;
}

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show" tabindex="-1" style="display: block;" *ngIf="isVisible">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header bg-warning text-white">
            <h4 class="modal-title">
              <i class="bi bi-receipt me-2"></i>
              Order Details #{{ orderData?.order?.id }}
            </h4>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="modal-body text-center py-5">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading order details...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error && !loading" class="modal-body text-center py-5">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
            <button class="btn btn-warning" (click)="loadOrderDetails()">Try Again</button>
          </div>

          <!-- Order Details Content -->
          <div *ngIf="orderData && !loading && !error" class="modal-body p-0">
            
            <!-- Order Summary Header -->
            <div class="bg-light border-bottom p-4">
              <div class="row">
                <div class="col-md-6">
                  <h5 class="text-warning mb-3">Order Information</h5>
                  <div class="row">
                    <div class="col-6">
                      <strong>Order ID:</strong><br>
                      <span class="text-muted">#{{ orderData.order.id }}</span>
                    </div>
                    <div class="col-6">
                      <strong>Order Date:</strong><br>
                      <span class="text-muted">{{ formatDate(orderData.order.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <h5 class="text-success mb-3">Payment Information</h5>
                  <div class="row">
                    <div class="col-6">
                      <strong>Payment Via:</strong><br>
                      <span class="badge bg-info">Stripe</span>
                    </div>
                    <div class="col-6">
                      <strong>Total Paid:</strong><br>
                      <span class="text-success fw-bold fs-5">{{ orderData.order.totalAmount | currency }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer & Shipping Information -->
            <div class="p-4 border-bottom">
              <div class="row">
                <div class="col-md-6">
                  <h5 class="text-primary mb-3">
                    <i class="bi bi-person me-2"></i>Customer Information
                  </h5>
                  <div class="card bg-light">
                    <div class="card-body">
                      <p class="mb-2">
                        <strong>Name:</strong> {{ orderData.user?.name || orderData.user?.fullName || 'N/A' }}
                      </p>
                      <p class="mb-2">
                        <strong>Email:</strong> {{ orderData.user?.email || 'N/A' }}
                      </p>
                      
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <h5 class="text-primary mb-3">
                    <i class="bi bi-geo-alt me-2"></i>Shipping Address
                  </h5>
                  <div class="card bg-light">
                    <div class="card-body">
                      <p class="mb-2">
                        <strong>Address:</strong> {{ orderData.user?.address || 'N/A' }}
                      </p>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Status -->
            <div class="p-4 border-bottom">
              <div class="row">
                <div class="col-md-4">
                  <h6 class="mb-2">Order Status</h6>
                  <span class="badge fs-6 px-3 py-2" [class]="'bg-' + getStatusColor(orderData.order.orderStatus)">
                    {{ getOrderStatusText(orderData.order.orderStatus) }}
                  </span>
                </div>
                <div class="col-md-4">
                  <h6 class="mb-2">Payment Status</h6>
                  <span class="badge fs-6 px-3 py-2" [class]="'bg-' + getPaymentColor(orderData.order.paymentStatus)">
                    {{ getPaymentStatusText(orderData.order.paymentStatus) }}
                  </span>
                </div>
                <div class="col-md-4">
                  <h6 class="mb-2">Shipment Status</h6>
                  <span class="badge fs-6 px-3 py-2" [class]="'bg-' + getShipmentColor(orderData.shipment?.status)">
                    {{ getShipmentStatusText(orderData.shipment?.status) }}
                  </span>
                  <div *ngIf="orderData.shipment?.trackingNumber" class="mt-2">
                    <small class="text-muted">
                      <strong>Tracking:</strong> {{ orderData.shipment.trackingNumber }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Ordered -->
            <div class="p-4">
              <h5 class="text-primary mb-4">
                <i class="bi bi-box me-2"></i>Products Ordered
              </h5>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 80px;">Image</th>
                      <th>Product Name</th>
                      <th style="width: 100px;">Quantity</th>
                      <th style="width: 120px;">Unit Price</th>
                      <th style="width: 120px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of orderData.order.orderItems">
                      <td>
                        <img [src]="getProductImage(item.productId)" 
                             [alt]="getProductName(item.productId)"
                             class="img-thumbnail"
                             style="width: 60px; height: 60px; object-fit: cover;"
                             onerror="this.alt='Image not found'">
                      </td>
                      <td class="align-middle">
                        <strong>{{ getProductName(item.productId) }}</strong>
                        <br>
                        <small class="text-muted">{{ getProductDescription(item.productId) }}</small>
                      </td>
                      <td class="align-middle text-center">
                        <span class="badge bg-secondary fs-6">{{ item.quantity }}</span>
                      </td>
                      <td class="align-middle">
                        <strong>{{ item.priceAtPurchase | currency }}</strong>
                      </td>
                      <td class="align-middle">
                        <strong class="text-success">{{ (item.quantity * item.priceAtPurchase) | currency }}</strong>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <th colspan="4" class="text-end">Grand Total:</th>
                      <th class="text-success fs-5">{{ orderData.order.totalAmount +  0.10 * orderData.order.totalAmount | currency }}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer" *ngIf="orderData && !loading">
            <button type="button" class="btn btn-outline-primary" (click)="printOrder()">
              <i class="bi bi-printer me-1"></i> Print Order
            </button>
            <button type="button" class="btn btn-outline-info" (click)="manageShipment()">
              <i class="bi bi-truck me-1"></i> Manage Shipment
            </button>
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" *ngIf="isVisible" (click)="closeModal()"></div>
  `,
  styles: [`
    .modal {
      z-index: 1050;
    }
    
    .modal-backdrop {
      z-index: 1040;
    }
    
    .img-thumbnail {
      border-radius: 8px;
    }
    
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .badge {
      font-weight: 500;
    }
    
    .table th {
      font-weight: 600;
      color: #495057;
    }
    
    .btn-close-white {
      filter: invert(1) grayscale(100%) brightness(200%);
    }
    
    .modal-xl {
      max-width: 1200px;
    }
    
    .table-responsive {
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }
  `]
})
export class OrderDetailModalComponent implements OnInit {
  @Input() orderId: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  orderData: OrderDetailData | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private shipmentService: ShipmentService
  ) {}

  ngOnInit() {
    if (this.orderId && this.isVisible) {
      this.loadOrderDetails();
    }
  }

  ngOnChanges() {
    if (this.orderId && this.isVisible) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails() {
    if (!this.orderId) return;

    this.loading = true;
    this.error = null;

    // Load order details, user info, and shipment info
    forkJoin({
      order: this.adminService.getOrderById(this.orderId),
      shipment: this.shipmentService.getShipmentByOrder(this.orderId).pipe(
        // Handle case where shipment might not exist
        catchError(() => of(null))
      )
    }).subscribe({
      next: (data) => {
        // Get user details
        if (data.order.userId) {
          this.adminService.getUser(data.order.userId.toString()).subscribe({
            next: (user) => {
              // Load product details for each order item
              const productRequests = data.order.orderItems.map((item: any) => 
                this.productService.getProduct(item.productId)
              );

              if (productRequests.length > 0) {
                forkJoin<Product[]>(productRequests).subscribe({
                  next: (products) => {
                    this.orderData = {
                      order: data.order,
                      user: user,
                      products: products,
                      shipment: data.shipment
                    };
                    this.loading = false;
                  },
                  error: (error) => {
                    console.error('Error loading products:', error);
                    this.orderData = {
                      order: data.order,
                      user: user,
                      products: [],
                      shipment: data.shipment
                    };
                    this.loading = false;
                  }
                });
              } else {
                this.orderData = {
                  order: data.order,
                  user: user,
                  products: [],
                  shipment: data.shipment
                };
                this.loading = false;
              }
            },
            error: (error) => {
              console.error('Error loading user:', error);
              this.error = 'Failed to load customer details';
              this.loading = false;
            }
          });
        } else {
          this.error = 'No customer information available';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.error = 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  closeModal() {
    this.isVisible = false;
    this.closeEvent.emit();
  }

  // Helper methods for getting product information
  getProductName(productId: number): string {
    const product = this.orderData?.products?.find(p => p.id === productId);
    return product?.title || `Product #${productId}`;
  }

  getProductDescription(productId: number): string {
    const product = this.orderData?.products?.find(p => p.id === productId);
    return product?.description || 'No description available';
  }

  getProductImage(productId: number): string {
    const product = this.orderData?.products?.find(p => p.id === productId);
    return product?.image || '/assets/images/no-image.png';
  }

  // Status helper methods
  getOrderStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Confirmed';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getPaymentStatusText(status: number): string {
    switch (status) {
      case 0: return 'Payment Pending';
      case 1: return 'Paid';
      case 2: return 'Failed';
      case 3: return 'Refunded';
      default: return 'Unknown';
    }
  }

  getShipmentStatusText(status: number | undefined): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      case 4: return 'Cancelled';
      default: return 'N/A';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'danger';
      default: return 'secondary';
    }
  }

  getPaymentColor(status: number): string {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'danger';
      case 3: return 'info';
      default: return 'secondary';
    }
  }

  getShipmentColor(status: number | undefined): string {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'info';
      case 2: return 'primary';
      case 3: return 'success';
      case 4: return 'danger';
      default: return 'secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Action methods
  printOrder() {
    // Implement print functionality
    window.print();
  }

  manageShipment() {
    // Implement shipment management
    console.log('Manage shipment for order:', this.orderId);
    // You can emit an event or open another modal for shipment management
  }
}

// Add missing import
import { catchError, of } from 'rxjs';