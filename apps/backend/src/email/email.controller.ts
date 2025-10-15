import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

interface TestEmailDto {
  recipientEmail: string;
  recipientName?: string;
}

/**
 * Contrôleur de test pour l'envoi d'emails
 * 
 * À SUPPRIMER EN PRODUCTION - Pour tests uniquement
 */
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * POST /email/test/confirmation
   * 
   * Envoie un email de confirmation de réservation de test
   * 
   * Body: { recipientEmail: string, recipientName?: string }
   */
  @Post('test/confirmation')
  async testConfirmation(@Body() dto: TestEmailDto) {
    this.logger.log(`Testing confirmation email to ${dto.recipientEmail}`);

    const testData = {
      userName: dto.recipientName || 'Test User',
      userEmail: dto.recipientEmail,
      sessionTitle: 'Soirée Catan - Session de test',
      sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      locationName: 'Café des Jeux (Test)',
      locationAddress: 'Rue de la Paix 42, 1000 Bruxelles',
      hostName: 'Alice Dupont',
      hostEmail: 'alice@example.com',
      groupName: 'Les Stratèges de Bruxelles',
    };

    try {
      await this.emailService.sendReservationConfirmation(testData);
      return {
        success: true,
        message: `Email de confirmation envoyé à ${dto.recipientEmail}`,
        data: testData,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error}`);
      return {
        success: false,
        message: `Erreur lors de l'envoi : ${error}`,
      };
    }
  }

  /**
   * POST /email/test/host-notification
   * 
   * Envoie une notification hôte de test
   * 
   * Body: { recipientEmail: string, recipientName?: string }
   */
  @Post('test/host-notification')
  async testHostNotification(@Body() dto: TestEmailDto) {
    this.logger.log(`Testing host notification to ${dto.recipientEmail}`);

    const testData = {
      userName: 'Bob Martin', // Le nouveau participant
      userEmail: 'bob@example.com',
      sessionTitle: 'Soirée Carcassonne - Session de test',
      sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
      locationName: 'Le Dé à Jouer (Test)',
      locationAddress: 'Avenue Louise 123, 1050 Bruxelles',
      hostName: dto.recipientName || 'Test Host', // L'hôte qui reçoit l'email
      hostEmail: dto.recipientEmail,
      groupName: 'Les Amis du Jeu',
    };

    try {
      await this.emailService.sendHostNotification(testData);
      return {
        success: true,
        message: `Notification hôte envoyée à ${dto.recipientEmail}`,
        data: testData,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error}`);
      return {
        success: false,
        message: `Erreur lors de l'envoi : ${error}`,
      };
    }
  }

  /**
   * POST /email/test/reminder
   * 
   * Envoie un rappel de session de test
   * 
   * Body: { recipientEmail: string, recipientName?: string }
   */
  @Post('test/reminder')
  async testReminder(@Body() dto: TestEmailDto) {
    this.logger.log(`Testing reminder email to ${dto.recipientEmail}`);

    const testData = {
      userName: dto.recipientName || 'Test User',
      userEmail: dto.recipientEmail,
      sessionTitle: 'Soirée 7 Wonders - Session de test',
      sessionDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      locationName: 'Chez Christine (Test)',
      locationAddress: 'Place Flagey 1, 1050 Ixelles',
      hostName: 'Christine Leroy',
      hostEmail: 'christine@example.com',
      groupName: 'Board Games Addicts',
    };

    try {
      await this.emailService.sendSessionReminder(testData);
      return {
        success: true,
        message: `Rappel envoyé à ${dto.recipientEmail}`,
        data: testData,
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error}`);
      return {
        success: false,
        message: `Erreur lors de l'envoi : ${error}`,
      };
    }
  }

  /**
   * POST /email/test/all
   * 
   * Envoie les 3 types d'emails à l'adresse fournie
   * 
   * Body: { recipientEmail: string, recipientName?: string }
   */
  @Post('test/all')
  async testAll(@Body() dto: TestEmailDto) {
    this.logger.log(`Testing all email types to ${dto.recipientEmail}`);

    const results = await Promise.allSettled([
      this.testConfirmation(dto),
      this.testHostNotification(dto),
      this.testReminder(dto),
    ]);

    return {
      success: true,
      message: `Envoi des 3 emails terminé`,
      results: results.map((r, i) => ({
        type: ['confirmation', 'host-notification', 'reminder'][i],
        status: r.status,
        result: r.status === 'fulfilled' ? r.value : r.reason,
      })),
    };
  }
}
