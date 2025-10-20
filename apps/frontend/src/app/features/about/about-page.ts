import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, MatIconModule],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  teamMembers = [
    {
      name: 'Élise',
      role: 'Fondatrice & MJ Éternelle',
      avatar: 'E',
    },
    {
      name: 'Léo',
      role: 'Développeur & Barde Codeur',
      avatar: 'L',
    },
    {
      name: 'Chloé',
      role: 'Community Manager & Clerc',
      avatar: 'C',
    },
  ];
}
