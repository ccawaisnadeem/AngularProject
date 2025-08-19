import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  
  // Step-by-step form variables
  emailEntered = false;
  nameEntered = false;
  passwordEntered = false;
  confirmPasswordEntered = false;
  
  // Field validity tracking
  emailValid = false;
  nameValid = false;
  passwordValid = false;
  confirmPasswordValid = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      address: [''] // Optional field
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Subscribe to form field value changes to update the form flow
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.checkEmailValidity();
    });
    
    this.registerForm.get('name')?.valueChanges.subscribe(() => {
      this.checkNameValidity();
    });
    
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordValidity();
    });
    
    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkConfirmPasswordValidity();
    });
  }
  
  // Check email validity and progress to next step if valid
  checkEmailValidity(): void {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.valid && emailControl.value) {
      this.emailValid = true;
      this.emailEntered = true;
    } else {
      this.emailValid = false;
    }
  }
  
  // Check name validity and progress to next step if valid
  checkNameValidity(): void {
    const nameControl = this.registerForm.get('name');
    if (nameControl?.valid && nameControl.value && nameControl.value.trim() !== '') {
      this.nameValid = true;
      this.nameEntered = true;
      
      // If there was an error message about the name field, clear it
      if (this.errorMessage === 'Please enter your name' || 
          this.errorMessage === 'The FullName field is required.') {
        this.errorMessage = '';
      }
    } else {
      this.nameValid = false;
    }
  }
  
  // Check password validity and progress to next step if valid
  checkPasswordValidity(): void {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.valid && passwordControl.value) {
      this.passwordValid = true;
      this.passwordEntered = true;
    } else {
      this.passwordValid = false;
    }
  }
  
  // Check confirm password validity and progress to next step if valid
  checkConfirmPasswordValidity(): void {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    if (confirmPasswordControl?.valid && !confirmPasswordControl.errors?.['mustMatch']) {
      this.confirmPasswordValid = true;
      this.confirmPasswordEntered = true;
    } else {
      this.confirmPasswordValid = false;
    }
  }

  // Custom validator to check if passwords match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        // Return if another validator has already found an error
        return;
      }

      // Set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Mark all fields as touched to show validation messages
    Object.keys(this.f).forEach(key => {
      const control = this.f[key];
      control.markAsTouched();
    });

    // Perform additional validation and show current step if needed
    if (!this.emailValid) {
      this.checkEmailValidity();
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    
    if (!this.nameValid) {
      this.emailEntered = true;
      this.checkNameValidity();
      this.errorMessage = 'The FullName field is required.';
      return;
    }
    
    if (!this.passwordValid) {
      this.emailEntered = true;
      this.nameEntered = true;
      this.checkPasswordValidity();
      this.errorMessage = 'Please enter a valid password (minimum 6 characters)';
      return;
    }
    
    if (!this.confirmPasswordValid) {
      this.emailEntered = true;
      this.nameEntered = true;
      this.passwordEntered = true;
      this.checkConfirmPasswordValidity();
      this.errorMessage = 'Please confirm your password correctly';
      return;
    }

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      console.log('Form is invalid:', this.registerForm.errors);
      
      // Show validation messages for all invalid fields
      Object.keys(this.f).forEach(key => {
        const control = this.f[key];
        if (control.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
        }
      });
      
      return;
    }

    console.log('Form is valid, submitting registration');
    
    this.loading = true;
    this.authService.registerWithEmail(
      this.f['email'].value,
      this.f['password'].value,
      this.f['name'].value,
      this.f['address'].value
    ).subscribe({
      next: (user) => {
        console.log('Registration successful, user:', user);
        this.router.navigate(['/home']);
      },
      error: error => {
        console.error('Registration error in component:', error);
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  registerWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  registerWithGitHub(): void {
    this.authService.loginWithGitHub();
  }
}