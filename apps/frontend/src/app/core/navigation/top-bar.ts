import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
