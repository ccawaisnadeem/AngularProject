import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { AdminService } from '../../services/admin.service';
import { AdminInvitationService } from '../../services/admin-invitation.service';

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
            value="120" 
            icon="box-seam" 
            color="primary"
            [link]="'/admin/inventory'"
          ></app-stat-card>
        </div>
        <div class="col-md-3">
          <app-stat-card 
            title="Total Orders" 
            value="48" 
            icon="cart-check" 
            color="success"
            [link]="'/admin/orders'"
          ></app-stat-card>
        </div>
        <div class="col-md-3">
          <app-stat-card 
            title="Users" 
            value="250" 
            icon="people" 
            color="info"
            [link]="'#'"
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
            class="btn btn-sm btn-outline-primary" 
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
                  class="btn btn-primary" 
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

          <!-- Admin Users List Placeholder -->
          <div>
            <h6>Current Admin Users</h6>
            <p class="text-muted">You can view and manage admin users here.</p>
            <!-- This would be replaced with an actual admin users table in a real app -->
            <div class="list-group">
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Super Admin</strong>
                  <div class="small text-muted">admin@example.com</div>
                </div>
                <span class="badge bg-success rounded-pill">Active</span>
              </div>
              <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>John Smith</strong>
                  <div class="small text-muted">john@example.com</div>
                </div>
                <span class="badge bg-success rounded-pill">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Orders</h5>
              <a routerLink="/admin/orders" class="btn btn-sm btn-primary">View All</a>
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
                <a routerLink="/admin/inventory" class="btn btn-sm btn-primary">Manage Inventory</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  // Admin invitation properties
  adminEmail: string = '';
  invitationLink: string = '';
  invitationExpiry: Date | null = null;
  isGeneratingLink: boolean = false;
  invitationError: string = '';
  showInvitation: boolean = false;

  constructor(private adminInvitationService: AdminInvitationService) {}
  
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
