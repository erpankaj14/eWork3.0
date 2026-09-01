import { Routes } from '@angular/router'; // triggers rebuild
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        data: { animation: 'Dashboard' }
      },
      {
        path: 'dashboard-1',
        loadComponent: () => import('./features/dashboard-1/dashboard-1.component').then(m => m.Dashboard1Component),
        data: { animation: 'Dashboard1' }
      },
      {
        path: 'dashboard-2',
        loadComponent: () => import('./features/dashboard-2/dashboard-2.component').then(m => m.Dashboard2Component),
        data: { animation: 'Dashboard2' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
