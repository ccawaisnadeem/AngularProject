import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6 text-center">
          
          <div class="mb-4">
            <i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>
          </div>
          
          <h1 class="text-danger mb-3">Payment Cancelled</h1>
          <p class="lead mb-4">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div class="alert alert-info" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            Your items are still in your cart and waiting for you.
          </div>

          <div class="d-grid gap-2 d-md-block mt-4">
            <a routerLink="/checkout" class="btn btn-warning">
              <i class="bi bi-arrow-left me-2"></i>Back to Checkout
            </a>
            <a routerLink="/cart" class="btn btn-outline-warning">
              <i class="bi bi-cart me-2"></i>Review Cart
            </a>
            <a routerLink="/home" class="btn btn-outline-secondary">
              <i class="bi bi-shop me-2"></i>Continue Shopping
            </a>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CheckoutCancelComponent {
}