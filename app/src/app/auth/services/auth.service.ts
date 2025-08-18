import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly USER_STORAGE_KEY = 'currentUser';

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

  public isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // Manual login with email and password
  loginWithEmail(email: string, password: string): Observable<User> {
    // Replace with your actual API endpoint
    return this.http.post<User>('/api/auth/login', { email, password })
      .pipe(
        tap(user => this.setUserSession(user)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed. Please try again.'));
        })
      );
  }

  // Register with email and password
  registerWithEmail(email: string, password: string, name: string, address?: string): Observable<User> {
    // Replace with your actual API endpoint
    return this.http.post<User>('/api/auth/register', { email, password, name, address })
      .pipe(
        tap(user => this.setUserSession({ ...user, provider: 'manual' })),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }

  // Google OAuth login
  loginWithGoogle(): void {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  }

  // GitHub OAuth login
  loginWithGitHub(): void {
    // Redirect to GitHub OAuth endpoint
    window.location.href = '/api/auth/github';
  }

  // Facebook OAuth login
  loginWithFacebook(): void {
    // Redirect to Facebook OAuth endpoint
    window.location.href = '/api/auth/facebook';
  }

  // Handle OAuth callback
  processOAuthCallback(provider: string, code: string): Observable<User> {
    return this.http.get<User>(`/api/auth/${provider}/callback?code=${code}`)
      .pipe(
        tap(user => this.setUserSession(user)),
        catchError(error => {
          console.error('OAuth callback error:', error);
          return throwError(() => new Error('Authentication failed. Please try again.'));
        })
      );
  }

  // Send password reset email
  sendPasswordResetEmail(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/forgot-password', { email })
      .pipe(
        catchError(error => {
          console.error('Password reset request error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to send reset email. Please try again.'));
        })
      );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/reset-password', { token, newPassword })
      .pipe(
        catchError(error => {
          console.error('Password reset error:', error);
          return throwError(() => new Error(error.error?.message || 'Password reset failed. Please try again.'));
        })
      );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  // Store user in localStorage and update the BehaviorSubject
  private setUserSession(user: User): void {
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
}