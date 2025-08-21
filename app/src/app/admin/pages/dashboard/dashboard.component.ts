import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { AdminService } from '../../services/admin.service';
import { AdminInvitationService } from '../../services/admin-invitation.service';
import { ProductService } from '../../../services/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatCardComponent],
  template: `
    <div class="dashboard">
      <h2 class="mb-4">Admin Dashboard</h2>

      <div class="row mb-4">
        <div class="col-md-3">
          <app-stat-card 
            title="Total Products" 
            [value]="productCount.toString()" 
            icon="box-seam" 
            color="primary"
            [link]="'/admin/inventory'"
          ></app-stat-card>
        </div>
        <div class="col-md-3">
          <app-stat-card 
            title="Total Orders" 
            [value]="orderCount.toString()" 
            icon="cart-check" 
            color="success"
            [link]="'/admin/orders'"
          ></app-stat-card>
        </div>
        <div class="col-md-3">
          <app-stat-card 
            title="Users" 
            [value]="userCount.toString()" 
            icon="people" 
            color="info"
            [link]="'/admin/users'"
          ></app-stat-card>
        </div>
        <div class="col-md-3">
          <app-stat-card 
            title="Revenue" 
            value="$5,230" 
            icon="currency-dollar" 
            color="warning"
            [link]="'#'"
          ></app-stat-card>
        </div>
      </div>

      <!-- Admin Invitation Section -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Admin User Management</h5>
          <button 
             class="btn btn-sm text-black btn-outline-warning"
             [ngStyle]="{ color: isHovered ? 'white' : 'black' }"
             (mouseenter)="isHovered = true"
             (mouseleave)="isHovered = false"
             (click)="showInvitation = !showInvitation"
             >
              <i class="bi bi-plus-circle me-1"></i> Invite New Admin
         </button>
        </div>
        <div class="card-body">
          <!-- Invite Admin Form -->
          <div *ngIf="showInvitation" class="mb-4">
            <h6 class="mb-3">Generate Admin Invitation Link</h6>
            
            <div *ngIf="!invitationLink" class="row g-2 align-items-center">
              <div class="col-md-6">
                <input 
                  type="email" 
                  class="form-control" 
                  placeholder="Enter admin's email address" 
                  [(ngModel)]="adminEmail"
                  [disabled]="isGeneratingLink"
                >
                <div *ngIf="invitationError" class="text-danger small mt-1">
                  {{ invitationError }}
                </div>
              </div>
              <div class="col">
                <button 
                  class="btn btn-warning" 
                  (click)="generateInvitationLink()" 
                  [disabled]="isGeneratingLink"
                >
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
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    (click)="copyInvitationLink()"
                    id="copyBtn"
                  >
                    <i class="bi bi-clipboard me-1"></i> Copy
                  </button>
                </div>
                <p class="small text-muted mb-0" *ngIf="invitationExpiry">
                  This link will expire on {{ invitationExpiry | date:'medium' }}
                </p>
              </div>
              <button class="btn btn-sm btn-outline-secondary" (click)="resetInvitation()">
                Generate Another Link
              </button>
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
              <div *ngFor="let admin of adminUsers" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ admin.fullName || admin.name || 'Admin User' }}</strong>
                  <div class="small text-muted">{{ admin.email }}</div>
                </div>
                <span class="badge bg-success rounded-pill">Active</span>
              </div>
            </div>
            <div class="mt-3 text-end">
              <a routerLink="/admin/users" class="btn btn-sm btn-outline-warning text-black">Manage All Users</a>

            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Orders</h5>
              <a routerLink="/admin/orders" class="btn btn-sm btn-outline-warning text-black">View All</a>
            </div>
            <div class="card-body">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#ORD-001</td>
                    <td>John Doe</td>
                    <td>2023-09-10</td>
                    <td><span class="badge bg-success">Delivered</span></td>
                    <td>$120.00</td>
                  </tr>
                  <tr>
                    <td>#ORD-002</td>
                    <td>Jane Smith</td>
                    <td>2023-09-09</td>
                    <td><span class="badge bg-warning">Processing</span></td>
                    <td>$85.50</td>
                  </tr>
                  <tr>
                    <td>#ORD-003</td>
                    <td>Robert Johnson</td>
                    <td>2023-09-08</td>
                    <td><span class="badge bg-info">Shipped</span></td>
                    <td>$210.75</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Inventory Status</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span>In Stock</span>
                  <span>85%</span>
                </div>
                <div class="progress">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 85%" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span>Low Stock</span>
                  <span>10%</span>
                </div>
                <div class="progress">
                  <div class="progress-bar bg-warning" role="progressbar" style="width: 10%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
              <div>
                <div class="d-flex justify-content-between mb-1">
                  <span>Out of Stock</span>
                  <span>5%</span>
                </div>
                <div class="progress">
                  <div class="progress-bar bg-danger" role="progressbar" style="width: 5%" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
              <div class="mt-3">
                <a routerLink="/admin/inventory" class="btn btn-sm btn-outline-warning text-black">Manage Inventory</a>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  `
})
export class DashboardComponent implements OnInit {
  // Dashboard stats
  productCount: number = 0;
  userCount: number = 0;
  orderCount: number = 48;
  revenue: number = 5230;
  
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
