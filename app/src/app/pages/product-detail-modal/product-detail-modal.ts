// product-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product';
import { CartStateService } from '../../services/cart-state.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail-modal.html',
  styleUrls: ['./product-detail-modal.scss']
})
export class ProductDetailModalComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  quantity: number = 1;
  selectedImageIndex: number = 0;
  isImageZoomed: boolean = false;
  addingToCart: boolean = false;
  
  // Mock additional images for demo - in real app, these would come from product data
  productImages: string[] = [];

  constructor(
    private cartStateService: CartStateService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.product) {
      // Initialize with main product image and add some mock additional images
      this.productImages = [
        this.product.image,
        // Add more images if available in your product model
        // For now, we'll just use the main image
      ];
    }
  }

  closeModal(): void {
    this.close.emit();
    this.resetModal();
  }

  private resetModal(): void {
    this.quantity = 1;
    this.selectedImageIndex = 0;
    this.isImageZoomed = false;
    this.addingToCart = false;
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
          // Optionally close modal after adding to cart
          // this.closeModal();
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
    // Navigate to cart or checkout after a brief delay
    setTimeout(() => {
      this.router.navigate(['/cart']);
      this.closeModal();
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
    this.closeModal();
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
