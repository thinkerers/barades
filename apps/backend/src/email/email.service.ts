import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  ReservationEmailData,
  ReservationStatusEmailData,
  formatDateFrBE,
  getReservationConfirmationTemplate,
  getHostNotificationTemplate,
  getSessionReminderTemplate,
  getReservationStatusTemplate,
} from './email-templates';

// Re-export les types pour les autres modules
export { ReservationEmailData, ReservationStatusEmailData } from './email-templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured - emails will not be sent'
      );
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Retourne l'adresse email à utiliser comme expéditeur
   * Utilise onboarding@resend.dev en développement si le domaine n'est pas vérifié
   */
  private getFromAddress(): string {
    // Pour tester immédiatement avant que le DNS se propage
    return (
      process.env['RESEND_FROM_EMAIL'] || 'Barades <onboarding@resend.dev>'
    );
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
      const formattedDate = formatDateFrBE(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.userEmail],
        subject: `✅ Réservation confirmée - ${data.sessionTitle}`,
        html: getReservationConfirmationTemplate(data, formattedDate),
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
      const formattedDate = formatDateFrBE(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.hostEmail],
        subject: `📬 Nouveau participant - ${data.sessionTitle}`,
        html: getHostNotificationTemplate(data, formattedDate),
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
      const formattedDate = formatDateFrBE(data.sessionDate);

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.userEmail],
        subject: `⏰ Rappel - Session demain : ${data.sessionTitle}`,
        html: getSessionReminderTemplate(data, formattedDate),
      });

      this.logger.log(`Reminder email sent to ${data.userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder email: ${error}`);
      throw error;
    }
  }

  /**
   * Envoie une notification à l'utilisateur quand le statut de sa réservation change
   */
  async sendReservationStatusUpdate(
    data: ReservationStatusEmailData
  ): Promise<void> {
    if (!process.env['RESEND_API_KEY']) {
      this.logger.warn('Skipping status email send - no API key configured');
      return;
    }

    try {
      const formattedDate = formatDateFrBE(data.sessionDate);

      const isConfirmed = data.status === 'CONFIRMED';
      const subject = isConfirmed
        ? `✅ Votre réservation a été confirmée - ${data.sessionTitle}`
        : `❌ Votre réservation a été refusée - ${data.sessionTitle}`;

      await this.resend.emails.send({
        from: this.getFromAddress(),
        to: [data.userEmail],
        subject,
        html: getReservationStatusTemplate(data, formattedDate),
      });

      this.logger.log(`Status notification email sent to ${data.userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send status notification email: ${error}`);
      throw error;
    }
  }
}
