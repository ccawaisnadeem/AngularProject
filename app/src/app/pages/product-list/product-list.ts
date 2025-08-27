// Updated product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { RouterLink, Router } from '@angular/router';
 
@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  imports: [CommonModule, RouterLink]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  addingToCart: { [productId: number]: boolean } = {};
 
  constructor(
    private productService: ProductService,
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
   
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        console.log('Products loaded:', this.products);
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error fetching products:', err);
      }
    });
  }

  retryLoading(): void {
    this.loadProducts();
  }

  // Navigate to product detail page
  openProductDetail(product: Product): void {
  if (product.id) {
    this.router.navigate(['/product', product.id]);
  }
}

  addToCart(product: Product): void {
    if (this.addingToCart[product.id!]) return;
    this.addingToCart[product.id!] = true;
   
    this.cartStateService.addToCart(product, 1).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.itemAddedToCart(product.title);
        }
        this.addingToCart[product.id!] = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.cartError('Failed to add item to cart');
        this.addingToCart[product.id!] = false;
      }
    });
  }

  isInCart(productId: number): boolean {
    return this.cartStateService.isInCart(productId);
  }

  getCartItemQuantity(productId: number): number {
    const cartItem = this.cartStateService.getCartItem(productId);
    return cartItem ? cartItem.quantity : 0;
  }

  removeFromCart(productId: number): void {
    this.cartStateService.removeItem(productId).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.itemRemovedFromCart('Item removed from cart');
        }
      },
      error: (error) => {
        console.error('Error removing item from cart:', error);
        this.notificationService.cartError('Failed to remove item from cart');
      }
    });
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }
}