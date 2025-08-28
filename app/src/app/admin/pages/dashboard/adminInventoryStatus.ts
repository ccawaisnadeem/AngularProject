import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductService } from '../../../services/product';


@Component({
  selector: 'app-admin-inventory-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template:`<div>
  <div class="card mb-4">
     <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Inventory Status</h5>
            <a routerLink="/admin/inventory" class="btn btn-sm btn-outline-warning text-black">Manage Inventory</a>
          </div>
    <div class="card-body">

      <!-- In Stock -->
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>In Stock</span>
          <span>{{ inStockPercent }}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-success" role="progressbar"
               [style.width.%]="inStockPercent">
          </div>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span>Low Stock</span>
          <span>{{ lowStockPercent }}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-warning" role="progressbar"
               [style.width.%]="lowStockPercent">
          </div>
        </div>
      </div>

      <!-- Out of Stock -->
      <div>
        <div class="d-flex justify-content-between mb-1">
          <span>Out of Stock</span>
          <span>{{ outOfStockPercent }}%</span>
        </div>
        <div class="progress">
          <div class="progress-bar bg-danger" role="progressbar"
               [style.width.%]="outOfStockPercent">
          </div>
        </div>
      </div>

     
    </div>
  </div>
</div>
`
})
export class AdminInventoryStatusComponent implements OnInit {

  inStockPercent = 0;
  lowStockPercent = 0;
  outOfStockPercent = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadInventoryStatus();
  }

  private loadInventoryStatus(): void {
    this.productService.getProducts().subscribe(products => {
      const total = products.length;

      if (total === 0) {
        this.inStockPercent = this.lowStockPercent = this.outOfStockPercent = 0;
        return;
      }

      const inStock = products.filter(p => p.stock > 10).length;
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStock = products.filter(p => p.stock === 0).length;

      this.inStockPercent = Math.round((inStock / total) * 100);
      this.lowStockPercent = Math.round((lowStock / total) * 100);
      this.outOfStockPercent = Math.round((outOfStock / total) * 100);
    });
  }
}
