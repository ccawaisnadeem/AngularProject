import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '../../../services/order';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-orders">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Order Management</h2>
        <div>
          <button class="btn btn-outline-secondary me-2" (click)="refreshOrders()">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button class="btn btn-outline-secondary me-2">
            <i class="bi bi-download me-1"></i> Export
          </button>
          <button class="btn btn-primary">
            <i class="bi bi-funnel me-1"></i> Filter
          </button>
        </div>
      </div>
      
      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h5>Total Orders</h5>
              <h3>{{ getTotalOrders() }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <h5>Pending Orders</h5>
              <h3>{{ getPendingOrders() }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <h5>Shipped Orders</h5>
              <h3>{{ getShippedOrders() }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5>Delivered Orders</h5>
              <h3>{{ getDeliveredOrders() }}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input type="text" class="form-control" placeholder="Search orders..." [(ngModel)]="searchTerm" (input)="applyFilters()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
                <option value="">All Status</option>
                <option value="0">Pending</option>
                <option value="1">Confirmed</option>
                <option value="2">Shipped</option>
                <option value="3">Delivered</option>
                <option value="4">Cancelled</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterPayment" (change)="applyFilters()">
                <option value="">All Payment Status</option>
                <option value="0">Payment Pending</option>
                <option value="1">Paid</option>
                <option value="2">Failed</option>
                <option value="3">Refunded</option>
              </select>
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" [(ngModel)]="filterDate" (change)="applyFilters()">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Orders table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Shipment</th>
                  <th style="width: 200px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders">
                  <td><strong>#{{ order.id }}</strong></td>
                  <td>
                    <div>
                      <strong>{{ order.user?.name || 'N/A' }}</strong>
                      <br><small class="text-muted">{{ order.user?.email || '' }}</small>
                    </div>
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                  <td>{{ order.orderItems?.length || 0 }} items</td>
                  <td><strong>{{ order.totalAmount | currency }}</strong></td>
                  <td>
                    <select class="form-select form-select-sm" 
                            [value]="order.orderStatus" 
                            (change)="updateOrderStatus(order, $event)"
                            [class]="'bg-' + getStatusColor(order.orderStatus) + ' text-white'">
                      <option value="0">Pending</option>
                      <option value="1">Confirmed</option>
                      <option value="2">Shipped</option>
                      <option value="3">Delivered</option>
                      <option value="4">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select class="form-select form-select-sm" 
                            [value]="order.paymentStatus" 
                            (change)="updatePaymentStatus(order, $event)"
                            [class]="'bg-' + getPaymentColor(order.paymentStatus) + ' text-white'">
                      <option value="0">Pending</option>
                      <option value="1">Paid</option>
                      <option value="2">Failed</option>
                      <option value="3">Refunded</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'bg-' + getShipmentColor(order.shipment?.status)">
                      {{ getShipmentStatusText(order.shipment?.status) }}
                    </span>
                    <br *ngIf="order.shipment?.trackingNumber">
                    <small class="text-muted">{{ order.shipment?.trackingNumber }}</small>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" 
                              (click)="viewOrderDetails(order)" 
                              title="View Details">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" 
                              (click)="manageShipment(order)" 
                              title="Manage Shipment">
                        <i class="bi bi-truck"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" 
                              (click)="printOrder(order.id)" 
                              title="Print">
                        <i class="bi bi-printer"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="loading">
                  <td colspan="9" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    Loading orders...
                  </td>
                </tr>
                <tr *ngIf="filteredOrders.length === 0 && !loading">
                  <td colspan="9" class="text-center py-3">No orders found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      border-top: none;
      font-weight: 600;
      background-color: #f8f9fa;
    }
    
    .btn-group .btn {
      margin-right: 2px;
    }
    
    .form-select-sm.bg-warning { color: #000; }
    .form-select-sm.bg-success { color: #fff; }
    .form-select-sm.bg-danger { color: #fff; }
    .form-select-sm.bg-info { color: #fff; }
    .form-select-sm.bg-secondary { color: #fff; }
    .form-select-sm.bg-primary { color: #fff; }
    
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid #e3e6f0;
    }
    
    .table-responsive {
      max-height: 600px;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  searchTerm: string = '';
  filterStatus: string = '';
  filterPayment: string = '';
  filterDate: string = '';
  loading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.adminService.getOrders().subscribe({
      next: (orders: any) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  refreshOrders() {
    this.loadOrders();
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
                           order.id.toString().includes(this.searchTerm) ||
                           order.user?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.user?.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || order.orderStatus.toString() === this.filterStatus;
      
      const matchesPayment = !this.filterPayment || order.paymentStatus.toString() === this.filterPayment;
      
      const matchesDate = !this.filterDate || 
                         new Date(order.createdAt).toDateString() === new Date(this.filterDate).toDateString();
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }

  // Statistics methods
  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.orderStatus === 0).length;
  }

  getShippedOrders(): number {
    return this.orders.filter(order => order.orderStatus === 2).length;
  }

  getDeliveredOrders(): number {
    return this.orders.filter(order => order.orderStatus === 3).length;
  }

  // Status update methods
  updateOrderStatus(order: any, event: any) {
    const newStatus = parseInt(event.target.value);
    this.adminService.updateOrderStatusOnly(order.id, newStatus).subscribe({
      next: (response: any) => {
        order.orderStatus = newStatus;
        console.log('Order status updated successfully');
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        // Revert the dropdown to original value
        event.target.value = order.orderStatus;
      }
    });
  }

  updatePaymentStatus(order: any, event: any) {
    const newStatus = parseInt(event.target.value);
    this.adminService.updatePaymentStatus(order.id, newStatus).subscribe({
      next: (response: any) => {
        order.paymentStatus = newStatus;
        console.log('Payment status updated successfully');
      },
      error: (error: any) => {
        console.error('Error updating payment status:', error);
        // Revert the dropdown to original value
        event.target.value = order.paymentStatus;
      }
    });
  }

  // Color methods for styling
  getStatusColor(status: number): string {
    switch (status) {
      case 0: return 'warning'; // Pending
      case 1: return 'info';    // Confirmed
      case 2: return 'primary'; // Shipped
      case 3: return 'success'; // Delivered
      case 4: return 'danger';  // Cancelled
      default: return 'secondary';
    }
  }

  getPaymentColor(status: number): string {
    switch (status) {
      case 0: return 'warning'; // Pending
      case 1: return 'success'; // Paid
      case 2: return 'danger';  // Failed
      case 3: return 'info';    // Refunded
      default: return 'secondary';
    }
  }

  getShipmentColor(status: number | undefined): string {
    switch (status) {
      case 0: return 'warning'; // Pending
      case 1: return 'info';    // Processing
      case 2: return 'primary'; // Shipped
      case 3: return 'success'; // Delivered
      default: return 'secondary';
    }
  }

  getShipmentStatusText(status: number | undefined): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      default: return 'N/A';
    }
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  // Action methods
  viewOrderDetails(order: any) {
    console.log('View order details:', order);
    // Implement order details modal or navigation
  }

  manageShipment(order: any) {
    console.log('Manage shipment for order:', order.id);
    // Implement shipment management modal or navigation
  }

  printOrder(orderId: number) {
    console.log('Print order:', orderId);
    // Implement print functionality
  }
}
