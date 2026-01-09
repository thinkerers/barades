import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookies-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookies-page.html',
  styleUrl: './legal-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesPage {
  readonly lastUpdated = '9 janvier 2026';
}
