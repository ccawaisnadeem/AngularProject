import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // Storage keys
  private readonly USER_STORAGE_KEY = 'currentUser';
  private readonly TOKEN_STORAGE_KEY = 'access_token';
  private readonly REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
  
  // API URL from environment config
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_STORAGE_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  // Manual login with email and password
  loginWithEmail(email: string, password: string): Observable<User> {
    console.log(`Logging in user with email: ${email}`);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login successful:', response);
          this.handleAuthResponse(response);
        }),
        map(response => response.user),
        catchError(error => {
          console.error('Login error:', error);
          if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
              return throwError(() => new Error('Cannot connect to the server. Please try again later.'));
            }
            if (error.status === 401) {
              return throwError(() => new Error('Invalid email or password. Please try again.'));
            }
            if (error.status === 400 && error.error?.errors) {
              const validationErrors = Object.values(error.error.errors).flat().join(', ');
              return throwError(() => new Error(validationErrors || 'Login failed. Please check your information.'));
            }
            return throwError(() => new Error(error.error?.message || error.error?.title || 'Login failed. Please try again.'));
          }
          return throwError(() => new Error('Login failed. Please try again.'));
        })
      );
  }

  // Register with email and password
  registerWithEmail(email: string, password: string, name: string, address?: string): Observable<User> {
    const payload = { 
      email, 
      password, 
      fullName: name, // Changed from 'name' to 'fullName' to match backend expectations
      address 
    };
    
    console.log(`Registering user with payload:`, payload);
    
    // Map the name field to fullName for backend compatibility
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, payload)
      .pipe(
        tap(response => {
          console.log('Registration successful:', response);
          this.handleAuthResponse(response);
        }),
        map(response => response.user),
        catchError(error => {
          console.error('Registration error:', error);
          
          if (error instanceof HttpErrorResponse) {
            // Log the error response for debugging
            console.error('Error status:', error.status);
            console.error('Error body:', error.error);
            
            // More detailed error handling
            if (error.status === 0) {
              return throwError(() => new Error('Cannot connect to the server. Please try again later.'));
            }
            
            // Handle validation errors from ASP.NET Core
            if (error.status === 400 && error.error?.errors) {
              console.log('Validation errors:', error.error.errors);
              const validationErrors = Object.values(error.error.errors).flat().join(', ');
              return throwError(() => new Error(validationErrors || 'Registration failed. Please check your information.'));
            }
            
            // For 400 errors without the errors property (may contain different error format)
            if (error.status === 400) {
              console.log('Bad request error:', error.error);
              if (typeof error.error === 'string') {
                return throwError(() => new Error(error.error));
              }
              return throwError(() => new Error(error.error?.message || error.error?.title || 'Registration failed. Please check your information.'));
            }
            
            return throwError(() => new Error(error.error?.message || error.error?.title || 'Registration failed. Please try again.'));
          }
          return throwError(() => new Error('Registration failed. Please try again.'));
        })
      );
  }

  // Google OAuth login
  loginWithGoogle(): void {
    // Redirect to Google OAuth endpoint
    window.location.href = `${this.API_URL}/auth/google`;
  }

  // GitHub OAuth login
  loginWithGitHub(): void {
    // Redirect to GitHub OAuth endpoint
    window.location.href = `${this.API_URL}/auth/github`;
  }

  // Handle OAuth callback
  processOAuthCallback(provider: string, code: string): Observable<User> {
    return this.http.get<AuthResponse>(`${this.API_URL}/auth/oauth/callback?code=${code}&provider=${provider}`)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        map(response => response.user),
        catchError(error => {
          console.error('OAuth callback error:', error);
          return throwError(() => new Error('Authentication failed. Please try again.'));
        })
      );
  }

  // Send password reset email
  sendPasswordResetEmail(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Password reset request error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to send reset email. Please try again.'));
        })
      );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/reset-password`, { token, newPassword })
      .pipe(
        catchError(error => {
          console.error('Password reset error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset failed. Please try again.'));
        })
      );
  }

  // Refresh token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('Attempting to refresh token');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          console.log('Token refresh successful');
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          // If token refresh fails, log the user out
          this.logout();
          
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              return throwError(() => new Error('Session expired. Please login again.'));
            }
            return throwError(() => new Error(error.error?.message || error.error?.title || 'Authentication failed. Please login again.'));
          }
          
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  // Handle authentication response
  private handleAuthResponse(response: AuthResponse): void {
    if (response?.token && response?.user) {
      console.log('Storing auth data in localStorage');
      
      // Store token and user data
      localStorage.setItem(this.TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(this.REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(response.user));
      
      // Update the current user subject
      this.currentUserSubject.next(response.user);
      
      console.log('Authentication completed successfully');
    } else {
      console.warn('Invalid authentication response', response);
    }
  }
}