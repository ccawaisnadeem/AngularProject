import { Routes } from '@angular/router';
import { AdminLoginComponent } from './pages/login/admin-login.component';
import { AdminRegisterComponent } from './pages/register/admin-register.component';

export const ADMIN_AUTH_ROUTES: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { 
    path: 'register', 
    component: AdminRegisterComponent
    // Removed AdminRegistrationGuard for easy access
  }
];
