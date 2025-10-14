import { Route } from '@angular/router';
import { AppLayout } from './core/layouts/app-layout';
import { HomePage } from './features/home/home-page';
import { SessionsListPage } from './features/sessions/sessions-list';
import { LocationsListComponent } from './features/locations/locations-list';
import { GroupsListComponent } from './features/groups/groups-list';

export const appRoutes: Route[] = [
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
		],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
