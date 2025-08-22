import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="admin-layout d-flex flex-column min-vh-100">
  <!-- Main Admin Navbar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-black sticky-top shadow-sm" role="navigation" aria-label="Admin navigation">
    <div class="container-fluid px-3">
      
      <!-- Admin Brand Logo -->
      <a class="navbar-brand fw-bold text-light fs-3 me-4" routerLink="/admin/dashboard" aria-label="Admin Dashboard Home">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="me-2" aria-hidden="true">
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H15.4C16,11 16.4,11.4 16.4,12V16C16.4,16.6 16,17 15.4,17H8.6C8,17 7.6,16.6 7.6,16V12C7.6,11.4 8,11 8.6,11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
        </svg>
        E-SHOP Admin
      </a>

      <!-- Mobile Toggle Button -->
      <button 
        class="navbar-toggler border-0 shadow-none" 
        style="background-color: ;"
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#adminNavContent" 
        aria-controls="adminNavContent" 
        aria-expanded="false" 
        aria-label="Toggle admin navigation menu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Content -->
      <div class="collapse navbar-collapse" id="adminNavContent">
        
        <!-- Search Bar -->
        <div class="flex-grow-1 mx-3 my-2 my-lg-0">
          <form class="search-bar d-flex position-relative" role="search" aria-label="Admin search">
            <input 
              class="form-control border-secondary rounded-start text-light bg-dark" 
              type="search" 
              placeholder="Search orders, products, users..." 
              aria-label="Search admin content"
              style="border-right: 1px solid orange;">
            <button 
              class="btn btn-warning rounded-end px-4" 
              type="submit" 
              aria-label="Submit admin search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
               <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
             </svg>
            </button>
          </form>
        </div>

        <!-- Right Side Links -->
        <ul class="navbar-nav ms-auto d-flex align-items-center">
          <!-- Back to Store -->
          <li class="nav-item me-3">
            <a class="nav-link text-light fw-medium" routerLink="/home" aria-label="Back to Store">
              <i class="bi bi-shop me-1 fs-5"></i>
              <span class="d-none d-lg-inline">View Store</span>
              <span class="d-lg-none">View Store</span>
            </a>
          </li>

          <!-- Account Dropdown -->
          <li class="nav-item me-3 dropdown">
            <a class="nav-link text-light fw-medium position-relative dropdown-toggle" 
               id="adminAccountDropdown" 
               role="button" 
               data-bs-toggle="dropdown"
               aria-expanded="false">
              <i class="bi bi-person-circle me-1 fs-5"></i>
              <span class="d-none d-lg-inline">{{ user?.name || user?.email || 'Admin' }}</span>
              <span class="d-lg-none">Account</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" routerLink="/admin/profile">My Profile</a></li>
              <li><a class="dropdown-item" routerLink="/home">View Store</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" (click)="authService.logout()">Sign Out</a></li>
            </ul>
          </li>

          <!-- Notifications -->
          <li class="nav-item">
            <a class="nav-link text-light fw-medium position-relative" href="#" aria-label="Notifications">
              <i class="bi bi-bell fs-4"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                
              </span>
              <span class="ms-1 d-none d-lg-inline">Alerts</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Secondary Navigation -->
  <nav class="bg-secondary py-2" role="navigation" aria-label="Admin category navigation">
    <div class="container-fluid px-3">

      <!-- Desktop Menu -->
      <ul class="nav justify-content-start d-none d-lg-flex">
        <li class="nav-item">
          <a class="nav-link text-white fw-medium py-2 px-3" routerLink="/admin/dashboard" routerLinkActive="text-warning">
            <i class="bi bi-speedometer2 me-1"></i> Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white fw-medium py-2 px-3" routerLink="/admin/inventory" routerLinkActive="text-warning">
            <i class="bi bi-box-seam me-1"></i> Inventory
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white fw-medium py-2 px-3" routerLink="/admin/orders" routerLinkActive="text-warning">
            <i class="bi bi-cart-check me-1"></i> Orders
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white fw-medium py-2 px-3" routerLink="/admin/profile" routerLinkActive="text-warning">
            <i class="bi bi-person-circle me-1"></i> Profile
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white fw-medium py-2 px-3" routerLink="/admin/users" routerLinkActive="text-warning">
            <i class="bi bi-people me-1"></i> Users
          </a>
        </li>
      </ul>

      <!-- Mobile Collapsible Menu -->
      <div class="d-lg-none">
  <button class="btn btn-outline-light w-100 mb-2" type="button" 
          data-bs-toggle="collapse" data-bs-target="#adminMobileMenu"
          aria-expanded="false" aria-controls="adminMobileMenu">
    <i class="bi bi-list"></i> Menu
  </button>

  <div class="collapse" id="adminMobileMenu">
    <ul class="list-group">
      <li>
        <a class="list-group-item list-group-item-action bg-dark text-light border-secondary" 
           routerLink="/admin/dashboard" 
           routerLinkActive="active text-warning bg-dark"
           data-bs-toggle="collapse" data-bs-target="#adminMobileMenu">
          Dashboard
        </a>
      </li>
      <li>
        <a class="list-group-item list-group-item-action bg-dark text-light border-secondary" 
           routerLink="/admin/inventory" 
           routerLinkActive="active text-warning bg-dark"
           data-bs-toggle="collapse" data-bs-target="#adminMobileMenu">
          Inventory
        </a>
      </li>
      <li>
        <a class="list-group-item list-group-item-action bg-dark text-light border-secondary" 
           routerLink="/admin/orders" 
           routerLinkActive="active text-warning bg-dark"
           data-bs-toggle="collapse" data-bs-target="#adminMobileMenu">
          Orders
        </a>
      </li>
      <li>
        <a class="list-group-item list-group-item-action bg-dark text-light border-secondary" 
           routerLink="/admin/profile" 
           routerLinkActive="active text-warning bg-dark"
           data-bs-toggle="collapse" data-bs-target="#adminMobileMenu">
          Profile
        </a>
      </li>
      <li>
        <a class="list-group-item list-group-item-action bg-dark text-light border-secondary" 
           routerLink="/admin/users" 
           routerLinkActive="active text-warning bg-dark"
           data-bs-toggle="collapse" data-bs-target="#adminMobileMenu">
          Users
        </a>
      </li>
    </ul>
  </div>
</div>


    </div>
  </nav>

  <!-- Main Admin Content -->
  <main class="container-fluid px-3 py-4 flex-grow-1" role="main" style="background-color: #a4a5a5ff;">
    <router-outlet></router-outlet>
  </main>
</div>

  `,
  styles: [`
    .ul{
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-link.active,
    .nav-link.text-warning {
      color: #ffc107 !important;
    }

    .nav-link:hover {
      color: #ffc107 !important;
    }

    .search-bar input:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25);
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .badge {
      font-size: 0.75em;
    }

    /* Mobile responsiveness */
    @media (max-width: 991.98px) {
      .search-bar {
        margin-top: 0.75rem;
      }
    }

    @media (max-width: 575.98px) {
      .navbar-brand svg {
        width: 24px;
        height: 24px;
      }
      .navbar-brand span {
        font-size: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  user: User | null = null;

  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }
}
