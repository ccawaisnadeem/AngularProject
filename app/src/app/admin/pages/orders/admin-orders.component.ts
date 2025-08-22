import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-orders">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Order Management</h2>
        <div>
          <button class="btn btn-outline-secondary me-2">
            <i class="bi bi-download me-1"></i> Export
          </button>
          <button class="btn btn-primary">
            <i class="bi bi-funnel me-1"></i> Filter
          </button>
        </div>
      </div>
      
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input type="text" class="form-control" placeholder="Search orders..." [(ngModel)]="searchTerm">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" [(ngModel)]="filterDate">
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary w-100" (click)="applyFilters()">Search</button>
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
                  <th>Status</th>
                  <th>Payment</th>
                   <th>Total</th>
                 
                  <th style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of filteredOrders">
                  <td>#ORD-{{ order.id }}</td>
                  <td>{{ order.user?.name || 'N/A' }}</td>
                  <td>{{ order.orderDate | date:'yyyy-MM-dd' }}</td>
                  <td>{{ order.orderItems?.length || 0 }} items</td>
                  <td>{{ order.totalAmount | currency }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusBadge(order.status)">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getPaymentBadge(order.paymentStatus)">
                      {{ order.paymentStatus }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" (click)="viewOrder(order.id)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" (click)="printOrder(order.id)">
                        <i class="bi bi-printer"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredOrders.length === 0">
                  <td colspan="8" class="text-center py-3">No orders found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];

  searchTerm: string = '';
  filterStatus: string = '';
  filterDate: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
      },
      error: (err) => console.error('Failed to load orders:', err)
    });
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = this.searchTerm ? 
        order.user?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        order.id.toString().includes(this.searchTerm) : true;

      const matchesStatus = this.filterStatus ? order.status === this.filterStatus : true;

      const matchesDate = this.filterDate ? 
        (new Date(order.orderDate).toISOString().split('T')[0] === this.filterDate) : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-secondary';
      case 'Confirmed': return 'bg-warning';
      case 'Shipped': return 'bg-info';
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-light';
    }
  }

  getPaymentBadge(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning';
      case 'Failed': return 'bg-danger';
      case 'Refunded': return 'bg-secondary';
      default: return 'bg-light';
    }
  }

  viewOrder(orderId: number) {
    console.log('Viewing order:', orderId);
    // Navigate to order detail page
  }

  printOrder(orderId: number) {
    console.log('Printing order:', orderId);
    // Trigger print
  }
}
