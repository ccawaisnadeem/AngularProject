import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.service';
import { User } from '../../../../auth/models/user.model';
import { AdminSetupService } from '../../../services/admin-setup.service';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold">Initial Admin Setup</h1>
        <p class="text-muted">Create the first administrator account for your application</p>
      </div>
      
      <div class="card shadow-sm" style="max-width: 450px; width: 100%">
        <div class="card-body p-4">
          <!-- Setup Status -->
          <div *ngIf="setupComplete" class="alert alert-success">
            <h5 class="alert-heading">Setup Complete!</h5>
            <p>Your administrator account has been created successfully.</p>
            <hr>
            <p class="mb-0">You can now <a routerLink="/admin/auth/login" class="alert-link">login to your admin dashboard</a>.</p>
          </div>
          
          <!-- Error Alert -->
          <div *ngIf="errorMessage && !setupComplete" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Already Setup Alert -->          
          <div *ngIf="alreadySetup && !setupComplete" class="alert alert-warning" role="alert">
            <h5 class="alert-heading">Setup Already Completed</h5>
            <p>The initial admin setup has already been completed.</p>
            <hr>
            <p class="mb-0">Please <a routerLink="/admin/auth/login" class="alert-link">login to your admin dashboard</a> or contact an existing administrator for access.</p>
          </div>
          
          <!-- Setup Form -->
          <form *ngIf="!setupComplete && !alreadySetup" [formGroup]="setupForm" (ngSubmit)="onSubmit()">
            <!-- Full Name -->
            <div class="form-group mb-3">
              <label for="name" class="form-label">Full Name</label>
              <input 
                type="text" 
                formControlName="name" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['name'].errors }" 
                id="name" 
                placeholder="John Doe"
              />
              <div *ngIf="submitted && f['name'].errors" class="invalid-feedback">
                Full name is required
              </div>
            </div>
            
            <!-- Email -->
            <div class="form-group mb-3">
              <label for="email" class="form-label">Email Address</label>
              <input 
                type="email" 
                formControlName="email" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['email'].errors }" 
                id="email" 
                placeholder="admin@example.com"
              />
              <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                <div *ngIf="f['email'].errors['required']">Email is required</div>
                <div *ngIf="f['email'].errors['email']">Please enter a valid email</div>
              </div>
            </div>
            
            <!-- Password -->
            <div class="form-group mb-3">
              <label for="password" class="form-label">Password</label>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['password'].errors }" 
                id="password"
              />
              <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                <div *ngIf="f['password'].errors['required']">Password is required</div>
                <div *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters</div>
              </div>
            </div>
            
            <!-- Confirm Password -->
            <div class="form-group mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                formControlName="confirmPassword" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['confirmPassword'].errors }" 
                id="confirmPassword"
              />
              <div *ngIf="submitted && f['confirmPassword'].errors" class="invalid-feedback">
                <div *ngIf="f['confirmPassword'].errors['required']">Please confirm your password</div>
                <div *ngIf="f['confirmPassword'].errors['mismatch']">Passwords do not match</div>
              </div>
            </div>
            
            <!-- Setup Key -->
            <div class="form-group mb-4">
              <label for="setupKey" class="form-label">Setup Security Key</label>
              <input 
                type="text" 
                formControlName="setupKey" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['setupKey'].errors }" 
                id="setupKey"
                placeholder="Enter the setup key"
              />
              <div *ngIf="submitted && f['setupKey'].errors" class="invalid-feedback">
                <div *ngIf="f['setupKey'].errors['required']">Setup key is required</div>
              </div>
              <small class="form-text text-muted">
                The setup key is a special code required to initialize the first admin account.
                Default key is "INITIAL_SETUP_KEY"
              </small>
            </div>
            
            <!-- Submit Button -->
            <div class="d-grid">
              <button type="submit" class="btn btn-primary" [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                Complete Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class AdminSetupComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private setupService = inject(AdminSetupService);
  
  setupForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  setupComplete = false;
  alreadySetup = false;
  showPassword = false;
  showConfirmPassword = false;
  
  // This is the default setup key - in a real app, this would be a secure environment variable
  private readonly SETUP_KEY = 'INITIAL_SETUP_KEY';

  constructor() {
    this.setupForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      setupKey: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Check if admin setup has already been completed
    this.checkSetupStatus();
  }
  
  // Check if initial admin setup has already been completed
  checkSetupStatus(): void {
    this.setupService.getSetupStatus().subscribe({
      next: (response: {setupComplete: boolean}) => {
        this.alreadySetup = response.setupComplete;
      },
      error: (error: any) => {
        // If we can't connect to the API, assume setup hasn't been done
        console.error('Error checking setup status:', error);
        this.alreadySetup = false;
      }
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Convenience getter for easy access to form fields
  get f() { return this.setupForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.setupForm.invalid) {
      return;
    }

    // Verify setup key
    if (this.f['setupKey'].value !== this.SETUP_KEY) {
      this.errorMessage = 'Invalid setup key';
      return;
    }

    this.loading = true;
    
    // Create the first admin account
    const setupPayload = {
      name: this.f['name'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      role: 'admin',
      setupKey: this.f['setupKey'].value
    };
    
    this.setupService.completeSetup({
      name: setupPayload.name,
      email: setupPayload.email,
      password: setupPayload.password,
      role: 'admin',
      setupKey: setupPayload.setupKey
    })
      .subscribe({
        next: (user: User) => {
          console.log('Admin setup successful:', user);
          this.setupComplete = true;
          this.loading = false;
          
          // Auto login after successful setup
          this.authService.loginWithEmail(setupPayload.email, setupPayload.password)
            .subscribe({
              next: () => {
                setTimeout(() => {
                  this.router.navigate(['/admin/dashboard']);
                }, 2000);
              }
            });
        },
        error: (error: any) => {
          console.error('Admin setup error:', error);
          if (error.status === 409) {
            this.errorMessage = 'Setup has already been completed. Please contact an existing administrator.';
            this.alreadySetup = true;
          } else {
            this.errorMessage = error.error?.message || 'Failed to complete setup. Please try again.';
          }
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
