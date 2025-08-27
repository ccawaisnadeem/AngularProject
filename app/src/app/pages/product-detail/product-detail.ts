// product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../services/product';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading: boolean = true;
  error: string | null = null;
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isImageZoomed: boolean = false;
  addingToCart: boolean = false;
  
  // Mock additional images for demo - in real app, these would come from product data
  productImages: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartStateService: CartStateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(parseInt(productId));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.productImages = [product.image]; // Add more images if available
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Failed to load product details';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.isImageZoomed = false;
  }

  toggleImageZoom(): void {
    this.isImageZoomed = !this.isImageZoomed;
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  updateQuantity(event: any): void {
    const value = parseInt(event.target.value);
    if (value >= 1 && this.product && value <= this.product.stock) {
      this.quantity = value;
    } else {
      this.quantity = 1;
    }
  }

  addToCart(): void {
    if (!this.product || this.addingToCart) return;

    this.addingToCart = true;
    
    this.cartStateService.addToCart(this.product, this.quantity).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.itemAddedToCart(`${this.product!.title} (${this.quantity})`);
        }
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.cartError('Failed to add item to cart');
        this.addingToCart = false;
      }
    });
  }

  buyNow(): void {
    if (!this.product) return;
    
    this.addToCart();
    // Navigate to cart after a brief delay
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 500);
  }

  isInCart(): boolean {
    return this.product ? this.cartStateService.isInCart(this.product.id!) : false;
  }

  getCartItemQuantity(): number {
    if (!this.product) return 0;
    const cartItem = this.cartStateService.getCartItem(this.product.id!);
    return cartItem ? cartItem.quantity : 0;
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  getStockStatus(): { text: string; class: string } {
    if (!this.product) return { text: 'Out of Stock', class: 'out-of-stock' };
    
    if (this.product.stock === 0) {
      return { text: 'Out of Stock', class: 'out-of-stock' };
    } else if (this.product.stock <= 5) {
      return { text: `Only ${this.product.stock} left in stock`, class: 'low-stock' };
    } else if (this.product.stock <= 10) {
      return { text: `${this.product.stock} in stock`, class: 'medium-stock' };
    } else {
      return { text: 'In Stock', class: 'in-stock' };
    }
  }

  formatPrice(price: number): { dollars: string; cents: string } {
    const dollars = Math.floor(price).toString();
    const cents = (price % 1).toFixed(2).substring(1);
    return { dollars, cents: cents === '.00' ? '.00' : cents };
  }
}