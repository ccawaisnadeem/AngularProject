import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CheckoutCancelComponent } from './pages/checkout/CheckoutCancelComponent';
import { CheckoutSuccessComponent } from './pages/checkout/CheckoutSuccessComponent';
import { Home } from './pages/home/home';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { 
    path: '', 
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: Home },
      { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
      { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
      { path: 'checkout/success', component: CheckoutSuccessComponent },
      { path: 'checkout/cancel', component: CheckoutCancelComponent },
      { path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [AuthGuard] },
      { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
      { path: 'order-tracking/:id', component: OrderTrackingComponent, canActivate: [AuthGuard] },
      { 
        path: 'product/:id', 
        loadComponent: () => import('./pages/product-detail/product-detail').then(c => c.ProductDetailComponent) 
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }  // ✅ keep only one redirect
    ]
  },

  // Auth routes
  { path: 'auth/login', loadComponent: () => import('./auth/pages/login/login').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./auth/pages/register/register').then(m => m.RegisterComponent) },
  { path: 'auth/forgot-password', loadComponent: () => import('./auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'auth/reset-password', loadComponent: () => import('./auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'auth/oauth-callback', loadComponent: () => import('./auth/pages/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent) },

  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },

  { path: 'admin/login', loadComponent: () => import('./admin/auth/pages/login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'admin/register', loadComponent: () => import('./admin/auth/pages/register/admin-register.component').then(m => m.AdminRegisterComponent) },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // 404 page - must be the last route
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
