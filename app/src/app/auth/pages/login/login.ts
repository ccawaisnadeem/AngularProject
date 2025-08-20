import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl: string = '/';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect if already logged in - admins to admin dashboard, regular users to home
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Login form is invalid:', this.loginForm.errors);
      
      // Show validation messages for all invalid fields
      Object.keys(this.f).forEach(key => {
        const control = this.f[key];
        if (control.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
        }
      });
      
      return;
    }

    console.log('Login form is valid, submitting');
    
    this.loading = true;
    this.authService.loginWithEmail(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (user) => {
          console.log('Login successful, user:', user);
          
          // Check if the user is an admin and redirect accordingly
          if (this.authService.isAdmin()) {
            console.log('User is admin, redirecting to admin dashboard');
            this.router.navigate(['/admin/dashboard']);
          } else {
            console.log('User is regular user, navigating to:', this.returnUrl);
            this.router.navigate([this.returnUrl]);
          }
        },
        error: error => {
          console.error('Login error in component:', error);
          this.errorMessage = error.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }
}