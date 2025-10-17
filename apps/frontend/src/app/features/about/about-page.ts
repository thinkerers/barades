import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
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
