import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class OAuthCallbackComponent implements OnInit {
  loading = true;
  errorMessage = '';
  provider = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get provider and code/token from URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      this.provider = params['provider'] || 'unknown';
      
      if (!code) {
        this.handleError('Authentication failed. No authorization code received.');
        return;
      }

      // Process OAuth callback based on provider
      switch (this.provider) {
        case 'google':
          this.processGoogleCallback(code);
          break;
        case 'github':
          this.processGitHubCallback(code);
          break;
        case 'facebook':
          this.processFacebookCallback(code);
          break;
        default:
          this.handleError('Unknown authentication provider.');
      }
    });
  }

  private processGoogleCallback(code: string): void {
    this.authService.processOAuthCallback('google', code).subscribe({
      next: () => this.handleSuccess(),
      error: error => this.handleError(error.message || 'Google authentication failed')
    });
  }

  private processGitHubCallback(code: string): void {
    this.authService.processOAuthCallback('github', code).subscribe({
      next: () => this.handleSuccess(),
      error: error => this.handleError(error.message || 'GitHub authentication failed')
    });
  }

  private processFacebookCallback(code: string): void {
    this.authService.processOAuthCallback('facebook', code).subscribe({
      next: () => this.handleSuccess(),
      error: error => this.handleError(error.message || 'Facebook authentication failed')
    });
  }

  private handleSuccess(): void {
    this.loading = false;
    // Redirect to home page after successful authentication
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    // Redirect to login page after error
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}