import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-register.component.html',
  styles: [`
    .admin-register-container {
      max-width: 450px;
      margin: 0 auto;
    }
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class AdminRegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Redirect if already logged in as admin
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      adminToken: [''] // Hidden field to store the token from URL
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Store the registration token from the URL query params
    const registrationToken = this.route.snapshot.queryParams['token'];
    if (registrationToken) {
      // Store the token in the form to submit it later
      this.registerForm.patchValue({ adminToken: registrationToken });
    }
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Register as admin user - no admin code needed
    console.log('Attempting admin registration with role: admin');
    this.authService.registerWithEmail(
      this.f['email'].value,
      this.f['password'].value,
      this.f['name'].value,
      undefined, // address is optional
      'admin'    // role - explicitly set to admin
      // Removed adminCode parameter
    ).subscribe({
      next: (user) => {
        console.log('Admin registration successful:', user);
        // Redirect to admin login page after successful registration
        this.router.navigate(['/admin/auth/login'], { 
          queryParams: { message: 'Registration successful! Please login with your credentials.' }
        });
      },
      error: (error) => {
        console.error('Admin registration error:', error);
        if (error.status === 403) {
          this.errorMessage = 'Invalid admin registration code';
        } else {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
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
