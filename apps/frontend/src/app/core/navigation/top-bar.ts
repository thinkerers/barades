import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatMenuModule],
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = toSignal(this.authService.isAuthenticated$, {
    initialValue: this.authService.isAuthenticated(),
  });

  readonly avatarText = computed(() => {
    if (!this.isAuthenticated()) {
      return '??';
    }

    const username = this.authService.getCurrentUser()?.username ?? '';
    return username ? username.substring(0, 2).toUpperCase() : '??';
  });

  @ViewChild(MatMenuTrigger)
  private menuTrigger?: MatMenuTrigger;

  closeMenu(): void {
    this.menuTrigger?.closeMenu();
  }

  navigateToDashboard(): void {
    this.closeMenu();
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}
