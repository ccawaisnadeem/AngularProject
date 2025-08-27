import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-recent-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="col-md-12">
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Recent Orders</h5>
          <a routerLink="/admin/orders" class="btn btn-sm btn-outline-warning text-black">View All</a>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
  <tr *ngFor="let order of recentOrders">
    <td>#ORD-{{ order.id }}</td>
    <td>
      <!-- show userId for now, or map to user name if you add it in DTO -->
      User #{{ order.userId }}
    </td>
    <td>{{ order.createdAt | date:'yyyy-MM-dd' }}</td>
    <td>
      <span class="badge" [ngClass]="getStatusBadge(order.orderStatus)">
        {{ order.orderStatus }}
      </span>
    </td>
    <td>{{ order.totalAmount | currency }}</td>
  </tr>

  <!-- Show items inside each order -->
  <tr *ngFor="let order of recentOrders">
    <td colspan="5">
      <strong>Items:</strong>
      <ul>
        <li *ngFor="let item of order.orderItems">
          Product #{{ item.productId }} – Qty: {{ item.quantity }} – Price: {{ item.priceAtPurchase | currency }}
        </li>
      </ul>
    </td>
  </tr>

  <tr *ngIf="recentOrders.length === 0">
    <td colspan="5" class="text-center py-3">No recent orders</td>
  </tr>
</tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminRecentOrdersComponent implements OnInit {
  recentOrders: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getOrders().subscribe({
      next: (orders) => {
        this.recentOrders = [...orders]
          .sort((a, b) => b.id - a.id)
          .slice(0, 4);
      },
      error: (err) => console.error('Failed to fetch recent orders:', err)
    });
  }

  getStatusBadge(status: number): string {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Processing';
    case 2: return 'Shipped';
    case 3: return 'Delivered';
    case 4: return 'Cancelled';
    default: return 'Unknown';
  }
}
}
