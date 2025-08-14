import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Component properties
  searchTerm: string = '';
  selectedCategory: string = 'All';
  cartItemCount: number = 3;
  activeCategory: string = 'deals';

  featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality audio with noise cancellation',
      price: 79.99,
      image: 'https://via.placeholder.com/300x200/6c757d/ffffff?text=Headphones',
      rating: 4,
      reviewCount: 128
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      description: 'Track your health and fitness goals',
      price: 199.99,
      image: 'https://via.placeholder.com/300x200/0d6efd/ffffff?text=Smart+Watch',
      rating: 5,
      reviewCount: 89
    },
    {
      id: 3,
      name: 'Portable Power Bank',
      description: '20000mAh fast charging power bank',
      price: 29.99,
      image: 'https://via.placeholder.com/300x200/198754/ffffff?text=Power+Bank',
      rating: 4,
      reviewCount: 256
    },
    {
      id: 4,
      name: 'Ergonomic Office Chair',
      description: 'Comfortable chair for long work sessions',
      price: 249.99,
      image: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Office+Chair',
      rating: 5,
      reviewCount: 67
    }
  ];

  // Component methods
  toggleMobileMenu(): void {
    // Bootstrap handles the toggle automatically
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      console.log(`Searching for: ${this.searchTerm} in ${this.selectedCategory}`);
      // Implement search logic here
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    // Close dropdown after selection
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
    // Navigate to category page or filter products
  }

  addToCart(product: Product): void {
    this.cartItemCount++;
    console.log(`Added ${product.name} to cart`);
    // Implement add to cart logic here
  }

  scrollToProducts(): void {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  trackProduct(_index: number, product: Product): number {
    return product.id;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}