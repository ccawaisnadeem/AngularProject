import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AdminGuard: checking if user is authenticated and is admin');
    
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      console.log('AdminGuard: User is admin, granting access');
      return true;
    }
    
    // If user is authenticated but not an admin, redirect to home
    if (this.authService.isAuthenticated()) {
      console.log('AdminGuard: User is authenticated but not admin, redirecting to home');
      this.router.navigate(['/home']);
      return false;
    }
    
    // If user is not authenticated, redirect to admin login
    console.log('AdminGuard: User is not authenticated, redirecting to admin login');
    this.router.navigate(['/admin/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
