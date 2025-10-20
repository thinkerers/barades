import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface HelpFaq {
  readonly category: string;
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './help-page.html',
  styleUrl: './help-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  searchTerm = '';

  readonly faqs: HelpFaq[] = [
    {
      category: 'Compte et profil',
      question: 'Comment modifier mon profil et mon avatar ?',
      answer:
        "Depuis le menu utilisateur, ouvrez la page 'Mon profil'. Vous pourrez y mettre à jour votre pseudonyme, votre biographie et téléverser un nouvel avatar.",
    },
    {
      category: 'Compte et profil',
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer:
        "Sur l'écran de connexion, cliquez sur 'Mot de passe oublié'. Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.",
    },
    {
      category: 'Trouver et gérer des parties',
      question: 'Comment créer une session de jeu ?',
      answer:
        "Ouvrez la page 'Trouver une partie' puis cliquez sur 'Créer une session'. Renseignez le système de jeu, la date, le lieu et le nombre de joueurs avant de publier.",
    },
    {
      category: 'Trouver et gérer des parties',
      question: 'Comment postuler à une partie ?',
      answer:
        "Depuis la fiche d'une session, appuyez sur 'Rejoindre'. Ajoutez un message de présentation pour aider le MJ à mieux vous connaître.",
    },
    {
      category: 'Groupes et communauté',
      question: 'Quelle est la différence entre un groupe et une session ?',
      answer:
        'Une session correspond à une partie ponctuelle. Un groupe rassemble des joueurs sur le long terme pour planifier plusieurs aventures ensemble.',
    },
    {
      category: 'Utilisation des outils',
      question: 'Le lanceur de dés est-il vraiment aléatoire ?',
      answer:
        "Oui, nous utilisons un générateur pseudo-aléatoire de haute qualité. Chaque lancer est aussi imprévisible qu'avec de vrais dés.",
    },
  ];

  get filteredFaqs(): HelpFaq[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.faqs;
    }

    return this.faqs.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term)
      );
    });
  }

  get hasResults(): boolean {
    return this.filteredFaqs.length > 0;
  }
}
