import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product';
import { CommonModule } from '@angular/common';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
 
@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
  imports: [CommonModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  addingToCart: { [productId: number]: boolean } = {};
 
  constructor(
    private productService: ProductService,
    private cartStateService: CartStateService,
    private notificationService: NotificationService
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
}
 