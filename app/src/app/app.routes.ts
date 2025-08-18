import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Inventory } from './pages/inventory/inventory';
import { AuthGuard } from './auth/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    
    // Main app routes (within the main layout)
    { 
        path: '', 
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: Home },
            { path: 'inventory', component: Inventory, canActivate: [AuthGuard] },
        ]
    },
    
    // Auth routes (directly at root level, standalone pages)
    { 
        path: 'auth/login', 
        loadComponent: () => import('./auth/pages/login/login').then(m => m.LoginComponent) 
    },
    { 
        path: 'auth/register', 
        loadComponent: () => import('./auth/pages/register/register').then(m => m.RegisterComponent) 
    },
    { 
        path: 'auth/forgot-password', 
        loadComponent: () => import('./auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) 
    },
    { 
        path: 'auth/reset-password', 
        loadComponent: () => import('./auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) 
    },
    { 
        path: 'auth/oauth-callback', 
        loadComponent: () => import('./auth/pages/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent) 
    },
    
    // Direct access shortcuts
    { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
    { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
    
    // Fallback route
    { path: '**', redirectTo: '/home' }
];
