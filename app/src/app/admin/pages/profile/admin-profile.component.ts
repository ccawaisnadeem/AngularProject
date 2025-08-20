import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-profile">
      <h2 class="mb-4">Admin Profile</h2>
      
      <div class="row">
        <!-- Profile Info -->
        <div class="col-lg-4 mb-4 mb-lg-0">
          <div class="card">
            <div class="card-body text-center">
              <div class="avatar-circle mb-3 mx-auto">
                <i class="bi bi-person-circle display-1"></i>
              </div>
              <h5 class="card-title">{{ user?.name }}</h5>
              <p class="card-text text-muted">{{ user?.email }}</p>
              <div class="badge bg-primary mb-3">{{ user?.role === 'Admin' ? 'Admin' : 'User' }}</div>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary">Change Avatar</button>
                <button class="btn btn-outline-danger">Reset Password</button>
              </div>
            </div>
          </div>
          
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Account Details</h5>
              <div class="mb-2">
                <small class="text-muted">Account Created</small>
                <p>September 1, 2023</p>
              </div>
              <div class="mb-2">
                <small class="text-muted">Last Login</small>
                <p>Today at 9:30 AM</p>
              </div>
              <div>
                <small class="text-muted">Role</small>
                <p class="mb-0">Administrator</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Edit Profile Form -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">Edit Profile</h5>
              
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="row g-3">
                  <!-- Full Name -->
                  <div class="col-md-6">
                    <label for="name" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="name" formControlName="name">
                    <div *ngIf="submitted && f['name'].errors" class="text-danger mt-1 small">
                      <div *ngIf="f['name'].errors['required']">Full name is required</div>
                    </div>
                  </div>
                  
                  <!-- Email -->
                  <div class="col-md-6">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" formControlName="email">
                    <div *ngIf="submitted && f['email'].errors" class="text-danger mt-1 small">
                      <div *ngIf="f['email'].errors['required']">Email is required</div>
                      <div *ngIf="f['email'].errors['email']">Please enter a valid email</div>
                    </div>
                  </div>
                  
                  <!-- Phone -->
                  <div class="col-md-6">
                    <label for="phone" class="form-label">Phone</label>
                    <input type="tel" class="form-control" id="phone" formControlName="phone">
                  </div>
                  
                  <!-- Position -->
                  <div class="col-md-6">
                    <label for="position" class="form-label">Position</label>
                    <input type="text" class="form-control" id="position" formControlName="position">
                  </div>
                  
                  <!-- Bio -->
                  <div class="col-12">
                    <label for="bio" class="form-label">Bio</label>
                    <textarea class="form-control" id="bio" rows="4" formControlName="bio"></textarea>
                  </div>
                  
                  <div class="col-12">
                    <hr class="my-4">
                    <h6 class="mb-3">Security Settings</h6>
                  </div>
                  
                  <!-- Current Password -->
                  <div class="col-md-6">
                    <label for="currentPassword" class="form-label">Current Password</label>
                    <input type="password" class="form-control" id="currentPassword" formControlName="currentPassword">
                  </div>
                  
                  <!-- New Password -->
                  <div class="col-md-6">
                    <label for="newPassword" class="form-label">New Password</label>
                    <input type="password" class="form-control" id="newPassword" formControlName="newPassword">
                    <div *ngIf="submitted && f['newPassword'].errors" class="text-danger mt-1 small">
                      <div *ngIf="f['newPassword'].errors['minlength']">Password must be at least 6 characters</div>
                    </div>
                  </div>
                  
                  <!-- 2FA -->
                  <div class="col-12">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="enable2FA" formControlName="enable2FA">
                      <label class="form-check-label" for="enable2FA">Enable Two-Factor Authentication</label>
                    </div>
                  </div>
                  
                  <!-- Submit Buttons -->
                  <div class="col-12 mt-4">
                    <button type="submit" class="btn btn-primary me-2" [disabled]="loading">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                      Save Changes
                    </button>
                    <button type="button" class="btn btn-outline-secondary">Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle {
      width: 100px;
      height: 100px;
      background-color: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
    }
  `]
})
export class AdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  submitted = false;
  loading = false;
  user?: User;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      position: ['Administrator'],
      bio: [''],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      enable2FA: [false]
    });
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.user = user; // Only assign when user is not null
        this.profileForm.patchValue({
          name: user.name, // Using name from the user model directly
          email: user.email,
          position: user.role || 'Administrator'
          // Add other fields as needed
        });
      }
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.profileForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Create an updated user object
    const updatedUser: Partial<User> = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      // Include other properties as needed
      role: 'Admin' // Ensure the role remains admin (proper case for backend)
    };
    
    // Handle password update
    const newPassword = this.profileForm.value.newPassword;
    const currentPassword = this.profileForm.value.currentPassword;
    
    // First update user profile
    this.http.put<User>(`${environment.apiUrl}/users/${this.user?.id}`, updatedUser)
      .subscribe({
        next: (updatedUserData) => {
          // Update password if provided
          if (newPassword && currentPassword) {
            this.http.post(`${environment.apiUrl}/auth/change-password`, {
              userId: this.user?.id,
              currentPassword,
              newPassword
            }).subscribe({
              next: () => {
                console.log('Password updated successfully');
                this.completeUpdate(updatedUserData);
              },
              error: (err) => {
                console.error('Password update failed', err);
                this.loading = false;
                // Show password-specific error but still update the profile
                alert('Profile updated but password change failed: ' + 
                  (err.error?.message || 'Please check your current password'));
                this.completeUpdate(updatedUserData);
              }
            });
          } else {
            // No password change requested, just complete the profile update
            this.completeUpdate(updatedUserData);
          }
        },
        error: (error) => {
          console.error('Profile update failed', error);
          this.loading = false;
          alert('Failed to update profile: ' + 
            (error.error?.message || 'Please try again later'));
        }
      });
  }
  
  // Helper method to complete the profile update process
  private completeUpdate(updatedUserData: User): void {
    if (this.user) {
      // Update local user data
      this.user = updatedUserData;
      
      // Update the user data via the auth service
      this.authService.updateCurrentUser(updatedUserData);
    }
    
    this.loading = false;
    alert('Profile updated successfully');
  }
}
