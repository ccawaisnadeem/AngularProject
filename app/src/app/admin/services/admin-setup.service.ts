import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminSetupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Checks if the initial admin setup is completed
   * @returns Observable<boolean> - true if setup is needed, false if already set up
   */
  checkSetupNeeded(): Observable<boolean> {
    return this.http.get<{setupNeeded: boolean}>(`${this.apiUrl}/admin/setup/check`)
      .pipe(
        map(response => response.setupNeeded),
        catchError(error => {
          // If the endpoint returns 404, it means the API doesn't support this feature yet
          // In that case, we'll assume setup is needed (for backward compatibility)
          if (error.status === 404) {
            return of(true);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Completes the initial admin setup
   * @param adminData - The data for the first admin account
   * @returns Observable of the created admin
   */
  completeSetup(adminData: {
    name: string;
    email: string;
    password: string;
    setupKey?: string;
    role?: string;
  }): Observable<any> {
    // Temporarily bypass API call and return mock data
    console.log('Mock admin setup with data:', adminData);
    
    // Create a mock user response
    const mockUser = {
      id: '1',
      email: adminData.email,
      name: adminData.name,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    // Return mock response
    return of(mockUser);
    
    // Original implementation - uncomment when API is ready
    // return this.http.post(`${this.apiUrl}/admin/setup/init`, adminData);
  }
  
  /**
   * Checks if the initial admin setup is completed
   * @returns Observable of the setup status
   */
  getSetupStatus(): Observable<{setupComplete: boolean}> {
    // Temporarily bypass API call and always return that setup is needed
    return of({setupComplete: false});
    
    // Original implementation - uncomment when API is ready
    // return this.http.get<{setupComplete: boolean}>(`${this.apiUrl}/admin/setup/status`);
  }
}
