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
    <div class="admin-layout d-flex">
      <!-- Sidebar -->
      <nav class="sidebar bg-dark text-light p-3" style="width: 250px; height: 100vh; position: fixed;">
        <div class="d-flex align-items-center mb-4 mt-2">
          <i class="bi bi-shield-lock-fill fs-4 me-2"></i>
          <h1 class="navbar-brand mb-0">Admin Dashboard</h1>
        </div>
        
        <div class="nav flex-column">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link text-light py-2">
            <i class="bi bi-speedometer2 me-2"></i> Dashboard
          </a>
          <a routerLink="/admin/inventory" routerLinkActive="active" class="nav-link text-light py-2">
            <i class="bi bi-box-seam me-2"></i> Inventory
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link text-light py-2">
            <i class="bi bi-cart-check me-2"></i> Orders
          </a>
          <a routerLink="/admin/profile" routerLinkActive="active" class="nav-link text-light py-2">
            <i class="bi bi-person-circle me-2"></i> Profile
          </a>
          <a routerLink="/home" class="nav-link text-light py-2">
            <i class="bi bi-shop me-2"></i> View Store
          </a>
          <a href="#" class="nav-link text-light py-2 mt-auto" (click)="authService.logout()">
            <i class="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </div>
      </nav>

      <!-- Main content -->
      <div class="content-area" style="margin-left: 250px; width: calc(100% - 250px); min-height: 100vh;">
        <!-- Top navbar -->
        <nav class="navbar bg-white shadow-sm">
          <div class="container-fluid">
            <div class="d-flex align-items-center">
              <span class="navbar-text">
                Welcome, {{ user?.name || user?.email || 'Admin' }}
              </span>
            </div>
            <div class="dropdown">
              <a class="dropdown-toggle text-dark text-decoration-none" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                {{ user?.name || user?.email || 'Admin' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" routerLink="/admin/profile">My Profile</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" (click)="authService.logout()">Sign Out</a></li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Page content -->
        <div class="container-fluid p-4 bg-light">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar .nav-link {
      border-radius: 5px;
      margin-bottom: 5px;
    }
    .sidebar .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .sidebar .nav-link.active {
      background-color: #0d6efd;
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
