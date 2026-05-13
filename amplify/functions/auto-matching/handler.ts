import type { DynamoDBStreamEvent } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';

const AUTO_APPROVE_THRESHOLD = parseInt(process.env.AUTO_APPROVE_THRESHOLD || '85');
const AUTO_SEND_TO_MODELS = process.env.AUTO_SEND_TO_MODELS === 'true';

/**
 * Auto-Matching Handler
 * 
 * Runs matching automatically when a ModelRequest is created or updated to 'pending'
 */
export const handler = async (event: DynamoDBStreamEvent) => {
  console.log('Auto-matching triggered:', JSON.stringify(event, null, 2));

  const { env } = await import('$amplify/env/auto-matching');
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any);
  Amplify.configure(resourceConfig, libraryOptions);
  const client = generateClient<Schema>();

  for (const record of event.Records) {
    if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') {
      continue;
    }

    try {
      const newImage = record.dynamodb?.NewImage;
      if (!newImage) continue;

      // Extract request data from DynamoDB stream format
      const requestId = newImage.id?.S;
      const status = newImage.status?.S;

      if (!requestId) {
        console.warn('Skipping record: missing requestId');
        continue;
      }

      // Only process if status is 'pending'
      if (status !== 'pending') {
        console.log(`Skipping request ${requestId}: status is ${status}, not 'pending'`);
        continue;
      }

      console.log(`Processing request ${requestId} for auto-matching...`);

      // Import matching utilities (dynamic import to avoid cold start issues)
      // @ts-expect-error - JS modules from src
      const { runMatchingForRequest, approveMatch, sendMatchToModel } = await import('../../../src/utils/autoMatching');

      // Run matching
      const matches = await runMatchingForRequest(requestId);
      console.log(`Found ${matches.length} matches for request ${requestId}`);

      // Auto-approve and send high-score matches
      for (const match of matches) {
        if (match.matchScore >= AUTO_APPROVE_THRESHOLD) {
          console.log(`Auto-approving match ${match.id} with score ${match.matchScore}`);
          
          // Approve the match
          await approveMatch(match.id);
          
          // Auto-send to model if enabled
          if (AUTO_SEND_TO_MODELS) {
            await sendMatchToModel(match.id);
            console.log(`Auto-sent match ${match.id} to model ${match.modelId}`);
          }
        }
      }

      // Update request status to 'matching'
      await client.models.ModelRequest.update({
        id: requestId,
        status: 'matching',
      });

      console.log(`Successfully processed request ${requestId}`);
    } catch (error) {
      console.error('Error in auto-matching:', error);
      // Don't throw - we don't want to retry the entire batch
    }
  }

  return { statusCode: 200, body: 'Processed' };
};

