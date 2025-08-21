import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../../auth/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-users">
      
      
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search users..." 
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-3">
              <select 
                class="form-select"
                [(ngModel)]="selectedRole"
                (ngModelChange)="applyFilters()"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            <div class="col-md-3">
              <button 
                *ngIf="searchTerm || selectedRole" 
                class="btn btn-outline-secondary w-100"
                (click)="clearFilters()"
              >
                <i class="bi bi-x-circle me-1"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Users table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 50px;"><input type="checkbox" class="form-check-input"></th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                  <th scope="col">Status</th>
                  <th scope="col" style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers.slice((currentPage-1) * pageSize, currentPage * pageSize)">
                  <td><input type="checkbox" class="form-check-input"></td>
                  <td>{{ user.fullName || user.name || 'N/A' }}</td>
                  <td>{{ user.email }}</td>
                  <td><span class="badge" [ngClass]="user.role === 'Admin' ? 'bg-danger' : 'bg-primary'">{{ user.role }}</span></td>
                  <td>{{ user.createdAt | date }}</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editUser(user)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredUsers.length === 0">
                  <td colspan="7" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <i class="bi bi-search mb-3" style="font-size: 2rem;"></i>
                      <h5 class="text-muted">No users found</h5>
                      <p class="text-muted">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              Showing {{ filteredUsers.length ? (currentPage - 1) * pageSize + 1 : 0 }} to 
              {{ Math.min(currentPage * pageSize, totalUsers) }} of {{ totalUsers }} entries
              <span class="badge bg-info ms-2" *ngIf="searchTerm || selectedRole">Filtered</span>
            </div>
            <nav *ngIf="totalPages > 1">
              <ul class="pagination mb-0">
                <li class="page-item" [ngClass]="{ 'disabled': currentPage === 1 }">
                  <a class="page-link" href="#" (click)="$event.preventDefault(); changePage(currentPage - 1)">
                    Previous
                  </a>
                </li>
                <li class="page-item" *ngFor="let page of getPageNumbers()" [ngClass]="{ 'active': currentPage === page }">
                  <a class="page-link" href="#" (click)="$event.preventDefault(); changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" [ngClass]="{ 'disabled': currentPage === totalPages }">
                  <a class="page-link" href="#" (click)="$event.preventDefault(); changePage(currentPage + 1)">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Search and filter
  searchTerm: string = '';
  selectedRole: string = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  totalPages = 1;
  Math = Math;
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.adminService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = [...users]; // Initialize filteredUsers with all users
      this.totalUsers = users.length;
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    });
  }
  
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filter by search term (name or email)
      const matchesSearch = this.searchTerm ? 
        (user.fullName || user.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) : 
        true;
        
      // Filter by role
      const matchesRole = this.selectedRole ? 
        user.role === this.selectedRole : 
        true;
        
      return matchesSearch && matchesRole;
    });
    
    // Update pagination
    this.totalUsers = this.filteredUsers.length;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.filteredUsers = [...this.users];
    this.totalUsers = this.users.length;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    this.currentPage = 1;
  }
  
  editUser(user: User): void {
    // To be implemented
    console.log('Edit user:', user);
  }
  
  deleteUser(id: string | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.totalUsers--;
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }
  
  // Pagination methods
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (this.currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // Near the end
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }
}
