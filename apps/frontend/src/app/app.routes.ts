import { Route } from '@angular/router';
import { AppLayout } from './core/layouts/app-layout';
import { HomePage } from './features/home/home-page';

export const appRoutes: Route[] = [
	{
		path: '',
		component: AppLayout,
		children: [
			{
				path: '',
				component: HomePage,
			},
		],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
