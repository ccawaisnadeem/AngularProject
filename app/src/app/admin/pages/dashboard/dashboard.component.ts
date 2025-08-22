import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { AdminService } from '../../services/admin.service';
import { AdminInvitationService } from '../../services/admin-invitation.service';
import { ProductService } from '../../../services/product';
import { AdminRecentOrdersComponent } from './AdminRecentOrdersComponent';
import { AdminInventoryStatusComponent } from './adminInventoryStatus';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatCardComponent, AdminRecentOrdersComponent, AdminInventoryStatusComponent],
  template: `
    <div class="dashboard container-fluid">
  <h2 class="mb-4 text-center text-md-start">Admin Dashboard</h2>

  <!-- Stats Row -->
  <div class="row mb-4 g-3">
    <div class="col-12 col-sm-6 col-lg-3">
      <app-stat-card 
        title="Total Products" 
        [value]="productCount.toString()" 
        icon="box-seam" 
        color="primary"
        [link]="'/admin/inventory'">
      </app-stat-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <app-stat-card 
        title="Total Orders" 
        [value]="orderCount.toString()" 
        icon="cart-check" 
        color="success"
        [link]="'/admin/orders'">
      </app-stat-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <app-stat-card 
        title="Users" 
        [value]="userCount.toString()" 
        icon="people" 
        color="info"
        [link]="'/admin/users'">
      </app-stat-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <app-stat-card 
        title="Revenue" 
        [value]="TotalRevenue.toString()" 
        icon="currency-dollar" 
        color="warning"
        [link]="'#'">
      </app-stat-card>
    </div>
  </div>

  <!-- Admin Invitation Section -->
  <div class="card mb-4">
    <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center">
      <h5 class="mb-2 mb-md-0">Admin User Management</h5>
      <button 
        class="btn btn-sm text-black btn-outline-warning"
        [ngStyle]="{ color: isHovered ? 'white' : 'black' }"
        (mouseenter)="isHovered = true"
        (mouseleave)="isHovered = false"
        (click)="showInvitation = !showInvitation">
        <i class="bi bi-plus-circle me-1"></i> Invite New Admin
      </button>
    </div>
    <div class="card-body">
      <!-- Invite Admin Form -->
      <div *ngIf="showInvitation" class="mb-4">
        <h6 class="mb-3">Generate Admin Invitation Link</h6>
        <div *ngIf="!invitationLink" class="row g-2 align-items-center">
          <div class="col-12 col-md-6">
            <input 
              type="email" 
              class="form-control" 
              placeholder="Enter admin's email address" 
              [(ngModel)]="adminEmail"
              [disabled]="isGeneratingLink">
            <div *ngIf="invitationError" class="text-danger small mt-1">
              {{ invitationError }}
            </div>
          </div>
          <div class="col-12 col-md-auto">
            <button 
              class="btn btn-warning w-100 w-md-auto" 
              (click)="generateInvitationLink()" 
              [disabled]="isGeneratingLink">
              <span *ngIf="isGeneratingLink" class="spinner-border spinner-border-sm me-1"></span>
              Generate Link
            </button>
          </div>
        </div>

        <!-- Invitation Link Result -->
        <div *ngIf="invitationLink" class="mt-3">
          <div class="alert alert-success">
            <p class="mb-2"><strong>Invitation link generated!</strong></p>
            <div class="input-group mb-2">
              <input type="text" class="form-control" [value]="invitationLink" readonly>
              <button class="btn btn-outline-secondary" type="button" (click)="copyInvitationLink()" id="copyBtn">
                <i class="bi bi-clipboard me-1"></i> Copy
              </button>
            </div>
            <p class="small text-muted mb-0" *ngIf="invitationExpiry">
              This link will expire on {{ invitationExpiry | date:'medium' }}
            </p>
          </div>
          <button class="btn btn-sm btn-outline-secondary" (click)="resetInvitation()">Generate Another Link</button>
        </div>
      </div>

      <!-- Admin Users List -->
      <div>
        <h6>Current Admin Users</h6>
        <p class="text-muted">You can view and manage admin users here.</p>
        <div class="list-group">
          <div *ngIf="adminUsers.length === 0" class="text-center py-3">
            <div class="spinner-border text-primary" role="status" *ngIf="!adminUsers">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p *ngIf="adminUsers.length === 0" class="mb-0 text-muted">No admin users found</p>
          </div>
          <div *ngFor="let admin of adminUsers" class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
            <div class="me-2">
              <strong>{{ admin.fullName || admin.name || 'Admin User' }}</strong>
              <div class="small text-muted">{{ admin.email }}</div>
            </div>
            <span class="badge bg-success rounded-pill mt-2 mt-md-0">Active</span>
          </div>
        </div>
        <div class="mt-3 text-end">
          <a routerLink="/admin/users" class="btn btn-sm btn-outline-warning text-black">Manage All Users</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Orders + Inventory -->
  <div class="row g-3">
    <div class="col-12 col-lg-8">
      <app-admin-recent-orders></app-admin-recent-orders>
    </div>
    <div class="col-12 col-lg-4">
      <app-admin-inventory-status></app-admin-inventory-status>
    </div>
  </div>

  <!-- Footer -->
  <footer class="bg-dark text-light py-4 mt-4 mt-auto">
    <div class="container">
      <div class="row gy-3">
        <div class="col-12 col-md-6">
          <h5>E-SHOP</h5>
          <p class="small">Your one-stop shop for all your needs.</p>
        </div>
        <div class="col-6 col-md-3">
          <h6>Quick Links</h6>
          <ul class="list-unstyled small">
            <li><a href="#" class="text-light text-decoration-none">About Us</a></li>
            <li><a href="#" class="text-light text-decoration-none">Contact</a></li>
            <li><a href="#" class="text-light text-decoration-none">FAQs</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-3">
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

  `
})
export class DashboardComponent implements OnInit {
  // Dashboard stats
  productCount: number = 0;
  userCount: number = 0;
  orderCount: number = 0;
  TotalRevenue: number = 0;

