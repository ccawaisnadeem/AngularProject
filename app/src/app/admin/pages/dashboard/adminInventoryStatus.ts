import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductService } from '../../../services/product';


@Component({
  selector: 'app-admin-inventory-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './adminInventoryStatus.html'
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
