import { Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
import { AdminSetupGuard } from './guards/admin-setup.guard';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminInventoryComponent } from './pages/inventory/admin-inventory.component';
import { AdminOrdersComponent } from './pages/orders/admin-orders.component';
import { AdminProfileComponent } from './pages/profile/admin-profile.component';
import { ADMIN_AUTH_ROUTES } from './auth/admin-auth.routes';

export const ADMIN_ROUTES: Routes = [
  // Admin dashboard and protected routes
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard, AdminSetupGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventory', component: AdminInventoryComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'profile', component: AdminProfileComponent }
    ]
  },
  // Admin authentication routes
  {
    path: 'auth',
    children: ADMIN_AUTH_ROUTES
    // Removed AdminSetupGuard to ensure access to auth routes
  }
];
