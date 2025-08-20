import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminInvitationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Generates an admin registration invitation link
   * In a real app, this would call the backend to create a unique, time-limited token
   * @param adminEmail The email of the person to invite
   * @returns Observable with the invitation details
   */
  generateInvitationLink(adminEmail: string): Observable<{link: string, expires: Date}> {
    // For a real implementation, you would call a backend API
    // return this.http.post<{link: string, expires: Date}>(`${this.API_URL}/admin/invitations`, { email: adminEmail });
    
    // For demo purposes, we'll simulate the API call
    return new Observable(observer => {
      // Create a mock invitation that expires in 24 hours
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      // Create a mock token - in a real app, this would be a secure token from the backend
      const token = 'ADMIN_REGISTRATION_TOKEN';
      
      // Generate the full URL with the token
      const baseUrl = window.location.origin;
      const invitationLink = `${baseUrl}/admin/auth/register?token=${token}`;
      
      // Return the result
      observer.next({ 
        link: invitationLink, 
        expires: expiryDate 
      });
      observer.complete();
    });
  }
}
