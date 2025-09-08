import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
      <a routerLink="/home" class="btn btn-primary">Go to Home</a>
    </div>
  `,
  styles: [`
    .not-found-container {
      text-align: center;
      padding: 50px 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      font-size: 36px;
      margin-bottom: 20px;
    }
    p {
      font-size: 18px;
      margin-bottom: 30px;
    }
  `]
})
export class NotFoundComponent {}
