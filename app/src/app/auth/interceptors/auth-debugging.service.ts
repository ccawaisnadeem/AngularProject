import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * This interceptor is used purely for debugging purposes during Stripe integration
 * It can be added to the providers array in app.config.ts to help diagnose auth issues
 */
@Injectable()
export class AuthDebuggingInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only log Stripe requests for debugging
    if (request.url.includes('StripeCheckout')) {
      console.log(`=== Auth Debugging - Request to: ${request.url} ===`);
      console.log('Headers:', request.headers.keys().map(key => `${key}: ${request.headers.get(key)}`));
      console.log('Auth Status:', this.authService.isAuthenticated() ? 'Authenticated' : 'Not authenticated');
      console.log('Token Present:', this.authService.getToken() ? 'Yes' : 'No');
      
      const token = this.authService.getToken();
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expiry = new Date(payload.exp * 1000);
            console.log('Token Expiry:', expiry);
            console.log('Token Expired:', expiry < new Date() ? 'Yes' : 'No');
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      console.log('API URL:', environment.apiUrl);
      console.log('=== End Auth Debugging ===');
    }
    
    return next.handle(request);
  }
}
  
