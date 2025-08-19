import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="position: fixed; bottom: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 10px; z-index: 9999;">
      <p>Current Route: {{ currentRoute }}</p>
      <p>Is Auth Page: {{ isAuthPage }}</p>
    </div>
  `,
})
export class DebugComponent {
  currentRoute: string = '';
  isAuthPage: boolean = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.isAuthPage = this.currentRoute.includes('/auth/');
        console.log('Current Route:', this.currentRoute);
        console.log('Is Auth Page:', this.isAuthPage);
      });
  }
}
