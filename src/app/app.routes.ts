import { Routes } from '@angular/router'; // triggers rebuild
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PortalLayoutComponent } from './layouts/portal-layout/portal-layout.component';

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
    path: 'portal',
    component: PortalLayoutComponent,
    children: [
      {
        path: 'hub',
        loadComponent: () => import('./features/portal-hub/portal-hub.component').then(m => m.PortalHubComponent),
        data: { animation: 'PortalHub' }
      },
      {
        path: 'work-monitoring',
        loadComponent: () => import('./features/work-monitoring/work-monitoring.component').then(m => m.WorkMonitoringComponent),
        data: { animation: 'WorkMonitoring' }
      },
      {
        path: 'sanction/proposed-work/entry',
        loadComponent: () => import('./features/sanction/proposed-work/proposed-work-entry/proposed-work-entry.component').then(m => m.ProposedWorkEntryComponent),
        data: { animation: 'ProposedWorkEntry' }
      },
      {
        path: 'sanction/proposed-work/update',
        loadComponent: () => import('./features/sanction/proposed-work/proposed-work-update/proposed-work-update.component').then(m => m.ProposedWorkUpdateComponent),
        data: { animation: 'ProposedWorkUpdate' }
      },
      {
        path: 'sanction/proposed-work/mla-recommendation',
        loadComponent: () => import('./features/sanction/proposed-work/mla-recommendation-list/mla-recommendation-list.component').then(m => m.MlaRecommendationListComponent),
        data: { animation: 'MlaRecommendationList' }
      },
      {
        path: 'sanction/proposed-work/revert-requests',
        loadComponent: () => import('./features/sanction/proposed-work/mla-revert-request-list/mla-revert-request-list.component').then(m => m.MlaRevertRequestListComponent),
        data: { animation: 'MlaRevertRequestList' }
      },
      {
        path: 'sanction/admin-sanction/entry',
        loadComponent: () => import('./features/sanction/admin-sanction/admin-sanction-entry/admin-sanction-entry.component').then(m => m.AdminSanctionEntryComponent),
        data: { animation: 'AdminSanctionEntry' }
      },
      {
        path: 'sanction/admin-sanction/update',
        loadComponent: () => import('./features/sanction/admin-sanction/admin-sanction-update/admin-sanction-update.component').then(m => m.AdminSanctionUpdateComponent),
        data: { animation: 'AdminSanctionUpdate' }
      },
      {
        path: 'sanction/admin-sanction/finalize',
        loadComponent: () => import('./features/sanction/admin-sanction/admin-sanction-finalize/admin-sanction-finalize.component').then(m => m.AdminSanctionFinalizeComponent),
        data: { animation: 'AdminSanctionFinalize' }
      },
      {
        path: 'sanction/admin-sanction/dispatch',
        loadComponent: () => import('./features/sanction/admin-sanction/admin-sanction-dispatch/admin-sanction-dispatch.component').then(m => m.AdminSanctionDispatchComponent),
        data: { animation: 'AdminSanctionDispatch' }
      },
      {
        path: 'sanction/admin-sanction/undispatch',
        loadComponent: () => import('./features/sanction/admin-sanction/admin-sanction-undispatch/admin-sanction-undispatch.component').then(m => m.AdminSanctionUndispatchComponent),
        data: { animation: 'AdminSanctionUndispatch' }
      },
      {
        path: 'stage/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'master/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'reports/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'transaction/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'uccc/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'admin/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'mpk/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'help/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: 'problem/:id',
        loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent),
        data: { animation: 'ModuleWorkspace' }
      },
      {
        path: '',
        redirectTo: 'hub',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'work-monitoring',
    redirectTo: '/portal/work-monitoring',
    pathMatch: 'full'
  },
  {
    path: 'hub',
    redirectTo: '/portal/hub',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
