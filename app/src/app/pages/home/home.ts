import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../pages/product-list/product-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  scrollToProducts(): void {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}
