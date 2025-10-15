# Email Module - Barades

## 📧 Vue d'ensemble

Module NestJS pour l'envoi d'emails transactionnels via **Resend.com**.

### Emails implémentés

1. **Confirmation de réservation** - Envoyé au participant après inscription
2. **Notification hôte** - Informe l'organisateur d'une nouvelle inscription
3. **Rappel 24h** - Rappel envoyé la veille de la session

## 🚀 Configuration

### 1. Obtenir une clé API Resend

1. Créer un compte gratuit sur [resend.com](https://resend.com)
2. Générer une clé API dans [Dashboard > API Keys](https://resend.com/api-keys)
3. Ajouter la clé dans votre fichier `.env` :

```bash
RESEND_API_KEY="re_votre_cle_api_ici"
```

### 2. Limites du tier gratuit

- ✅ **3,000 emails/mois**
- ✅ **100 emails/jour**
- ✅ Pas de carte bancaire requise
- ✅ Support TypeScript complet

## 💻 Utilisation

### Dans un service NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService, ReservationEmailData } from '../email/email.service';

@Injectable()
export class ReservationsService {
  constructor(private readonly emailService: EmailService) {}

  async createReservation(userId: string, sessionId: string) {
    // ... logique de création de réservation ...

    // Préparer les données
    const emailData: ReservationEmailData = {
      userName: 'Alice Dupont',
      userEmail: 'alice@example.com',
      sessionTitle: 'Soirée Catan',
      sessionDate: new Date('2025-10-20T19:00:00'),
      locationName: 'Café des Jeux',
      locationAddress: 'Rue de la Paix 42, 1000 Bruxelles',
      hostName: 'Bob Martin',
      hostEmail: 'bob@example.com',
      groupName: 'Les Stratèges',
    };

    // Envoyer les emails
    await Promise.all([
      this.emailService.sendReservationConfirmation(emailData),
      this.emailService.sendHostNotification(emailData),
    ]);

    return reservation;
  }
}
```

### Tester l'envoi d'emails

Le service gère automatiquement l'absence de clé API :

```typescript
// En développement sans RESEND_API_KEY
// → Les emails ne sont pas envoyés, mais aucune erreur n'est levée
// → Un log warning est affiché dans la console
```

## 🔄 Évolution future : Mailcoach

### Pourquoi Mailcoach ?

[Mailcoach](https://mailcoach.app) est une solution belge développée par **Spatie** (Anvers) :

- 🇧🇪 **Entreprise belge** - soutien à l'écosystème tech local
- 🔒 **RGPD natif** - données hébergées en Europe
- 📊 **Analytics avancés** - tracking des ouvertures, clics, bounces
- 🎨 **Éditeur de templates** - design d'emails en visuel
- 🤖 **Automation** - workflows et séquences d'emails
- ✅ **Compatible Resend** - peut utiliser Resend comme provider

### Architecture de migration

```
Phase 1 (TFE - actuelle)
┌─────────────────────┐
│   NestJS Backend    │
│   EmailService      │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │   Resend    │  ← API directe
    └─────────────┘

Phase 2 (Production future)
┌─────────────────────┐
│   NestJS Backend    │
│   EmailService      │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │  Mailcoach   │  ← Interface + Analytics
    └──────┬───────┘
           │
           ▼
    ┌─────────────┐
    │   Resend    │  ← Moteur d'envoi (inchangé)
    └─────────────┘
```

### Avantages de cette approche

1. **Pas de refonte du code** - Resend reste le moteur d'envoi
2. **Ajout progressif de features** - Templates, analytics, automation
3. **Coût maîtrisé** - Gratuit pendant le TFE, investissement en production
4. **Argument académique fort** - Vision d'évolution avec partenaire local

### Pricing Mailcoach

- **Self-hosted** : 99€/an (serveur requis)
- **Cloud** : à partir de 17€/mois (hébergement inclus)
- **Resend** : toujours gratuit jusqu'à 3k emails/mois

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Mailcoach](https://mailcoach.app)
- [Spatie (créateurs de Mailcoach)](https://spatie.be)
- [Guide intégration Mailcoach + Resend](https://mailcoach.app/docs/app/mail-configuration/resend)

## 🧪 Tests

Les templates d'emails sont testables en envoyant des emails de test :

```bash
# Via l'API Resend directement
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "test@barades.app",
    "to": "votre-email@example.com",
    "subject": "Test Barades",
    "html": "<p>Email de test</p>"
  }'
```

## 🎨 Templates

Les templates utilisent :

- **HTML inline CSS** - compatibilité maximale avec les clients email
- **Design responsive** - adapté mobile et desktop
- **Gradient Barades** - `#667eea` → `#764ba2`
- **Format date belge** - Format `fr-BE` avec timezone Europe/Brussels

### Personnalisation

Pour modifier un template, éditer la méthode correspondante dans `email.service.ts` :

- `getReservationConfirmationTemplate()`
- `getHostNotificationTemplate()`
- `getSessionReminderTemplate()`
