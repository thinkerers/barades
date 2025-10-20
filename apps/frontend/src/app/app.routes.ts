import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayout } from './core/layouts/app-layout';
import { HomePage } from './features/home/home-page';

export const appRoutes: Route[] = [
  // Auth routes (no layout) - Lazy loaded
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  // App routes (with layout)
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: HomePage, // Keep home page eager for fast initial load
      },
      // Sessions - Lazy loaded
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/sessions-list').then(
            (m) => m.SessionsListPage
          ),
      },
      {
        path: 'sessions/new',
        loadComponent: () =>
          import('./features/sessions/session-create').then(
            (m) => m.SessionCreateComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'sessions/:id/edit',
        loadComponent: () =>
          import('./features/sessions/session-edit').then(
            (m) => m.SessionEditComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'sessions/:id',
        loadComponent: () =>
          import('./features/sessions/session-detail').then(
            (m) => m.SessionDetailComponent
          ),
      },
      // Locations - Lazy loaded (includes heavy Leaflet library)
      {
        path: 'locations',
        loadComponent: () =>
          import('./features/locations/locations-list').then(
            (m) => m.LocationsListComponent
          ),
      },
      // Groups - Lazy loaded
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/groups-list').then(
            (m) => m.GroupsListComponent
          ),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./features/groups/group-detail').then(
            (m) => m.GroupDetailComponent
          ),
      },
      // Other pages - Lazy loaded
      {
        path: 'forum',
        loadComponent: () =>
          import('./features/forum/forum-page').then((m) => m.ForumPage),
      },
      {
        path: 'charter',
        loadComponent: () =>
          import('./features/charter/charter-page').then((m) => m.CharterPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile-page').then((m) => m.ProfilePage),
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then(
            (m) => m.DashboardPage
          ),
        canActivate: [authGuard],
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./features/showcase/showcase-page').then(
            (m) => m.ShowcasePage
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about-page').then((m) => m.AboutPage),
      },
      {
        path: 'careers',
        loadComponent: () =>
          import('./features/careers/careers-page').then((m) => m.CareersPage),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact-page').then((m) => m.ContactPage),
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/help/help-page').then((m) => m.HelpPage),
      },
      {
        path: 'partner',
        loadComponent: () =>
          import('./features/partner/partner-page').then((m) => m.PartnerPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
