import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-inventory">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Inventory Management</h2>
        <button class="btn btn-primary">
          <i class="bi bi-plus-lg me-1"></i> Add Product
        </button>
      </div>
      
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <input type="text" class="form-control" placeholder="Search products...">
            </div>
            <div class="col-md-3">
              <select class="form-select">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Garden</option>
                <option value="books">Books</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select">
                <option value="">All Status</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;"><input type="checkbox" class="form-check-input"></th>
                  <th scope="col" style="width: 70px;">Image</th>
                  <th scope="col">Product Name</th>
                  <th scope="col">SKU</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Status</th>
                  <th scope="col" style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td><img src="https://via.placeholder.com/50" class="rounded" alt="Product"></td>
                  <td>Smartphone X Pro</td>
                  <td>SKU-001</td>
                  <td>Electronics</td>
                  <td>$699.99</td>
                  <td>125</td>
                  <td><span class="badge bg-success">In Stock</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td><img src="https://via.placeholder.com/50" class="rounded" alt="Product"></td>
                  <td>Wireless Headphones</td>
                  <td>SKU-002</td>
                  <td>Electronics</td>
                  <td>$149.99</td>
                  <td>85</td>
                  <td><span class="badge bg-success">In Stock</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td><img src="https://via.placeholder.com/50" class="rounded" alt="Product"></td>
                  <td>Cotton T-Shirt</td>
                  <td>SKU-003</td>
                  <td>Clothing</td>
                  <td>$24.99</td>
                  <td>8</td>
                  <td><span class="badge bg-warning">Low Stock</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td><img src="https://via.placeholder.com/50" class="rounded" alt="Product"></td>
                  <td>Smart Watch</td>
                  <td>SKU-004</td>
                  <td>Electronics</td>
                  <td>$299.99</td>
                  <td>0</td>
                  <td><span class="badge bg-danger">Out of Stock</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                      <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
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
            <div>Showing 1 to 4 of 20 entries</div>
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
export class AdminInventoryComponent implements OnInit {
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    // In a real app, fetch inventory data from the service
    // this.adminService.getInventory().subscribe(inventory => { ... })
  }
}
