/**
 * Chat Activation Lambda
 *
 * Triggered by EventBridge (e.g., every 15 minutes).
 * For ModelToProChat: opens 1h before appointment, closes 1h after.
 * Creates chat records for upcoming bookings and activates/deactivates based on time.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

export const handler: Handler = async (event: unknown) => {
  console.log('chat-activation invoked', JSON.stringify(event));

  try {
    const { env } = await import('$amplify/env/chat-activation');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: bookings } = await client.models.Booking.list({
      filter: { status: { eq: 'confirmed' } },
    });

    if (!bookings || bookings.length === 0) {
      return { ok: true, activatedChats: 0, createdChats: 0, closedChats: 0 };
    }

    let activatedChats = 0;
    let createdChats = 0;
    let closedChats = 0;

    for (const booking of bookings) {
      const rawDate = booking.appointmentDate;
      const rawTime = (booking.appointmentTime || '10:00').toString().replace(/\s*(AM|PM)/i, '');
      const dateStr =
        typeof rawDate === 'string'
          ? rawDate.split('T')[0]
          : rawDate && typeof rawDate === 'object' && 'toISOString' in rawDate
            ? (rawDate as Date).toISOString().split('T')[0]
            : null;
      if (!dateStr) continue;

      const parts = rawTime.split(':');
      const hours = parseInt(parts[0] || '10', 10) % 24;
      const mins = parseInt(parts[1] || '0', 10) % 60;
      const appointmentStart = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`);
      const chatOpensAt = new Date(appointmentStart.getTime() - 60 * 60 * 1000);
      const chatClosesAt = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

      const { data: existingChats } = await client.models.ModelToProChat.list({
        filter: { bookingId: { eq: booking.id } },
      });

      let chat = existingChats?.[0];

      if (!chat) {
        if (appointmentStart <= twentyFourHoursFromNow) {
          const { data: created } = await client.models.ModelToProChat.create({
            bookingId: booking.id,
            modelId: booking.modelId,
            professionalId: booking.professionalId,
            chatOpensAt: chatOpensAt.toISOString(),
            chatClosesAt: chatClosesAt.toISOString(),
            isActive: now >= chatOpensAt && now <= chatClosesAt,
            status: now >= chatOpensAt && now <= chatClosesAt ? 'active' : now > chatClosesAt ? 'closed' : 'pending',
          });
          if (created) chat = created;
          createdChats++;
          if (chat?.isActive) activatedChats++;
        }
        continue;
      }

      if (now > chatClosesAt && chat.status !== 'closed') {
        await client.models.ModelToProChat.update({
          id: chat.id,
          isActive: false,
          status: 'closed',
        });
        closedChats++;
      } else if (now >= chatOpensAt && now <= chatClosesAt && !chat.isActive) {
        await client.models.ModelToProChat.update({
          id: chat.id,
          isActive: true,
          status: 'active',
        });
        activatedChats++;
      }
    }

    return {
      ok: true,
      activatedChats,
      createdChats,
      closedChats,
    };
  } catch (error: unknown) {
    console.error('Chat activation error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      activatedChats: 0,
      createdChats: 0,
      closedChats: 0,
    };
  }
};
