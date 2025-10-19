import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayout } from './core/layouts/app-layout';
import { AboutPage } from './features/about/about-page';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CareersPage } from './features/careers/careers-page';
import { CharterPage } from './features/charter/charter-page';
import { ContactPage } from './features/contact/contact-page';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { ForumPage } from './features/forum/forum-page';
import { GroupDetailComponent } from './features/groups/group-detail';
import { GroupsListComponent } from './features/groups/groups-list';
import { HelpPage } from './features/help/help-page';
import { HomePage } from './features/home/home-page';
import { LocationsListComponent } from './features/locations/locations-list';
import { PartnerPage } from './features/partner/partner-page';
import { ProfilePage } from './features/profile/profile-page';
import { SessionCreateComponent } from './features/sessions/session-create';
import { SessionDetailComponent } from './features/sessions/session-detail';
import { SessionEditComponent } from './features/sessions/session-edit';
import { SessionsListPage } from './features/sessions/sessions-list';
import { ShowcasePage } from './features/showcase/showcase-page';

export const appRoutes: Route[] = [
  // Auth routes (no layout)
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  // App routes (with layout)
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: HomePage,
      },
      {
        path: 'sessions',
        component: SessionsListPage,
      },
      {
        path: 'sessions/new',
        component: SessionCreateComponent,
        canActivate: [authGuard],
      },
      {
        path: 'sessions/:id/edit',
        component: SessionEditComponent,
        canActivate: [authGuard],
      },
      {
        path: 'sessions/:id',
        component: SessionDetailComponent,
      },
      {
        path: 'locations',
        component: LocationsListComponent,
      },
      {
        path: 'groups',
        component: GroupsListComponent,
      },
      {
        path: 'groups/:id',
        component: GroupDetailComponent,
      },
      {
        path: 'forum',
        component: ForumPage,
      },
      {
        path: 'charter',
        component: CharterPage,
      },
      {
        path: 'profile',
        component: ProfilePage,
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        component: DashboardPage,
        canActivate: [authGuard],
      },
      {
        path: 'showcase',
        component: ShowcasePage,
      },
      {
        path: 'about',
        component: AboutPage,
      },
      {
        path: 'careers',
        component: CareersPage,
      },
      {
        path: 'contact',
        component: ContactPage,
      },
      {
        path: 'help',
        component: HelpPage,
      },
      {
        path: 'partner',
        component: PartnerPage,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
