import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './auth/services/auth.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtInterceptor } from './auth/interceptors/jwt.interceptor';
import { AuthDebuggingInterceptor } from './auth/interceptors/auth-debugging.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([JwtInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    AuthService,
    AuthGuard,
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthDebuggingInterceptor, 
      multi: true 
    }
  ]
};
