import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface ReservationEmailData {
  userName: string;
  userEmail: string;
  sessionTitle: string;
  sessionDate: Date;
  locationName: string;
  locationAddress: string;
  hostName: string;
  hostEmail: string;
  groupName: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will not be sent');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Retourne l'adresse email à utiliser comme expéditeur
   * Utilise onboarding@resend.dev en développement si le domaine n'est pas vérifié
   */
  private getFromAddress(): string {
    // Pour tester immédiatement avant que le DNS se propage
    return process.env['RESEND_FROM_EMAIL'] || 'Barades <onboarding@resend.dev>';
  }

  /**
   * Envoie un email de confirmation de réservation au participant
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<void> {
    if (!process.env['RESEND_API_KEY']) {
      this.logger.warn('Skipping email send - no API key configured');
      return;
    }

    try {
      const formattedDate = new Intl.DateTimeFormat('fr-BE', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/Brussels',
      }).format(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.userEmail], // Tableau requis par Resend
        subject: `✅ Réservation confirmée - ${data.sessionTitle}`,
        html: this.getReservationConfirmationTemplate(data, formattedDate),
      });

      this.logger.log(`Confirmation email sent to ${data.userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email: ${error}`);
      throw error;
    }
  }

  /**
   * Envoie une notification à l'hôte qu'un nouveau participant s'est inscrit
   */
  async sendHostNotification(data: ReservationEmailData): Promise<void> {
    if (!process.env['RESEND_API_KEY']) {
      this.logger.warn('Skipping email send - no API key configured');
      return;
    }

    try {
      const formattedDate = new Intl.DateTimeFormat('fr-BE', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/Brussels',
      }).format(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.hostEmail], // Tableau requis par Resend
        subject: `📬 Nouveau participant - ${data.sessionTitle}`,
        html: this.getHostNotificationTemplate(data, formattedDate),
      });

      this.logger.log(`Host notification sent to ${data.hostEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send host notification: ${error}`);
      throw error;
    }
  }

  /**
   * Envoie un rappel 24h avant la session
   */
  async sendSessionReminder(data: ReservationEmailData): Promise<void> {
    if (!process.env['RESEND_API_KEY']) {
      this.logger.warn('Skipping email send - no API key configured');
      return;
    }

    try {
      const formattedDate = new Intl.DateTimeFormat('fr-BE', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/Brussels',
      }).format(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.userEmail], // Tableau requis par Resend
        subject: `⏰ Rappel - Session demain : ${data.sessionTitle}`,
        html: this.getSessionReminderTemplate(data, formattedDate),
      });

      this.logger.log(`Reminder email sent to ${data.userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder email: ${error}`);
      throw error;
    }
  }

  private getReservationConfirmationTemplate(
    data: ReservationEmailData,
    formattedDate: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎲 Barades</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre réservation est confirmée !</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>${data.userName}</strong>,</p>
    
    <p>Votre réservation pour la session <strong>"${data.sessionTitle}"</strong> a bien été enregistrée !</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">📅 Détails de la session</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">📆 Date</td>
          <td style="padding: 8px 0;"><strong>${formattedDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">📍 Lieu</td>
          <td style="padding: 8px 0;"><strong>${data.locationName}</strong><br/><small>${data.locationAddress}</small></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">👥 Groupe</td>
          <td style="padding: 8px 0;"><strong>${data.groupName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">🎯 Organisateur</td>
          <td style="padding: 8px 0;"><strong>${data.hostName}</strong></td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #2e7d32;">
        <strong>💡 Conseil :</strong> Pensez à vérifier la météo et à préparer vos jeux favoris !
      </p>
    </div>
    
    <p style="margin-top: 30px;">À très bientôt pour cette partie,</p>
    <p style="color: #667eea; font-weight: bold; margin-bottom: 0;">L'équipe Barades</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    <p style="margin-top: 10px;">
      <strong>Vision future :</strong> Propulsé par Resend, évolution vers Mailcoach (solution belge) pour la production.
    </p>
  </div>
</body>
</html>
    `;
  }

  private getHostNotificationTemplate(
    data: ReservationEmailData,
    formattedDate: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau participant</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎲 Barades</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Nouveau participant inscrit !</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>${data.hostName}</strong>,</p>
    
    <p>Bonne nouvelle ! <strong>${data.userName}</strong> vient de s'inscrire à votre session :</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">📋 Informations de la session</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">🎮 Session</td>
          <td style="padding: 8px 0;"><strong>${data.sessionTitle}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">📆 Date</td>
          <td style="padding: 8px 0;"><strong>${formattedDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">👥 Nouveau participant</td>
          <td style="padding: 8px 0;"><strong>${data.userName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">📍 Lieu</td>
          <td style="padding: 8px 0;"><strong>${data.locationName}</strong></td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #e65100;">
        <strong>📝 Action requise :</strong> Pensez à contacter ${data.userName} pour coordonner les détails de la session.
      </p>
    </div>
    
    <p style="margin-top: 30px;">Bonne organisation,</p>
    <p style="color: #667eea; font-weight: bold; margin-bottom: 0;">L'équipe Barades</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
  </div>
</body>
</html>
    `;
  }

  private getSessionReminderTemplate(
    data: ReservationEmailData,
    formattedDate: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de session</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎲 Barades</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">⏰ Rappel : Session demain !</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>${data.userName}</strong>,</p>
    
    <p>Votre session de jeu approche ! N'oubliez pas votre rendez-vous demain :</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">📅 Rappel de session</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">🎮 Session</td>
          <td style="padding: 8px 0;"><strong>${data.sessionTitle}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">📆 Date</td>
          <td style="padding: 8px 0;"><strong>${formattedDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">📍 Lieu</td>
          <td style="padding: 8px 0;"><strong>${data.locationName}</strong><br/><small>${data.locationAddress}</small></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">🎯 Organisateur</td>
          <td style="padding: 8px 0;"><strong>${data.hostName}</strong></td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #0d47a1;">
        <strong>✅ Checklist avant de partir :</strong>
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #0d47a1;">
        <li>Vérifier l'adresse et le trajet</li>
        <li>Préparer vos jeux favoris (si applicable)</li>
        <li>Confirmer votre présence à l'organisateur si besoin</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px;">On vous souhaite une excellente partie,</p>
    <p style="color: #667eea; font-weight: bold; margin-bottom: 0;">L'équipe Barades</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
  </div>
</body>
</html>
    `;
  }
}
