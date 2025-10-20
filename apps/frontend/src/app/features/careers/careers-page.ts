import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface JobOpening {
  readonly title: string;
  readonly location: string;
  readonly contract: string;
  readonly description: string;
  readonly emailSubject: string;
  readonly ctaLabel: string;
}

interface Highlight {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-careers-page',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './careers-page.html',
  styleUrl: './careers-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersPage {
  private readonly applicationEmail = 'talents@barades.com';

  readonly jobOpenings: JobOpening[] = [
    {
      title: 'Développeur·se Full-Stack',
      location: 'Tournai, Belgique (Hybride)',
      contract: 'Temps plein',
      description:
        "Rejoignez l'équipe produit pour construire une expérience fluide entre les applications web, mobiles et les APIs.",
      emailSubject: 'Candidature – Développeur·se Full-Stack',
      ctaLabel: 'Postuler',
    },
    {
      title: 'Community Manager (FR)',
      location: 'Télétravail',
      contract: 'Temps plein',
      description:
        'Animez la communauté francophone, créez du contenu et organisez des évènements en ligne pour les rôlistes.',
      emailSubject: 'Candidature – Community Manager',
      ctaLabel: 'Postuler',
    },
    {
      title: 'Maître de Jeu & Créateur de Contenu',
      location: 'Télétravail',
      contract: 'Freelance / Partenariat',
      description:
        'Partagez vos campagnes actual play, écrivez des scénarios exclusifs et accompagnez nos partenaires lors d’événements.',
      emailSubject: 'Candidature – MJ & Créateur de Contenu',
      ctaLabel: 'Proposer un partenariat',
    },
  ];

  readonly highlights: Highlight[] = [
    {
      icon: 'emoji_events',
      title: 'Impact direct',
      description:
        'Votre travail aide des milliers de joueurs à créer des souvenirs autour de la table.',
    },
    {
      icon: 'groups',
      title: 'Culture passionnée',
      description:
        'Travaillez avec une équipe curieuse, bienveillante et experte en jeux de rôle.',
    },
    {
      icon: 'workspace_premium',
      title: 'Avantages uniques',
      description:
        'Budget matériel JDR, horaires flexibles et événements réguliers avec la communauté.',
    },
  ];

  readonly values: Highlight[] = [
    {
      icon: 'auto_awesome',
      title: 'Créativité',
      description:
        'Nous expérimentons souvent et nous itérons rapidement pour livrer des fonctionnalités utiles.',
    },
    {
      icon: 'favorite',
      title: 'Bienveillance',
      description:
        'Une équipe soudée qui prend soin des joueurs, des partenaires et des collaborateurs.',
    },
    {
      icon: 'map',
      title: 'Autonomie guidée',
      description:
        'Chaque membre est responsable de son périmètre tout en s’appuyant sur des objectifs clairs.',
    },
  ];

  buildMailto(subject: string): string {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(
      'Bonjour Bar à Dés,\n\nJe souhaite rejoindre votre équipe. Voici un aperçu rapide de mon profil :\n- Expérience : \n- Projets marquants : \n- Liens (portfolio, GitHub, actual play) : \n\nAu plaisir de discuter avec vous !'
    );

    return `mailto:${this.applicationEmail}?subject=${encodedSubject}&body=${encodedBody}`;
  }
}
