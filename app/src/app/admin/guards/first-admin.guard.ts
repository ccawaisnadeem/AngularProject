import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AdminSetupService } from '../services/admin-setup.service';

@Injectable({
  providedIn: 'root'
})
export class FirstAdminGuard implements CanActivate {
  private setupService = inject(AdminSetupService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    // Check if any admin exists already
    return this.setupService.getSetupStatus().pipe(
      map(status => {
        // If setup is not complete, allow access to create first admin
        if (!status.setupComplete) {
          return true;
        }
        
        // If setup is already complete, redirect to login
        this.router.navigate(['/admin/auth/login']);
        return false;
      }),
      catchError(() => {
        // If we can't determine status, allow access (will be handled in the component)
        return of(true);
      })
    );
  }
}
