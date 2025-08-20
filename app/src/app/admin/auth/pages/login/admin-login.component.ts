import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { AuthResponse } from '../../../../auth/models/user.model';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styles: [`
    .admin-login-container {
      max-width: 400px;
      margin: 0 auto;
    }
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  returnUrl: string = '/admin/dashboard';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Redirect if already logged in as admin
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to admin dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    
    // Check for success message from registration
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.successMessage = message;
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    console.log('=== ADMIN LOGIN STARTING ===');
    console.log('Login form values:', { email: this.f['email'].value, password: '[REDACTED]' });
    
    // Use the same login endpoint as regular users
    this.authService.loginWithEmail(
      this.f['email'].value, 
      this.f['password'].value
    ).subscribe({
      next: (user) => {
        console.log('=== ADMIN LOGIN SUCCESS ===');
        console.log('Admin login attempt - User received:', user);
        console.log('User role:', user.role);
        console.log('Current user from service:', this.authService.currentUserValue);
        console.log('isAuthenticated():', this.authService.isAuthenticated());
        console.log('isAdmin() check:', this.authService.isAdmin());
        
        // Check if the logged-in user has admin role
        if (this.authService.isAdmin()) {
          console.log('✅ Admin verification successful');
          console.log('Redirecting to admin dashboard:', this.returnUrl);
          this.router.navigate([this.returnUrl]).then(success => {
            console.log('Navigation result:', success);
            if (!success) {
              console.error('Navigation to admin dashboard failed!');
            }
          });
        } else {
          // If not an admin, show error and log them out
          console.log('❌ User is not admin, denying access');
          console.log('User role was:', user.role);
          this.errorMessage = 'You do not have admin privileges. Please use admin credentials.';
          this.authService.logout();
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        
        if (typeof error === 'string') {
          this.errorMessage = error;
        } else {
          this.errorMessage = error?.message || 'Invalid email or password';
        }
        
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
