import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import {Inventory} from './pages/inventory/inventory';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'inventory', component: Inventory },
    { path: '**', redirectTo: '/home' }

];
