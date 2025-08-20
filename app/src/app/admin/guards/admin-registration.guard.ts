import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminRegistrationGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AdminRegistrationGuard: checking access to admin registration');
    
    // TEMPORARILY DISABLED TOKEN CHECK - ALLOW ALL ACCESS
    console.log('AdminRegistrationGuard: Token check disabled, allowing access to registration');
    return true;
    
    /* Original code - re-enable after first admin is created
    // Check if there's a valid registration token in the query params
    const registrationToken = route.queryParams['token'];
    
    // In a real app, you would validate this token against a whitelist or database
    // For this example, we'll use a simple hardcoded token
    const isValidToken = registrationToken === 'ADMIN_REGISTRATION_TOKEN';
    
    if (isValidToken) {
      console.log('AdminRegistrationGuard: Valid token, allowing access to registration');
      return true;
    }
    
    // If the token is invalid or not present, redirect to admin login
    console.log('AdminRegistrationGuard: Invalid token, denying access to registration');
    this.router.navigate(['/admin/auth/login']);
    return false;
    */
  }
}
