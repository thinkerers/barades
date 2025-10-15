import { Route } from '@angular/router';
import { AppLayout } from './core/layouts/app-layout';
import { HomePage } from './features/home/home-page';
import { SessionsListPage } from './features/sessions/sessions-list';
import { LocationsListComponent } from './features/locations/locations-list';
import { GroupsListComponent } from './features/groups/groups-list';
import { GroupDetailComponent } from './features/groups/group-detail';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

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
		],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
