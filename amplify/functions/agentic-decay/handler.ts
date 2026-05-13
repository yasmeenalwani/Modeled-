/**
 * Agentic Decay Lambda Function
 *
 * Monthly job to apply inactivity decay to model agentic scores.
 * Models with lastActiveDate older than threshold get reliability, engagement,
 * compatibility decayed. Experience and feedback do not decay.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

const IDLE_DAYS = parseInt(process.env.IDLE_DAYS_THRESHOLD || '60', 10);
const RELIABILITY_DECAY = parseFloat(process.env.RELIABILITY_DECAY || '0.95');
const ENGAGEMENT_DECAY = parseFloat(process.env.ENGAGEMENT_DECAY || '0.95');
const COMPATIBILITY_DECAY = parseFloat(process.env.COMPATIBILITY_DECAY || '0.96');

export const handler: Handler = async (event: unknown) => {
  console.log('Agentic decay job started:', new Date().toISOString());

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - IDLE_DAYS);
    const cutoffIso = cutoff.toISOString();

    const { env } = await import('$amplify/env/agentic-decay');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();

    const { data: profiles } = await client.models.ModelProfile.list({});
    if (!profiles || profiles.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ success: true, decayedCount: 0 }) };
    }

    const idleProfiles = profiles.filter((p) => {
      const lastActive = p.lastActiveDate;
      if (!lastActive) return true; // No activity = treat as idle
      return new Date(lastActive) < cutoff;
    });

    let decayedCount = 0;
    for (const profile of idleProfiles) {
      const scores = (profile.agenticScores as Record<string, number>) || {};
      const reliability = scores.reliability ?? profile.reliabilityScore ?? 85;
      const engagement = scores.engagement ?? profile.engagementScore ?? 80;
      const compatibility = scores.compatibility ?? profile.compatibilityScore ?? 82;

      const updated = {
        ...scores,
        reliability: Math.max(40, Math.round(reliability * RELIABILITY_DECAY)),
        engagement: Math.max(20, Math.round(engagement * ENGAGEMENT_DECAY)),
        compatibility: Math.max(45, Math.round(compatibility * COMPATIBILITY_DECAY)),
      };

      try {
        await client.models.ModelProfile.update({
          id: profile.id,
          agenticScores: updated,
          reliabilityScore: updated.reliability,
          engagementScore: updated.engagement,
          compatibilityScore: updated.compatibility,
        });
        decayedCount++;
      } catch (err: unknown) {
        console.error(`Error decaying profile ${profile.id}:`, err);
      }
    }

    console.log(`Decayed ${decayedCount} of ${idleProfiles.length} idle profiles`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        decayedCount,
        idleCount: idleProfiles.length,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error('Agentic decay error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
