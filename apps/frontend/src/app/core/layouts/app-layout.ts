import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
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
  private readonly destroyRef = inject(DestroyRef);

  showFooter = true;
  isLocationsRoute = false;

  constructor() {
    this.updateRouteState(this.router.url);

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const nextUrl = event.urlAfterRedirects ?? event.url;
          this.updateRouteState(nextUrl);
        }
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
