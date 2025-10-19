import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { Footer } from '../navigation/footer';
import { TopBar } from '../navigation/top-bar';

@Component({
  standalone: true,
  imports: [RouterOutlet, TopBar, Footer],
  selector: 'app-app-layout',
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {
  private readonly router = inject(Router);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null as NavigationEnd | null)
    )
  );

  showFooter = true;
  isLocationsRoute = false;

  constructor() {
    this.updateRouteState(this.router.url);

    effect(() => {
      const event = this.navigationEnd();

      if (!event) {
        return;
      }

      const nextUrl = event.urlAfterRedirects ?? event.url;
      this.updateRouteState(nextUrl);
    });
  }

  private updateRouteState(url: string): void {
    const isLocationsPage = this.isLocationsUrl(url);
    this.isLocationsRoute = isLocationsPage;
    this.showFooter = !isLocationsPage;
  }

  private isLocationsUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    return url.startsWith('/locations');
  }
}
