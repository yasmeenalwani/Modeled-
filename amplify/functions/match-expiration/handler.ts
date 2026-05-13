/**
 * Match Expiration Lambda Function
 *
 * Scheduled job to expire matches that haven't been responded to.
 * Runs daily to check for matches with status 'sent' older than expiration threshold.
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

export const handler: Handler = async (event: unknown) => {
  console.log('Match expiration job started:', new Date().toISOString());

  try {
    const expirationHours = parseInt(process.env.MATCH_EXPIRATION_HOURS || '48', 10);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - expirationHours);

    const { env } = await import('$amplify/env/match-expiration');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();

    const { data: sentMatches } = await client.models.Match.list({
      filter: { status: { eq: 'sent' } },
    });

    if (!sentMatches || sentMatches.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          expiredCount: 0,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    const expiredMatches: string[] = [];
    for (const match of sentMatches) {
      if (!match.sentAt) continue;
      const sentDate = new Date(match.sentAt);
      if (sentDate >= expirationTime) continue;

      try {
        await client.models.Match.update({
          id: match.id,
          status: 'expired',
          respondedAt: new Date().toISOString(),
        });
        expiredMatches.push(match.id);
      } catch (err: unknown) {
        console.error(`Error expiring match ${match.id}:`, err);
      }
    }

    console.log(`Expired ${expiredMatches.length} matches`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        expiredCount: expiredMatches.length,
        expiredIds: expiredMatches,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error('Match expiration error:', error);
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
