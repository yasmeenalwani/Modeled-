import type { Handler } from 'aws-lambda';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

const client = generateClient<Schema>();

/**
 * Automated Follow-ups Lambda
 * 
 * Scheduled job that processes prospects needing follow-up
 * Runs daily via EventBridge
 */
export const handler: Handler = async (event) => {
  console.log('CRM Follow-ups Handler:', JSON.stringify(event, null, 2));

  try {
    const now = new Date();
    
    // Get prospects needing follow-up (nextFollowUpAt <= now, status active)
    const { data: prospects, errors } = await client.models.Prospect.list({
      filter: {
        nextFollowUpAt: { le: now.toISOString() },
        status: { eq: 'active' },
      },
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to load prospects');
    }

    if (!prospects || prospects.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No prospects needing follow-up',
          processed: 0,
        }),
      };
    }

    // Process each prospect
    const results = [];
    for (const prospect of prospects) {
      try {
        // Determine follow-up template based on stage
        let templateId = 'follow_up';
        if (prospect.stage === 'new') {
          templateId = 'professional_cold';
        } else if (prospect.stage === 'qualified') {
          templateId = 'follow_up';
        }

        // TODO: Send follow-up email via SES
        // For now, just log the activity
        await client.models.OutreachActivity.create({
          prospectId: prospect.id,
          activityType: 'email',
          subject: 'Following up - Modeled',
          message: 'Automated follow-up email',
          status: 'sent',
          createdAt: new Date().toISOString(),
        });

        // Update prospect
        const followUpDays = getFollowUpDaysForStage(prospect.stage ?? 'contacted');
        const nextFollowUp = new Date();
        nextFollowUp.setDate(nextFollowUp.getDate() + followUpDays);

        await client.models.Prospect.update({
          id: prospect.id,
          lastContactedAt: new Date().toISOString(),
          contactCount: (prospect.contactCount || 0) + 1,
          nextFollowUpAt: nextFollowUp.toISOString(),
        });

        results.push({
          prospectId: prospect.id,
          email: prospect.email,
          status: 'sent',
        });
      } catch (error: any) {
        console.error(`Error processing prospect ${prospect.id}:`, error);
        results.push({
          prospectId: prospect.id,
          email: prospect.email,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Follow-ups processed',
        processed: results.length,
        results,
      }),
    };
  } catch (error: any) {
    console.error('CRM Follow-ups Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Follow-up processing failed',
      }),
    };
  }
};

function getFollowUpDaysForStage(stage: string): number {
  const schedule: Record<string, number> = {
    new: 3,
    contacted: 5,
    qualified: 7,
    proposal: 3,
    negotiation: 2,
    nurture: 14,
  };
  return schedule[stage] || 7;
}

