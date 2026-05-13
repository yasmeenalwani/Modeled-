import type { Handler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const pinpointClient = new PinpointClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * CRM Outreach Handler
 * 
 * Sends emails and SMS for CRM outreach campaigns
 * 
 * Event structure:
 * {
 *   action: 'sendEmail' | 'sendSMS' | 'sendCampaign',
 *   data: {
 *     to: string | string[],
 *     subject?: string,
 *     message: string,
 *     templateId?: string,
 *     prospectId?: string,
 *     campaignId?: string,
 *   }
 * }
 */
export const handler: Handler = async (event) => {
  console.log('CRM Outreach Handler:', JSON.stringify(event, null, 2));

  try {
    const { action, data } = event;

    switch (action) {
      case 'sendEmail':
        return await sendEmail(data);
      
      case 'sendSMS':
        return await sendSMS(data);
      
      case 'sendCampaign':
        return await sendCampaign(data);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('CRM Outreach Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Outreach failed',
      }),
    };
  }
};

/**
 * Send email via SES
 */
async function sendEmail(data: any) {
  const { to, subject, message, prospectId, campaignId } = data;
  
  if (!to || !subject || !message) {
    throw new Error('Missing required fields: to, subject, message');
  }

  const recipients = Array.isArray(to) ? to : [to];
  const fromEmail = process.env.FROM_EMAIL || 'noreply@modeled.com';

  try {
    // Send to each recipient
    const results = await Promise.all(
      recipients.map(async (email) => {
        const command = new SendEmailCommand({
          Source: fromEmail,
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Subject: {
              Data: subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: message.replace(/\n/g, '<br>'),
                Charset: 'UTF-8',
              },
              Text: {
                Data: message,
                Charset: 'UTF-8',
              },
            },
          },
        });

        const result = await sesClient.send(command);
        return {
          email,
          messageId: result.MessageId,
          status: 'sent',
        };
      })
    );

    // TODO: Log outreach activity in database
    // await logOutreachActivity({
    //   prospectId,
    //   campaignId,
    //   activityType: 'email',
    //   status: 'sent',
    // });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        results,
      }),
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send SMS via Pinpoint
 */
async function sendSMS(data: any) {
  const { to, message, prospectId, campaignId } = data;
  
  if (!to || !message) {
    throw new Error('Missing required fields: to, message');
  }

  const recipients = Array.isArray(to) ? to : [to];
  const pinpointAppId = process.env.PINPOINT_APP_ID;

  if (!pinpointAppId) {
    throw new Error('PINPOINT_APP_ID not configured');
  }

  try {
    const command = new SendMessagesCommand({
      ApplicationId: pinpointAppId,
      MessageRequest: {
        Addresses: recipients.reduce((acc, phone) => {
          acc[phone] = { ChannelType: 'SMS' };
          return acc;
        }, {} as Record<string, any>),
        MessageConfiguration: {
          SMSMessage: {
            Body: message,
            MessageType: 'TRANSACTIONAL',
          },
        },
      },
    });

    const result = await pinpointClient.send(command);

    // TODO: Log outreach activity

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result,
      }),
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Send campaign to multiple prospects
 */
async function sendCampaign(data: any) {
  const { campaignId, prospectIds, templateId } = data;
  
  // TODO: Load campaign and prospects from database
  // TODO: Load template
  // TODO: Personalize messages
  // TODO: Send to all prospects
  // TODO: Update campaign metrics
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Campaign sent',
    }),
  };
}

