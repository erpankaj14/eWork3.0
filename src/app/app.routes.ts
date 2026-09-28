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
        path: 'sanction/plan/create',
        loadComponent: () => import('./features/sanction/plan/plan-create/plan-create.component').then(m => m.PlanCreateComponent),
        data: { animation: 'PlanCreate' }
      },
      {
        path: 'sanction/plan/approved-list',
        loadComponent: () => import('./features/sanction/plan/plan-list/plan-list.component').then(m => m.PlanListComponent),
        data: { animation: 'PlanList' }
      },

      // Generic Multi-Segment Routes for Module Workspaces inside Portal Layout
      { path: 'sanction/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'sanction/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'sanction/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'sanction', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'master/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'master/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'master/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'master', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'reports/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'reports/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'reports/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'reports', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'transaction/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'transaction/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'transaction/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'transaction', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'uccc/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'uccc/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'uccc/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'uccc', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'admin/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'admin/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'admin/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'admin', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'mpk/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'mpk/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'mpk/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'mpk', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'help/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'help/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'help/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'help', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'problem/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'problem/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'problem/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'problem', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      { path: 'stage/:p1/:p2/:p3', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'stage/:p1/:p2', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'stage/:p1', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },
      { path: 'stage', loadComponent: () => import('./features/module-workspace/module-workspace.component').then(m => m.ModuleWorkspaceComponent) },

      {
        path: '',
        redirectTo: 'hub',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'hub'
      }
    ]
  },

  // Root-Level Module Catchers redirecting to Portal Layout
  { path: 'work-monitoring', redirectTo: '/portal/work-monitoring', pathMatch: 'full' },
  { path: 'hub', redirectTo: '/portal/hub', pathMatch: 'full' },
  { path: 'sanction/:p1/:p2/:p3', redirectTo: '/portal/sanction/:p1/:p2/:p3' },
  { path: 'sanction/:p1/:p2', redirectTo: '/portal/sanction/:p1/:p2' },
  { path: 'sanction/:p1', redirectTo: '/portal/sanction/:p1' },
  { path: 'sanction', redirectTo: '/portal/sanction' },
  { path: 'master/:p1/:p2/:p3', redirectTo: '/portal/master/:p1/:p2/:p3' },
  { path: 'master/:p1/:p2', redirectTo: '/portal/master/:p1/:p2' },
  { path: 'master/:p1', redirectTo: '/portal/master/:p1' },
  { path: 'master', redirectTo: '/portal/master' },
  { path: 'reports/:p1/:p2/:p3', redirectTo: '/portal/reports/:p1/:p2/:p3' },
  { path: 'reports/:p1/:p2', redirectTo: '/portal/reports/:p1/:p2' },
  { path: 'reports/:p1', redirectTo: '/portal/reports/:p1' },
  { path: 'reports', redirectTo: '/portal/reports' },
  { path: 'transaction/:p1/:p2/:p3', redirectTo: '/portal/transaction/:p1/:p2/:p3' },
  { path: 'transaction/:p1/:p2', redirectTo: '/portal/transaction/:p1/:p2' },
  { path: 'transaction/:p1', redirectTo: '/portal/transaction/:p1' },
  { path: 'transaction', redirectTo: '/portal/transaction' },
  { path: 'uccc/:p1/:p2/:p3', redirectTo: '/portal/uccc/:p1/:p2/:p3' },
  { path: 'uccc/:p1/:p2', redirectTo: '/portal/uccc/:p1/:p2' },
  { path: 'uccc/:p1', redirectTo: '/portal/uccc/:p1' },
  { path: 'uccc', redirectTo: '/portal/uccc' },
  { path: 'admin/:p1/:p2/:p3', redirectTo: '/portal/admin/:p1/:p2/:p3' },
  { path: 'admin/:p1/:p2', redirectTo: '/portal/admin/:p1/:p2' },
  { path: 'admin/:p1', redirectTo: '/portal/admin/:p1' },
  { path: 'admin', redirectTo: '/portal/admin' },
  { path: 'mpk/:p1/:p2/:p3', redirectTo: '/portal/mpk/:p1/:p2/:p3' },
  { path: 'mpk/:p1/:p2', redirectTo: '/portal/mpk/:p1/:p2' },
  { path: 'mpk/:p1', redirectTo: '/portal/mpk/:p1' },
  { path: 'mpk', redirectTo: '/portal/mpk' },
  { path: 'help/:p1/:p2/:p3', redirectTo: '/portal/help/:p1/:p2/:p3' },
  { path: 'help/:p1/:p2', redirectTo: '/portal/help/:p1/:p2' },
  { path: 'help/:p1', redirectTo: '/portal/help/:p1' },
  { path: 'help', redirectTo: '/portal/help' },
  { path: 'problem/:p1/:p2/:p3', redirectTo: '/portal/problem/:p1/:p2/:p3' },
  { path: 'problem/:p1/:p2', redirectTo: '/portal/problem/:p1/:p2' },
  { path: 'problem/:p1', redirectTo: '/portal/problem/:p1' },
  { path: 'problem', redirectTo: '/portal/problem' },
  { path: 'stage/:p1/:p2/:p3', redirectTo: '/portal/stage/:p1/:p2/:p3' },
  { path: 'stage/:p1/:p2', redirectTo: '/portal/stage/:p1/:p2' },
  { path: 'stage/:p1', redirectTo: '/portal/stage/:p1' },
  { path: 'stage', redirectTo: '/portal/stage' },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