  // Admin users list
  adminUsers: any[] = [];
  
  // Admin invitation properties
  adminEmail: string = '';
  invitationLink: string = '';
  invitationExpiry: Date | null = null;
  isGeneratingLink: boolean = false;
  invitationError: string = '';
  showInvitation: boolean = false;
  isHovered = false;

  constructor(
    private adminInvitationService: AdminInvitationService,
    private adminService: AdminService,
    private productService: ProductService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    // Get product count
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.productCount = products.length;
        console.log('Product count:', this.productCount);
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
    
    // Get orders data
   this.adminService.getOrders().subscribe({
    next: (orders) => {
       // Total orders (all)
      this.orderCount = orders.length;

      // Total revenue (only confirmed + paid orders)
      this.TotalRevenue = orders
        .filter((o: any) => o.status === 'confirmed' && o.paymentStatus === 'paid')
        .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
 
        console.log('Total Orders:', this.orderCount, 'Total Revenue:', this.TotalRevenue);
      },
      error: (err) => {
      console.error('Error fetching orders:', err);
      }
   });

    // Get user count
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.userCount = users.length;
        console.log('User count:', this.userCount);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
    
    // Get admin users
    this.adminService.getAdminUsers().subscribe({
      next: (admins) => {
        this.adminUsers = admins;
        console.log('Admin users:', this.adminUsers);
      },
      error: (err) => {
        console.error('Error fetching admin users:', err);
      }
    });
  }

    
  
  /**
   * Generates an admin invitation link
   */
  generateInvitationLink(): void {
    if (!this.adminEmail || !this.isValidEmail(this.adminEmail)) {
      this.invitationError = 'Please enter a valid email address';
      return;
    }
    
    this.isGeneratingLink = true;
    this.invitationError = '';
    
    this.adminInvitationService.generateInvitationLink(this.adminEmail)
      .subscribe({
        next: (response) => {
          this.invitationLink = response.link;
          this.invitationExpiry = response.expires;
          this.isGeneratingLink = false;
          this.showInvitation = true;
        },
        error: (error) => {
          console.error('Error generating invitation link:', error);
          this.invitationError = 'Failed to generate invitation link. Please try again.';
          this.isGeneratingLink = false;
        }
      });
  }
  
  /**
   * Copy the invitation link to clipboard
   */
  copyInvitationLink(): void {
    navigator.clipboard.writeText(this.invitationLink)
      .then(() => {
        // Show a temporary "Copied!" message
        const originalText = document.getElementById('copyBtn')?.textContent;
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            if (copyBtn && originalText) copyBtn.textContent = originalText;
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
  
  /**
   * Reset the invitation form
   */
  resetInvitation(): void {
    this.adminEmail = '';
    this.invitationLink = '';
    this.invitationExpiry = null;
    this.showInvitation = false;
    this.invitationError = '';
  }
  
  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
}
