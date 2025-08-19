import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: checking if user is authenticated');
    
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is authenticated, granting access');
      return true;
    }
    
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    console.log(`AuthGuard: User not authenticated, redirecting to login with returnUrl: ${returnUrl}`);
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    return false;
  }
}