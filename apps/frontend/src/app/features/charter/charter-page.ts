import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface CharterPrinciple {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly emphasis?: boolean;
}

@Component({
  selector: 'app-charter-page',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './charter-page.html',
  styleUrl: './charter-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharterPage {
  readonly principles: CharterPrinciple[] = [
    {
      icon: 'favorite',
      title: 'La bienveillance avant tout',
      description:
        "Traitez chaque membre avec empathie. Les nouveaux joueurs sont guidés, les vétérans partagent leurs connaissances et le harcèlement n'a pas sa place chez Bar à Dés.",
    },
    {
      icon: 'diversity_3',
      title: 'Le respect des différences',
      description:
        'Nos tables sont diverses : styles de jeu, cultures et imaginaires variés. Les discussions sont ouvertes mais toujours respectueuses.',
    },
    {
      icon: 'diversity_2',
      title: "L'inclusivité à chaque table",
      description:
        'Chacun doit se sentir le bienvenu, peu importe son expérience, son identité ou ses capacités. Créez des espaces sûrs et accueillants.',
    },
    {
      icon: 'calendar_month',
      title: "L'engagement et la communication",
      description:
        "Prévenez à l'avance en cas d'absence, soyez ponctuels et clarifiez vos attentes. Des parties réussies reposent sur une organisation partagée.",
    },
    {
      icon: 'shield',
      title: 'La sécurité et le consentement',
      description:
        'Installez des outils de sécurité (Session 0, X-Card, lignes et voiles) pour que chacun puisse s\'exprimer sereinement. Respectez toujours un "non".',
    },
    {
      icon: 'gavel',
      title: 'Conséquences et signalement',
      description:
        'La modération peut avertir, suspendre ou bannir un compte en cas de manquement à la charte. Signalez tout comportement problématique pour protéger la communauté.',
      emphasis: true,
    },
  ];
}
