/**
 * Model Payment Reminders Lambda
 *
 * Triggered by EventBridge (e.g., every 6 hours).
 * 1) Find matches with status='accepted' and no bookingId (payment pending)
 * 2) If request already booked by another model → move to waitlist
 * 3) Otherwise send payment reminder to model via notifications Lambda
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });
const NOTIFICATIONS_FUNCTION_NAME = process.env.NOTIFICATIONS_FUNCTION_NAME;

const PORTAL_URL = process.env.PORTAL_URL || 'https://app.modeledmanagement.com';

async function sendNotification(payload: {
  type: 'email' | 'sms' | 'both';
  template: string;
  recipient: { email?: string; phone?: string; name: string; userId?: string; userType?: string };
  data: Record<string, unknown>;
}) {
  if (!NOTIFICATIONS_FUNCTION_NAME) {
    console.warn('NOTIFICATIONS_FUNCTION_NAME not set - skipping');
    return;
  }
  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: NOTIFICATIONS_FUNCTION_NAME,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload),
    })
  );
}

export const handler: Handler = async (event: unknown) => {
  console.log('model-payment-reminders invoked', JSON.stringify(event));

  try {
    const { env } = await import('$amplify/env/model-payment-reminders');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();

    const { data: acceptedMatches } = await client.models.Match.list({
      filter: { status: { eq: 'accepted' } },
    });

    if (!acceptedMatches || acceptedMatches.length === 0) {
      return { ok: true, remindersSent: 0, movedToWaitlist: 0 };
    }

    let remindersSent = 0;
    let movedToWaitlist = 0;

    for (const match of acceptedMatches) {
      if (match.bookingId) continue; // Already has booking

      const { data: request } = await client.models.ModelRequest.get({ id: match.requestId });
      if (!request) continue;

      if (request.status === 'booked') {
        const { data: bookings } = await client.models.Booking.list({
          filter: { requestId: { eq: match.requestId } },
        });
        if (bookings && bookings.length > 0) {
          const waitlistCount = acceptedMatches.filter(
            (m: { bookingId?: string | null; requestId?: string }) => !m.bookingId && m.requestId === match.requestId
          ).length;
          await client.models.Match.update({
            id: match.id,
            status: 'waitlist',
            waitlistPosition: waitlistCount + 1,
          });
          movedToWaitlist++;
          continue;
        }
      }

      const { data: model } = await client.models.ModelProfile.get({ id: match.modelId });
      if (!model?.email) continue;

      const { data: professional } = await client.models.Professional.get({
        id: request.professionalId,
      });
      const amount = request.modelPayment ?? 25;
      const rawDate = request.requestedDate;
      const appointmentDate =
        typeof rawDate === 'string'
          ? rawDate.split('T')[0]
          : rawDate && typeof rawDate === 'object' && 'toISOString' in rawDate
            ? (rawDate as Date).toISOString().split('T')[0]
            : 'TBD';

      await sendNotification({
        type: 'email',
        template: 'payment_reminder',
        recipient: {
          email: model.email,
          phone: model.phone,
          name: `${model.firstName || ''} ${model.lastName || ''}`.trim() || 'Model',
          userId: model.userId,
          userType: 'model',
        },
        data: {
          matchId: match.id,
          serviceType: request.serviceType,
          appointmentDate,
          appointmentTime: request.requestedTime || '10:00 AM',
          amount: amount.toString(),
          professionalName: professional
            ? `${professional.firstName || ''} ${professional.lastName || ''}`.trim()
            : 'Professional',
          paymentLink: `${PORTAL_URL}/payment/${match.id}`,
        },
      });
      remindersSent++;
    }

    return {
      ok: true,
      remindersSent,
      movedToWaitlist,
    };
  } catch (error: unknown) {
    console.error('Model payment reminders error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      remindersSent: 0,
      movedToWaitlist: 0,
    };
  }
};
