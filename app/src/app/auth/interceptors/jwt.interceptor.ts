import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

// Use a class to maintain state
class RefreshTokenState {
  isRefreshing = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
}

const refreshTokenState = new RefreshTokenState();

export const JwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Add auth header with jwt if user is logged in
  const token = authService.getToken();
  
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token expired or invalid
        return handle401Error(request, next, authService);
      }
      
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  // Check if we should add the token to this request
  // Don't add token to requests to other domains or non-API requests
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  
  if (isApiUrl) {
    console.log(`Adding token to request: ${request.url}`);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return request;
}

function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  // Skip auth endpoints to avoid infinite loops
  if (request.url.includes('/auth/login') || 
      request.url.includes('/auth/register') || 
      request.url.includes('/auth/refresh-token')) {
    return throwError(() => new Error('Authentication failed'));
  }

  if (!refreshTokenState.isRefreshing) {
    console.log('Token expired, attempting to refresh...');
    refreshTokenState.isRefreshing = true;
    refreshTokenState.refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        console.log('Token refreshed successfully');
        refreshTokenState.isRefreshing = false;
        refreshTokenState.refreshTokenSubject.next(response.token);
        return next(addToken(request, response.token));
      }),
      catchError(error => {
        console.error('Failed to refresh token:', error);
        refreshTokenState.isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  return refreshTokenState.refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addToken(request, token)))
  );
}
