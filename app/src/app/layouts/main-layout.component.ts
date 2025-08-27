
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationComponent } from '../location/location';
import { AuthService } from '../auth/services/auth.service';
import { CartStateService } from '../services/cart-state.service';
import { ToastNotificationComponent } from '../components/toast-notification/toast-notification.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, LocationComponent, ToastNotificationComponent],
  template: `
    <!-- home.html - Angular v20 + Bootstrap 5 E-commerce Page -->
    <div class="ecommerce-page d-flex flex-column min-vh-100">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-light bg-black sticky-top shadow-sm" role="navigation" aria-label="Main navigation">
        <div class="container-fluid px-3">
          
          <!-- Brand Logo -->
          <a class="navbar-brand fw-bold text-light fs-3 me-4" routerLink="/home" aria-label="EShop Home">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="me-2" aria-hidden="true">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V17C19 18.1 18.1 19 17 19H7C5.9 19 5 18.1 5 17V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V17H17V6H7Z"/>
            </svg>
            E-SHOP
          </a>
          <app-location></app-location>

          <!-- Mobile Toggle Button -->
          <button 
            class="navbar-toggler border-0 shadow-none" 
            type="button" 
            style='background:Orange;'
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent" 
            aria-controls="navbarContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation menu">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Navbar Content -->
          <div class="collapse navbar-collapse" id="navbarContent">
            
            <!-- Search Section -->
            <div class="flex-grow-1 mx-3 my-2 my-lg-0 ">
              <form class="search-bar d-flex position-relative" role="search" aria-label="Product search">
                <!-- Category Dropdown -->
                <div class="dropdown">
                  <button 
                    class="btn btn-outline-secondary dropdown-toggle rounded-end-0 border-end-0" 
                    type="button" 
                    id="categoryDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    aria-label="Select category"
                    style="color: white;">
                    All
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="categoryDropdown" style="hover: grey">
                    <li><a class="dropdown-item" href="#">All Categories</a></li>
                    <li><a class="dropdown-item" href="#">Electronics</a></li>
                    <li><a class="dropdown-item" href="#">Fashion</a></li>
                    <li><a class="dropdown-item" href="#">Home & Garden</a></li>
                    <li><a class="dropdown-item" href="#">Sports</a></li>
                  </ul>
                </div>

                <!-- Search Input -->
                <input 
                  class="form-control border-secondary rounded-start-0 rounded-end-0" 
                  type="search" 
                  placeholder="Search products..." 
                  aria-label="Search products"
                  name="searchTerm"
                  style="border-left: 1px solid orange; border-right: 1px solid orange;">

                <!-- Search Button -->
                <button 
                  class="btn btn-warning rounded-start-0 px-4" 
                  type="submit" 
                  aria-label="Submit search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
                   <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
                 </svg>
                </button>
              </form>
            </div>

            <!-- Account & Cart Links -->
            <ul class="navbar-nav ms-auto d-flex align-items-center">
              
              <!-- Account dropdown - changes based on auth status -->
              <li class="nav-item me-3 dropdown">
                <a class="nav-link text-light fw-medium position-relative dropdown-toggle" 
                   id="accountDropdown" 
                   role="button" 
                   data-bs-toggle="dropdown"
                   aria-expanded="false"
                   aria-label="Account options">
                  <i class="bi bi-person-circle me-1 fs-5" aria-hidden="true"></i>
                  <span class="d-none d-lg-inline">{{ authService.isAuthenticated() ? 'My Account' : 'Sign In' }}</span>
                  <span class="d-lg-none">Account</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                  <!-- Show these items when logged out -->
                  @if (!authService.isAuthenticated()) {
                    <li><a class="dropdown-item" routerLink="/auth/login">Sign In</a></li>
                    <li><a class="dropdown-item" routerLink="/auth/register">Register</a></li>
                  }
                  <!-- Show these items when logged in -->
                  @if (authService.isAuthenticated()) {
                    

                    @if(!authService.isAdmin()){
                     
                       <li> <a class="nav-link text-black fw-medium" routerLink="/orders" aria-label="My orders">
                              <i class="bi bi-list-ul fs-4" aria-hidden="true"></i>
                             <span class="ms-1 d-none d-lg-inline">Orders</span>
                          </a>
                       </li>
                       <li> 
                          <a class="nav-link text-black fw-medium position-relative" routerLink="/cart" aria-label="Shopping cart">
                             <i class="bi bi-cart3 fs-4" aria-hidden="true"></i>
                            <span *ngIf="cartItemCount > 0" 
                             class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate__animated animate__bounceIn" 
                             aria-hidden="true">
                             {{ cartItemCount }}
                           </span>
                           <span class="ms-1 d-none d-lg-inline">
</span>
                          </a>
                       </li>
                    }
                    <!-- Admin Dashboard link (only for admins) -->
                   <!-- Exit Store Link (only visible to admins) -->
                  
                    @if (authService.isAdmin()) {
                      <li class="dropdown-item">
                       <a class="nav-link text-BLACK fw-medium py-2 px-3" routerLink="/admin/dashboard" aria-label="Return to admin dashboard">
                            <i class="bi bi-speedometer2 me-1" aria-hidden="true"></i>Exit Store
                       </a>
                     </li>
                   }
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" (click)="authService.logout()">Sign Out</a></li>
                  }
                </ul>
              </li>

              <!-- Admin Dashboard Link (only visible to admins) -->
              @if (authService.isAdmin()) {
                <li class="nav-item me-3">
                  <a class="nav-link text-light fw-medium" routerLink="/admin/dashboard" aria-label="View admin dashboard">
                    <i class="bi bi-speedometer2 me-1 fs-5" aria-hidden="true"></i>
                    <span class="d-none d-lg-inline">Admin Dashboard</span>
                  </a>
                </li>
              }

              <!-- Orders -->
               <li class="nav-item">
                <a class="nav-link text-light fw-medium" routerLink="/orders" aria-label="My orders">
                  <i class="bi bi-list-ul fs-4" aria-hidden="true"></i>
                  <span class="ms-1 d-none d-lg-inline">Orders</span>
                </a>
              </li>

              <!-- Cart -->
              <li class="nav-item">
                <a class="nav-link text-light fw-medium position-relative" routerLink="/cart" aria-label="Shopping cart">
                  <i class="bi bi-cart3 fs-4" aria-hidden="true"></i>
                  <span *ngIf="cartItemCount > 0" 
                        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate__animated animate__bounceIn" 
                        aria-hidden="true">
                    {{ cartItemCount }}
                  </span>
                  <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
  <path d="M8 8H14L18 40H50L56 20H20" stroke="#FFC107" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="24" cy="52" r="4" fill="#FFC107"/>
  <circle cx="46" cy="52" r="4" fill="#FFC107"/>
</svg>
                </a>
              </li>
              
              <!-- Orders -->
             
            </ul>
          </div>
        </div>
      </nav>

      <!-- Secondary Navigation -->
      <nav class="bg-secondary py-2 d-none d-lg-block" role="navigation" aria-label="Category navigation">
        <div class="container-fluid px-3">
          <ul class="nav justify-content-start">
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">
                <i class="bi bi-house-door me-1" aria-hidden="true"></i>Home
              </a>
            </li>
            
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">
                <i class="bi bi-lightning-charge me-1" aria-hidden="true"></i>Today's Deals
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">Electronics</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">Fashion</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">Home & Garden</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">Books</a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white fw-medium py-2 px-3" href="#">Sports</a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="container-fluid px-3 py-4" role="main" style="background-color: #a4a5a5ff;">
        <router-outlet></router-outlet>
      </main>

      <!-- Toast Notifications -->
      <app-toast-notification></app-toast-notification>
      
      
      <!-- Footer -->
      <footer class="bg-dark text-light py-4 mt-auto">
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <h5>E-SHOP</h5>
              <p class="small">Your one-stop shop for all your needs.</p>
            </div>
            <div class="col-md-3">
              <h6>Quick Links</h6>
              <ul class="list-unstyled small">
                <li><a href="#" class="text-light text-decoration-none">About Us</a></li>
                <li><a href="#" class="text-light text-decoration-none">Contact</a></li>
                <li><a href="#" class="text-light text-decoration-none">FAQs</a></li>
              </ul>
            </div>
            <div class="col-md-3">
              <h6>Legal</h6>
              <ul class="list-unstyled small">
                <li><a href="#" class="text-light text-decoration-none">Terms of Service</a></li>
                <li><a href="#" class="text-light text-decoration-none">Privacy Policy</a></li>
                <li><a routerLink="/admin/register" class="text-muted text-decoration-none small">Admin Access</a></li>
              </ul>
            </div>
          </div>
          <hr class="my-3 bg-secondary">
          <div class="text-center small">
            <p class="mb-0">&copy; 2025 E-SHOP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  private subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private cartStateService: CartStateService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.cartStateService.cart$.subscribe(cartState => {
        this.cartItemCount = cartState.totalItems;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
