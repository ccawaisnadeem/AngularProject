import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ProductService, Product } from '../../../services/product';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-inventory">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Inventory Management</h2>
        <button class="btn btn-warning text-white" data-bs-toggle="modal" data-bs-target="#addProductModal" style="">
          <i class="bi bi-plus-lg me-1"></i> Add Product
        </button>
      </div>
      
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search products..." 
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-3">
              <select 
                class="form-select"
                [(ngModel)]="selectedCategory"
                (ngModelChange)="applyFilters()"
              >
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <select 
                class="form-select"
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()"
              >
                <option value="">All Status</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
            <div class="col-12 mt-2" *ngIf="searchTerm || selectedCategory || selectedStatus">
              <button class="btn btn-sm btn-outline-secondary" (click)="clearFilters()">
                <i class="bi bi-x-circle me-1"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="d-flex justify-content-between align-items-center px-3 pt-3" *ngIf="products.length > 0">
            <div class="text-muted small">
              Showing {{ filteredProducts.length }} of {{ products.length }} products
            </div>
            <div class="d-flex align-items-center" *ngIf="searchTerm || selectedCategory || selectedStatus">
              <span class="badge bg-info me-2">Filtered</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;"><input type="checkbox" class="form-check-input"></th>
                  <th scope="col" style="width: 70px;">Image</th>
                  <th scope="col">Product Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Status</th>
                  <th scope="col" style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts.slice((currentPage-1) * pageSize, currentPage * pageSize)">
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td><img [src]="product.image || 'https://via.placeholder.com/50'" class="rounded" alt="Product" style="width: 50px; height: 50px; object-fit: cover;"></td>
                  <td>{{ product.title }}</td>
                  <td>{{ product.category }}</td>
                  <td>{{ product.price | currency }}</td>
                  <td>{{ product.stock }}</td>
                  <td>
                    <span class="badge" 
                      [ngClass]="{
                        'bg-success': product.stock > 10,
                        'bg-warning': product.stock > 0 && product.stock <= 10,
                        'bg-danger': product.stock === 0
                      }">
                      {{ product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editProduct(product)">
                        Edit<i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(product.id)">
                        <i class="bi bi-trash"></i>
                     Delete </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredProducts.length === 0">
                  <td colspan="8" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <i class="bi bi-search mb-3" style="font-size: 2rem;"></i>
                      <h5 class="text-muted">No products found</h5>
                      <p class="text-muted">Try adjusting your search or filter criteria</p>
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
      <div>
      Showing {{ (currentPage - 1) * pageSize + 1 }} to 
      {{ Math.min(currentPage * pageSize, totalProducts) }} 
      of {{ totalProducts }} entries
      </div>
    <nav *ngIf="totalPages > 1">
      <ul class="pagination mb-0">
        <li class="page-item" [ngClass]="{ 'disabled': currentPage === 1 }">
          <a class="page-link page-link-warning" href="#" 
             (click)="$event.preventDefault(); changePage(currentPage - 1)" 
             aria-label="Previous">
            Previous
          </a>
        </li>
        <li class="page-item" *ngFor="let page of getPageNumbers()" 
            [ngClass]="{ 'active': currentPage === page }">
          <a class="page-link page-link-warning" href="#" 
             (click)="$event.preventDefault(); changePage(page)">
            {{ page }}
          </a>
        </li>
        <li class="page-item" [ngClass]="{ 'disabled': currentPage === totalPages }">
          <a class="page-link page-link-warning" href="#" 
             (click)="$event.preventDefault(); changePage(currentPage + 1)" 
             aria-label="Next">
            Next
           </a>
         </li>
       </ul>
      </nav>
    </div>
   </div>
  </div>
    
    <!-- Add Product Modal -->
    <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addProductModalLabel">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" (click)="resetForm()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="productForm">
              <div class="mb-3">
                <label for="title" class="form-label">Product Name</label>
                <input type="text" class="form-control" id="title" formControlName="title">
                <div class="invalid-feedback" *ngIf="productForm.get('title')?.invalid && productForm.get('title')?.touched">
                  Product name is required
                </div>
              </div>
              <div class="mb-3">
                <label for="price" class="form-label">Price ($)</label>
                <input type="number" class="form-control" id="price" formControlName="price" min="0" step="0.01">
                <div class="invalid-feedback" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                  Valid price is required
                </div>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="3" formControlName="description"></textarea>
                <div class="invalid-feedback" *ngIf="productForm.get('description')?.invalid && productForm.get('description')?.touched">
                  Description is required
                </div>
              </div>
              <div class="mb-3">
                <label for="category" class="form-label">Category</label>
                <select class="form-select" id="category" formControlName="category">
                  <option value="" disabled>Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home">Home & Garden</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                </select>
                <div class="invalid-feedback" *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched">
                  Category is required
                </div>
              </div>
              <div class="mb-3">
                <label for="image" class="form-label">Image URL</label>
                <input type="text" class="form-control" id="image" formControlName="image">
                <div class="invalid-feedback" *ngIf="productForm.get('image')?.invalid && productForm.get('image')?.touched">
                  Image URL is required
                </div>
                <div class="form-text">Enter a valid image URL</div>
              </div>
              <div class="mb-3">
                <label for="stock" class="form-label">Stock Quantity</label>
                <input type="number" class="form-control" id="stock" formControlName="stock" min="0" step="1">
                <div class="invalid-feedback" *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched">
                  Valid stock quantity is required
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" (click)="resetForm()">Cancel</button>
            <button type="button" class="btn btn-warning text-white" [disabled]="productForm.invalid" (click)="saveProduct()">
              {{ isEditMode ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Success Alert -->
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1050">
      <div class="toast fade" [ngClass]="{'show': showToast}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close" (click)="hideToast()"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  `,
  styles: `
  .page-link-warning {
  color: #ffc107; /* Bootstrap warning color */
  }

/* Hover effect */
.page-link-warning:hover {
  color: #fff;
  background-color: #ffc107;
  border-color: #ffc107;
}

/* Active page */
.page-item.active .page-link-warning {
  color: #fff;
  background-color: #ffc107;
  border-color: #ffc107;
}

/* Disabled */
.page-item.disabled .page-link-warning {
  color: #6c757d;
  background-color: transparent;
  border-color: #dee2e6;
}
`
})
export class AdminInventoryComponent implements OnInit {
  // Products array
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Search and filter
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  categories: string[] = [];
  
  // Form and UI state
  productForm: FormGroup;
  showToast = false;
  toastMessage = '';
  isEditMode = false;
  editingProductId: number | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 1;
  
  // For template usage
  Math = Math;
  
  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.filteredProducts = [...products]; // Initialize filteredProducts with all products
      this.totalProducts = products.length;
      this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
      
      // Extract unique categories from products
      const uniqueCategories = new Set<string>();
      products.forEach(product => {
        if (product.category) {
          uniqueCategories.add(product.category);
        }
      });
      this.categories = Array.from(uniqueCategories).sort();
    });
  }
  
  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    const productData = this.productForm.value as Product;
    
    if (this.isEditMode && this.editingProductId) {
      // Update existing product
      this.productService.updateProduct(this.editingProductId, productData).subscribe({
        next: () => {
          // Find and update the product in the array
          const index = this.products.findIndex(p => p.id === this.editingProductId);
          if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
          }
          this.applyFilters(); // Re-apply filters to update filteredProducts
          
          this.resetForm();
          this.closeModal();
          
          // Show success toast
          this.showSuccessToast('Product updated successfully');
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.showSuccessToast('Error updating product');
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(productData).subscribe({
        next: (product) => {
          this.products.unshift(product);
          this.applyFilters(); // Re-apply filters to update filteredProducts
          
          this.resetForm();
          this.closeModal();
          
          // Show success toast
          this.showSuccessToast('Product added successfully');
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.showSuccessToast('Error adding product');
        }
      });
    }
  }
  
  editProduct(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.id || null;
    
    // Populate form with product data
    this.productForm.patchValue({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      stock: product.stock
    });
    
    // Open the modal
    const modal = document.getElementById('addProductModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }
  
  deleteProduct(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.applyFilters(); // Re-apply filters to update filteredProducts
          this.showSuccessToast('Product deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.showSuccessToast('Error deleting product');
        }
      });
    }
  }
  
  // Pagination methods
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (this.currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // Near the end
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }
  
  // Toast methods
  showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }
  
  hideToast(): void {
    this.showToast = false;
  }
  
  // Filter methods
  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filter by search term
      const matchesSearch = this.searchTerm ? 
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        product.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchTerm.toLowerCase()) :
        true;
        
      // Filter by category
      const matchesCategory = this.selectedCategory ? 
        product.category === this.selectedCategory : 
        true;
        
      // Filter by status
      let matchesStatus = true;
      if (this.selectedStatus) {
        switch(this.selectedStatus) {
          case 'inStock':
            matchesStatus = product.stock > 10;
            break;
          case 'lowStock':
            matchesStatus = product.stock > 0 && product.stock <= 10;
            break;
          case 'outOfStock':
            matchesStatus = product.stock === 0;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Update pagination
    this.totalProducts = this.filteredProducts.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filteredProducts = [...this.products];
    this.totalProducts = this.products.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    this.currentPage = 1;
  }
  
  resetForm(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset({ price: 0, stock: 0 });
  }
  
  closeModal(): void {
    const closeButton = document.getElementById('addProductModal')?.querySelector('.btn-close') as HTMLElement;
    closeButton?.click();
  }
}