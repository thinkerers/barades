import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface ForumTopic {
  readonly title: string;
  readonly author: string;
  readonly replies: number;
  readonly lastAuthor: string;
  readonly lastActivity: string;
}

interface ForumCategory {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly topics: ForumTopic[];
}

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './forum-page.html',
  styleUrl: './forum-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumPage {
  readonly categories: ForumCategory[] = [
    {
      name: 'Règles & Aides de jeu',
      description:
        'Clarifications de règles, aides maison et retours d’expérience pour vos systèmes favoris.',
      icon: 'book',
      topics: [
        {
          title: 'Clarification sur la magie sauvage (D&D 5e)',
          author: 'Elara',
          replies: 12,
          lastAuthor: 'Victor',
          lastActivity: 'il y a 2 heures',
        },
        {
          title: 'Meilleures fiches de perso pour Cthulhu ?',
          author: 'Thomas',
          replies: 5,
          lastAuthor: 'Isabelle',
          lastActivity: 'il y a 8 heures',
        },
      ],
    },
    {
      name: 'Recherche de joueurs & groupes',
      description:
        'Publiez vos annonces pour trouver des MJ, des joueurs ou un groupe compatible.',
      icon: 'groups',
      topics: [
        {
          title: "[LFP][En ligne] Campagne 'Curse of Strahd'",
          author: 'Jack',
          replies: 25,
          lastAuthor: 'Aline',
          lastActivity: 'il y a 25 minutes',
        },
        {
          title: '[Table][Paris] Cherche 2 joueurs pour one-shot Cyberpunk',
          author: 'MJ-Paris',
          replies: 8,
          lastAuthor: 'Chloé',
          lastActivity: 'il y a 3 jours',
        },
      ],
    },
    {
      name: 'Discussions générales',
      description:
        'Parlez des sorties, partagez vos anecdotes et faites découvrir vos coups de cœur.',
      icon: 'chat',
      topics: [
        {
          title: 'Votre plus grand moment de roleplay ?',
          author: 'Aline',
          replies: 56,
          lastAuthor: 'Léo',
          lastActivity: 'il y a 5 minutes',
        },
        {
          title: 'Quel est le prochain JDR que vous voulez tester ?',
          author: 'Victor',
          replies: 34,
          lastAuthor: 'Élise',
          lastActivity: 'hier',
        },
      ],
    },
  ];
}
