
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { DebugComponent } from './debug.component';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount:  number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DebugComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  searchTerm: string = '';
  selectedCategory: string = 'All Categories';
  activeCategory: string = '';
  cartItemCount: number = 0;
  
  constructor() {}

 
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