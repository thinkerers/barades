import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
  private readonly router = inject(Router);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null as NavigationEnd | null)
    )
  );

  private readonly currentUrl = computed(() => {
    const event = this.navigationEnd();
    if (!event) {
      return this.router.url ?? '';
    }

    return event.urlAfterRedirects ?? event.url;
  });

  readonly isLocationsRoute = computed(() =>
    this.isLocationsUrl(this.currentUrl())
  );

  readonly showFooter = computed(() => !this.isLocationsRoute());

  private isLocationsUrl(url: string): boolean {
    return !!url && url.startsWith('/locations');
  }
}
