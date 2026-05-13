/**
 * Booking Reminders Lambda
 *
 * Triggered by EventBridge (e.g., hourly). Sends reminders 24h before appointments.
 * 1) Query bookings for tomorrow (status = confirmed)
 * 2) Send reminder to model and professional (email/SMS/in-app via notifications Lambda)
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });
const NOTIFICATIONS_FUNCTION_NAME = process.env.NOTIFICATIONS_FUNCTION_NAME;

/**
 * Get tomorrow's date as YYYY-MM-DD
 */
function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Invoke notifications Lambda with booking_reminder template
 */
async function sendReminder(payload: {
  type: 'email' | 'sms' | 'both';
  template: string;
  recipient: { email?: string; phone?: string; name: string; userId?: string; userType?: string };
  data: Record<string, unknown>;
}) {
  if (!NOTIFICATIONS_FUNCTION_NAME) {
    console.warn('NOTIFICATIONS_FUNCTION_NAME not set - skipping notification send');
    return;
  }
  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: NOTIFICATIONS_FUNCTION_NAME,
      InvocationType: 'Event', // Async
      Payload: JSON.stringify(payload),
    })
  );
}

export const handler: Handler = async (event: unknown) => {
  console.log('booking-reminders invoked', JSON.stringify(event));

  try {
    const { env } = await import('$amplify/env/booking-reminders');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();

    const tomorrow = getTomorrowDate();
    const { data: bookings } = await client.models.Booking.list({
      filter: {
        status: { eq: 'confirmed' },
        appointmentDate: { eq: tomorrow },
      },
    });

    if (!bookings || bookings.length === 0) {
      return { ok: true, processed: 0, note: `No bookings for ${tomorrow}` };
    }

    let sent = 0;
    for (const booking of bookings) {
      try {
        // Get model profile
        const { data: model } = await client.models.ModelProfile.get({ id: booking.modelId });
        if (!model?.email) continue;

        const data = {
          bookingId: booking.id,
          serviceType: booking.serviceType,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          location: booking.location,
          professionalName: '', // Filled below
        };

        // Send to model
        await sendReminder({
          type: 'email',
          template: 'booking_reminder',
          recipient: {
            email: model.email,
            phone: model.phone,
            name: `${model.firstName || ''} ${model.lastName || ''}`.trim() || 'Model',
            userId: model.userId,
            userType: 'model',
          },
          data,
        });
        sent++;

        // Get professional and send reminder
        const { data: professional } = await client.models.Professional.get({
          id: booking.professionalId,
        });
        if (professional?.email) {
          data.professionalName = `${professional.firstName || ''} ${professional.lastName || ''}`.trim();
          await sendReminder({
            type: 'email',
            template: 'booking_reminder',
            recipient: {
              email: professional.email,
              phone: professional.phone,
              name: `${professional.firstName || ''} ${professional.lastName || ''}`.trim() || 'Professional',
              userId: professional.userId,
              userType: 'professional',
            },
            data: { ...data, professionalName: data.professionalName },
          });
          sent++;
        }
      } catch (err: unknown) {
        console.error('Error sending reminder for booking', booking.id, err);
      }
    }

    return {
      ok: true,
      processed: bookings.length,
      remindersSent: sent,
      date: tomorrow,
    };
  } catch (error: unknown) {
    console.error('Booking reminders error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processed: 0,
    };
  }
};
