import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Exemple d'utilisation du EmailService
 * 
 * Ce fichier montre comment intégrer l'envoi d'emails
 * dans votre logique métier (réservations, groupes, etc.)
 */
@Injectable()
export class EmailIntegrationExample {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Exemple : Envoyer les emails lors d'une nouvelle réservation
   */
  async onReservationCreated(
    reservation: {
      userId: string;
      sessionId: string;
    },
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    },
    session: {
      id: string;
      title: string;
      date: Date;
      hostId: string;
      locationId: string;
      groupId: string;
    },
    location: {
      id: string;
      name: string;
      address: string;
      city: string;
      postalCode: string;
    },
    host: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    },
    group: {
      id: string;
      name: string;
    }
  ) {
    const emailData = {
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      sessionTitle: session.title,
      sessionDate: session.date,
      locationName: location.name,
      locationAddress: `${location.address}, ${location.postalCode} ${location.city}`,
      hostName: `${host.firstName} ${host.lastName}`,
      hostEmail: host.email,
      groupName: group.name,
    };

    // Envoyer les deux emails en parallèle
    await Promise.all([
      this.emailService.sendReservationConfirmation(emailData),
      this.emailService.sendHostNotification(emailData),
    ]);
  }

  /**
   * Exemple : Tâche CRON pour envoyer les rappels 24h avant
   * 
   * À implémenter avec @nestjs/schedule :
   * 
   * @Cron('0 9 * * *') // Tous les jours à 9h
   * async sendDailyReminders() {
   *   const tomorrow = new Date();
   *   tomorrow.setDate(tomorrow.getDate() + 1);
   *   
   *   const sessionsToRemind = await this.prisma.session.findMany({
   *     where: {
   *       date: {
   *         gte: tomorrow,
   *         lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
   *       }
   *     },
   *     include: { reservations: { include: { user: true } } }
   *   });
   *   
   *   for (const session of sessionsToRemind) {
   *     for (const reservation of session.reservations) {
   *       await this.sendReminder(session, reservation.user);
   *     }
   *   }
   * }
   */
  async sendReminder(
    session: {
      id: string;
      title: string;
      date: Date;
      locationId: string;
      hostId: string;
      groupId: string;
    },
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  ) {
    // Charger les données nécessaires depuis la DB
    // const location = await this.prisma.location.findUnique({ where: { id: session.locationId } });
    // const host = await this.prisma.user.findUnique({ where: { id: session.hostId } });
    // const group = await this.prisma.group.findUnique({ where: { id: session.groupId } });

    const emailData = {
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      sessionTitle: session.title,
      sessionDate: session.date,
      locationName: 'Nom du lieu', // location.name
      locationAddress: 'Adresse complète', // `${location.address}, ...`
      hostName: 'Nom de l\'hôte', // `${host.firstName} ${host.lastName}`
      hostEmail: 'email@hote.com', // host.email
      groupName: 'Nom du groupe', // group.name
    };

    await this.emailService.sendSessionReminder(emailData);
  }
}
