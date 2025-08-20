import { Injectable, inject } from '@angular/core';
import { 
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminSetupService } from '../services/admin-setup.service';

@Injectable({
  providedIn: 'root'
})
export class AdminSetupGuard implements CanActivate {
  private setupService = inject(AdminSetupService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // ALWAYS allow access to setup route
    if (state.url.includes('/admin/auth/setup') || state.url.includes('/admin-setup')) {
      console.log('AdminSetupGuard: Setup route detected, allowing access');
      return of(true);
    }
    
    // For all other routes, proceed normally
    return this.setupService.getSetupStatus().pipe(
      map(response => {
        // If setup is not completed, redirect to setup
        if (!response.setupComplete) {
          console.log('AdminSetupGuard: Setup not completed, redirecting to setup');
          this.router.navigate(['/admin-setup']);
          return false;
        }
        
        // Setup is complete, allow access to other admin routes
        return true;
      }),
      catchError(() => {
        console.error('AdminSetupGuard: Error checking setup status');
        // On error, always allow access
        return of(true);
      })
    );
  }
}
