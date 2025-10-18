import { Component, ViewChild, inject } from '@angular/core';
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
})
export class TopBar {
  authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(MatMenuTrigger)
  private menuTrigger?: MatMenuTrigger;

  closeMenu(): void {
    this.menuTrigger?.closeMenu();
  }

  navigateToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  getAvatarText(): string {
    const username = this.authService.getCurrentUser()?.username;
    return username ? username.substring(0, 2).toUpperCase() : '??';
  }
}
