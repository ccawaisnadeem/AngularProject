import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../services/order';
import { ProductService, Product } from '../../services/product';
import { ShipmentService, Shipment } from '../../services/shipment';
import { NotificationService } from '../../services/notification.service';

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="order-tracking-page">
      <div class="container">
        <h2 class="mb-4">
          <i class="bi bi-truck me-2"></i>Order Tracking
        </h2>

        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Loading tracking information...</p>
        </div>

        <div *ngIf="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div *ngIf="!isLoading && !error && order" class="row">
          <!-- Order Details -->
          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-header">
                <h5><i class="bi bi-receipt me-2"></i>Order Details</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <strong>Order ID:</strong> #{{ order.id }}
                </div>
                <div class="mb-3">
                  <strong>Order Date:</strong> {{ order.orderDate | date:'medium' }}
                </div>
                <div class="mb-3">
                  <strong>Status:</strong> 
                  <span class="badge bg-primary">{{ order.status }}</span>
                </div>
                <div class="mb-3">
                  <strong>Payment Status:</strong> 
                  <span class="badge bg-success">{{ order.paymentStatus }}</span>
                </div>
                <div class="mb-3">
                  <strong>Total Amount:</strong> {{ order.totalAmount | currency }}
                </div>
                                 <div *ngIf="shipment?.trackingNumber" class="mb-3">
                   <strong>Tracking Number:</strong>
                   <p class="text-primary">{{ shipment!.trackingNumber }}</p>
                 </div>
                 <div *ngIf="shipment?.courierName" class="mb-3">
                   <strong>Courier:</strong>
                   <p class="text-info">{{ shipment!.courierName }}</p>
                 </div>
                 <div *ngIf="shipment?.deliveryDate" class="mb-3">
                   <strong>Delivery Date:</strong>
                   <p class="text-success">{{ shipment!.deliveryDate | date:'medium' }}</p>
                 </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-box me-2"></i>Order Items</h5>
              </div>
              <div class="card-body">
                <div *ngFor="let item of order.orderItems" class="d-flex align-items-center mb-2">
                  <img [src]="getProductImage(item.productId)" class="rounded me-2" alt="Product" style="width: 40px; height: 40px; object-fit: cover;">
                  <div class="flex-grow-1">
                    <small class="fw-bold">{{ getProductName(item.productId) }}</small>
                    <br>
                    <small class="text-muted">Qty: {{ item.quantity }}</small>
                  </div>
                  <small class="fw-bold">{{ (item.priceAtPurchase * item.quantity) | currency }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Tracking Timeline -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-clock-history me-2"></i>Tracking Timeline</h5>
              </div>
              <div class="card-body">
                <div *ngIf="trackingEvents.length === 0" class="text-center py-4">
                  <i class="bi bi-clock text-muted display-4"></i>
                  <p class="text-muted mt-3">Tracking information will be available once your order is confirmed and shipped.</p>
                </div>

                <div *ngIf="trackingEvents.length > 0" class="timeline">
                  <div *ngFor="let event of trackingEvents; let i = index" class="timeline-item">
                    <div class="timeline-marker" [class.active]="i === 0"></div>
                    <div class="timeline-content">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 class="mb-1">{{ event.status }}</h6>
                          <p class="text-muted mb-1">{{ event.description }}</p>
                          <small class="text-muted">{{ event.location }}</small>
                        </div>
                        <div class="text-end">
                          <small class="text-muted">{{ event.date }}</small>
                          <br>
                          <small class="text-muted">{{ event.time }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Summary -->
            <div class="card mt-4">
              <div class="card-header">
                <h5><i class="bi bi-info-circle me-2"></i>Status Summary</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="status-item">
                      <i class="bi bi-check-circle text-success me-2"></i>
                      <span>Order Placed</span>
                    </div>
                                         <div class="status-item" [class.active]="shipment?.status === 'Confirmed'">
                       <i class="bi" [class]="shipment?.status === 'Confirmed' ? 'bi-check-circle text-success' : 'bi-circle text-muted'"></i>
                       <span>Order Confirmed</span>
                     </div>
                     <div class="status-item" [class.active]="shipment?.status === 'Shipped'">
                       <i class="bi" [class]="shipment?.status === 'Shipped' ? 'bi-check-circle text-success' : 'bi-circle text-muted'"></i>
                       <span>Order Shipped</span>
                     </div>
                   </div>
                   <div class="col-md-6">
                     <div class="status-item" [class.active]="shipment?.status === 'In Transit'">
                       <i class="bi" [class]="shipment?.status === 'In Transit' ? 'bi-check-circle text-success' : 'bi-circle text-muted'"></i>
                       <span>In Transit</span>
                     </div>
                     <div class="status-item" [class.active]="shipment?.status === 'Out for Delivery'">
                       <i class="bi" [class]="shipment?.status === 'Out for Delivery' ? 'bi-check-circle text-success' : 'bi-circle text-muted'"></i>
                       <span>Out for Delivery</span>
                     </div>
                     <div class="status-item" [class.active]="shipment?.status === 'Delivered'">
                       <i class="bi" [class]="shipment?.status === 'Delivered' ? 'bi-check-circle text-success' : 'bi-circle text-muted'"></i>
                       <span>Delivered</span>
                     </div>
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
    .order-tracking-page {
      min-height: 60vh;
      padding: 2rem 0;
    }

    .timeline {
      position: relative;
      padding-left: 30px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #e9ecef;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
    }

    .timeline-marker {
      position: absolute;
      left: -22px;
      top: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #6c757d;
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px #e9ecef;
    }

    .timeline-marker.active {
      background-color: #0d6efd;
      box-shadow: 0 0 0 2px #0d6efd;
    }

    .timeline-content {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #0d6efd;
    }

    .status-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .status-item.active {
      background-color: #e7f3ff;
    }

    .status-item i {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }
  `]
})
export class OrderTrackingComponent implements OnInit {
  order: Order | null = null;
  shipment: Shipment | null = null;
  products: Product[] = [];
  trackingEvents: TrackingEvent[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private shipmentService: ShipmentService,
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
        this.loadTrackingInfo(parseInt(orderId));
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

  private loadTrackingInfo(orderId: number): void {
    this.shipmentService.getShipmentByOrder(orderId).subscribe({
      next: (shipment) => {
        this.shipment = shipment;
        this.generateTrackingEvents(shipment);
      },
      error: (error) => {
        console.error('Error loading shipment info:', error);
        // Don't show error for tracking, just use empty array
        this.trackingEvents = [];
      }
    });
  }

  private generateTrackingEvents(shipment: Shipment): void {
    const events: TrackingEvent[] = [];
    
    // Add order placed event
    events.push({
      date: this.order?.orderDate || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'Order Placed',
      location: 'Online Store',
      description: 'Your order has been successfully placed'
    });

    // Add shipment events based on shipment status
    if (shipment.shipmentDate) {
      events.push({
        date: shipment.shipmentDate.split('T')[0],
        time: new Date(shipment.shipmentDate).toLocaleTimeString(),
        status: 'Order Shipped',
        location: 'Warehouse',
        description: `Order shipped via ${shipment.courierName || 'Courier'}`
      });
    }

    if (shipment.status === 'In Transit') {
      events.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: 'In Transit',
        location: 'Distribution Center',
        description: 'Package is on its way to you'
      });
    }

    if (shipment.status === 'Out for Delivery') {
      events.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: 'Out for Delivery',
        location: 'Local Facility',
        description: 'Package is out for delivery'
      });
    }

    if (shipment.status === 'Delivered' && shipment.deliveryDate) {
      events.push({
        date: shipment.deliveryDate.split('T')[0],
        time: new Date(shipment.deliveryDate).toLocaleTimeString(),
        status: 'Delivered',
        location: 'Your Address',
        description: 'Package has been delivered'
      });
    }

    this.trackingEvents = events.reverse(); // Show most recent first
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  getProductImage(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.image || 'https://via.placeholder.com/40x40';
  }
}
