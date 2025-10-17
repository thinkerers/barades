import { Route } from '@angular/router';
import { AppLayout } from './core/layouts/app-layout';
import { HomePage } from './features/home/home-page';
import { SessionsListPage } from './features/sessions/sessions-list';
import { SessionCreateComponent } from './features/sessions/session-create';
import { SessionDetailComponent } from './features/sessions/session-detail';
import { LocationsListComponent } from './features/locations/locations-list';
import { GroupsListComponent } from './features/groups/groups-list';
import { GroupDetailComponent } from './features/groups/group-detail';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
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
				path: 'showcase',
				component: ShowcasePage,
			},
		],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
