import { PinpointClient, SendMessagesCommand, CreateCampaignCommand, GetCampaignCommand } from '@aws-sdk/client-pinpoint';
import type { Handler } from 'aws-lambda';

const pinpointClient = new PinpointClient({ 
  region: process.env.PINPOINT_REGION || 'us-east-1' 
});

const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID || '';

/**
 * Pinpoint Campaigns Handler
 * 
 * Handles marketing campaign operations:
 * - Send campaign to segment
 * - Create campaign
 * - Get campaign analytics
 */
export const handler: Handler = async (event) => {
  console.log('Pinpoint Campaigns Event:', JSON.stringify(event, null, 2));
  
  try {
    const { action, ...params } = event;
    
    switch (action) {
      case 'sendCampaign':
        return await sendCampaign(params);
      case 'createCampaign':
        return await createCampaign(params);
      case 'getCampaign':
        return await getCampaign(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Pinpoint Campaigns Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    };
  }
};

/**
 * Send a marketing campaign to a segment
 */
async function sendCampaign(params: {
  segmentId: string;
  template: {
    subject: string;
    html: string;
    text?: string;
  };
  data?: Record<string, any>;
}) {
  const { segmentId, template, data = {} } = params;
  
  const command = new SendMessagesCommand({
    ApplicationId: PINPOINT_APP_ID,
    MessageRequest: {
      Addresses: {}, // Will be populated from segment
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: process.env.FROM_EMAIL || 'noreply@modeledmanagement.com',
          SimpleEmail: {
            Subject: {
              Data: template.subject,
              Charset: 'UTF-8',
            },
            HtmlPart: {
              Data: template.html,
              Charset: 'UTF-8',
            },
            ...(template.text && {
              TextPart: {
                Data: template.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      },
      // Target segment
      SegmentId: segmentId,
    },
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      messageId: response.MessageResponse?.RequestId,
      result: response.MessageResponse?.Result,
    }),
  };
}

/**
 * Create a new campaign
 */
async function createCampaign(params: {
  name: string;
  segmentId: string;
  schedule?: {
    startTime: string; // ISO 8601
    endTime?: string;
    timezone?: string;
  };
  template: {
    subject: string;
    html: string;
    text?: string;
  };
}) {
  const { name, segmentId, schedule, template } = params;
  
  const command = new CreateCampaignCommand({
    ApplicationId: PINPOINT_APP_ID,
    WriteCampaignRequest: {
      Name: name,
      SegmentId: segmentId,
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: process.env.FROM_EMAIL || 'noreply@modeledmanagement.com',
          SimpleEmail: {
            Subject: {
              Data: template.subject,
              Charset: 'UTF-8',
            },
            HtmlPart: {
              Data: template.html,
              Charset: 'UTF-8',
            },
            ...(template.text && {
              TextPart: {
                Data: template.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      },
      ...(schedule && {
        Schedule: {
          StartTime: schedule.startTime,
          ...(schedule.endTime && { EndTime: schedule.endTime }),
          Timezone: schedule.timezone || 'America/New_York',
        },
      }),
    },
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      campaignId: response.CampaignResponse?.Id,
      arn: response.CampaignResponse?.Arn,
    }),
  };
}

/**
 * Get campaign details and analytics
 */
async function getCampaign(params: {
  campaignId: string;
}) {
  const { campaignId } = params;
  
  const command = new GetCampaignCommand({
    ApplicationId: PINPOINT_APP_ID,
    CampaignId: campaignId,
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      campaign: response.CampaignResponse,
    }),
  };
}

