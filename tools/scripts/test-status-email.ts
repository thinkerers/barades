/**
 * Script de test pour l'email de notification de statut de réservation
 * Usage: npx tsx tools/scripts/test-status-email.ts [confirmed|rejected]
 * 
 * Ce script utilise les templates partagés de email-templates.ts
 * pour garantir la cohérence avec le code de production.
 */
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  ReservationStatusEmailData,
  formatDateFrBE,
  getReservationStatusTemplate,
} from '../../apps/backend/src/email/email-templates';

// Charger les variables d'environnement depuis apps/backend/.env
dotenv.config({ path: path.join(__dirname, '../../apps/backend/.env') });

const resend = new Resend(process.env['RESEND_API_KEY']);

function getFromAddress(): string {
  return process.env['RESEND_FROM_EMAIL'] || 'Barades <onboarding@resend.dev>';
}

async function sendTestEmail(status: 'CONFIRMED' | 'CANCELLED') {
  const testData: ReservationStatusEmailData = {
    userName: 'Théophile',
    userEmail: 'theophiledesmedt@gmail.com',
    sessionTitle: 'Soirée Catan & Compagnie',
    sessionDate: new Date('2026-01-15T19:00:00'),
    locationName: 'Le Cercle des Joueurs',
    locationAddress: 'Rue de la Montagne 42, 1000 Bruxelles',
    hostName: 'Alice DM',
    status,
  };

  const formattedDate = formatDateFrBE(testData.sessionDate);

  const isConfirmed = status === 'CONFIRMED';
  const subject = isConfirmed
    ? `✅ Votre réservation a été confirmée - ${testData.sessionTitle}`
    : `❌ Votre réservation a été refusée - ${testData.sessionTitle}`;

  console.log(`📧 Envoi d'un email de ${isConfirmed ? 'CONFIRMATION' : 'REJET'}...`);
  console.log(`   To: ${testData.userEmail}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   From: ${getFromAddress()}`);

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: [testData.userEmail],
      subject,
      html: getReservationStatusTemplate(testData, formattedDate),
    });

    console.log('\n✅ Email envoyé avec succès !');
    console.log('   ID:', result.data?.id);
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'envoi:', error);
    process.exit(1);
  }
}

// Récupérer l'argument (confirmed ou rejected)
const arg = process.argv[2]?.toLowerCase();
const status: 'CONFIRMED' | 'CANCELLED' = arg === 'rejected' ? 'CANCELLED' : 'CONFIRMED';

sendTestEmail(status);
