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
              <input type="text" class="form-control" placeholder="Search orders...">
            </div>
            <div class="col-md-3">
              <select class="form-select">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" placeholder="Date range">
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary w-100">Search</button>
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
                  <th scope="col">Order ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Payment</th>
                  <th scope="col" style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#ORD-001</td>
                  <td>John Doe</td>
                  <td>2023-09-10</td>
                  <td>3 items</td>
                  <td>$120.00</td>
                  <td><span class="badge bg-success">Delivered</span></td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-printer"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-002</td>
                  <td>Jane Smith</td>
                  <td>2023-09-09</td>
                  <td>2 items</td>
                  <td>$85.50</td>
                  <td><span class="badge bg-warning">Processing</span></td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-printer"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-003</td>
                  <td>Robert Johnson</td>
                  <td>2023-09-08</td>
                  <td>1 item</td>
                  <td>$210.75</td>
                  <td><span class="badge bg-info">Shipped</span></td>
                  <td><span class="badge bg-success">Paid</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-printer"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-004</td>
                  <td>Sarah Williams</td>
                  <td>2023-09-07</td>
                  <td>5 items</td>
                  <td>$345.25</td>
                  <td><span class="badge bg-secondary">Pending</span></td>
                  <td><span class="badge bg-warning">Pending</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-printer"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>#ORD-005</td>
                  <td>Michael Brown</td>
                  <td>2023-09-06</td>
                  <td>2 items</td>
                  <td>$89.99</td>
                  <td><span class="badge bg-danger">Cancelled</span></td>
                  <td><span class="badge bg-danger">Refunded</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>
                      <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-printer"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <div>Showing 1 to 5 of 25 entries</div>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">Next</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    // In a real app, fetch orders data from the service
    // this.adminService.getOrders().subscribe(orders => { ... })
  }
}
