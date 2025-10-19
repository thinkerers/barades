import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface PartnerHighlight {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface PartnerProfile {
  readonly icon: string;
  readonly title: string;
  readonly details: string;
}

@Component({
  selector: 'app-partner-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './partner-page.html',
  styleUrl: './partner-page.css',
})
export class PartnerPage {
  private readonly fb = inject(FormBuilder);

  readonly highlights: PartnerHighlight[] = [
    {
      icon: 'visibility',
      title: 'Visibilité accrue',
      description:
        'Présentez votre établissement, association ou boutique à des milliers de rôlistes actifs.',
    },
    {
      icon: 'group',
      title: 'Nouveaux clients',
      description:
        'Attirez un public ciblé à la recherche de lieux pour organiser leurs campagnes et rencontres.',
    },
    {
      icon: 'event',
      title: "Organisation d'événements",
      description:
        'Promouvez vos soirées thématiques, tournois et ateliers directement auprès de la communauté.',
    },
  ];

  readonly profiles: PartnerProfile[] = [
    {
      icon: 'sports_esports',
      title: 'Bars à jeux et cafés ludiques',
      details:
        'Devenez le QG des rôlistes de votre ville et remplissez vos tables en soirée.',
    },
    {
      icon: 'storefront',
      title: 'Boutiques spécialisées',
      details:
        'Mettez en avant votre sélection de jeux, accessoires et services aux MJ.',
    },
    {
      icon: 'home',
      title: 'Associations et clubs',
      details:
        'Gagnez en visibilité, recrutez de nouveaux membres et centralisez vos inscriptions.',
    },
    {
      icon: 'mic_external_on',
      title: 'Créateurs et éditeurs',
      details:
        'Collaborez pour lancer des scénarios exclusifs, actual plays et campagnes sponsorisées.',
    },
  ];

  readonly partnerForm: FormGroup = this.fb.group({
    organization: ['', [Validators.required, Validators.minLength(2)]],
    contactName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitted = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.partnerForm.invalid) {
      this.errorMessage = 'Veuillez compléter les champs requis.';
      return;
    }

    const payload = this.partnerForm.value;
    console.log('[PartnerPage] Partnership request', payload);

    this.successMessage =
      'Merci pour votre message ! Nous revenons vers vous sous 48 heures.';
    this.partnerForm.reset();
    this.submitted = false;
  }

  get organization() {
    return this.partnerForm.get('organization');
  }

  get contactName() {
    return this.partnerForm.get('contactName');
  }

  get email() {
    return this.partnerForm.get('email');
  }

  get message() {
    return this.partnerForm.get('message');
  }
}
