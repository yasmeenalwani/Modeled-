import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

// Initialize clients
const sesClient = new SESClient({ region: process.env.SES_REGION || 'us-east-1' });
const snsClient = new SNSClient({ region: process.env.SNS_REGION || 'us-east-1' });

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@modeledmanagement.com';
const FROM_NAME = process.env.FROM_NAME || 'Modeled Management';

/** Map template to in-app notification title and message */
function getNotificationContent(template: string, recipient: any, data: any): { title: string; message: string } {
  const map: Record<string, { title: string; message: string }> = {
    booking_confirmed: {
      title: 'Booking confirmed',
      message: `${data?.serviceType || 'Service'} with ${data?.professionalName || 'Professional'} on ${data?.appointmentDate || ''} at ${data?.appointmentTime || ''}.`,
    },
    booking_reminder: {
      title: 'Appointment reminder',
      message: `Your ${data?.serviceType || 'appointment'} is tomorrow at ${data?.appointmentTime || ''}.`,
    },
    match_opportunity: {
      title: 'New opportunity',
      message: `${data?.serviceType || 'Service'} on ${data?.appointmentDate || ''}. Earn $${data?.amount || '0'}.`,
    },
    payment_required: {
      title: 'Payment required',
      message: `Complete payment ($${data?.amount || '0'}) to confirm your booking.`,
    },
    payment_reminder: {
      title: 'Payment reminder',
      message: `Payment of $${data?.amount || '0'} required for ${data?.serviceType || 'booking'}.`,
    },
  };
  return map[template] || { title: 'Notification', message: `You have a new ${template} notification.` };
}

/**
 * Lambda Handler for Notifications
 * 
 * Event structure:
 * {
 *   type: 'email' | 'sms' | 'both',
 *   template: 'booking_confirmation' | 'booking_reminder' | 'match_notification' | etc.,
 *   recipient: { email: string, phone?: string, name: string, userId?: string, userType?: 'model'|'professional'|'partner'|'admin' },
 *   data: { bookingId, appointmentDate, etc. }
 * }
 * 
 * When recipient includes userId and userType, an AppSync Notification record is created
 * for in-app display (SES/SNS pipeline → AppSync).
 */
export const handler: Handler = async (event) => {
  console.log('Notifications Handler:', JSON.stringify(event, null, 2));

  try {
    const { type, template, recipient, data } = event;

    if (!template || !recipient) {
      throw new Error('Missing required fields: template, recipient');
    }

    const results: any = {};

    // Send email if requested
    if (type === 'email' || type === 'both') {
      if (!recipient.email) {
        throw new Error('Email required for email notification');
      }
      results.email = await sendEmail(template, recipient, data);
    }

    // Send SMS if requested
    if (type === 'sms' || type === 'both') {
      if (!recipient.phone) {
        throw new Error('Phone number required for SMS notification');
      }
      results.sms = await sendSMS(template, recipient, data);
    }

    // Create in-app Notification record (SES/SNS → AppSync pipeline placeholder)
    if (recipient.userId && recipient.userType) {
      try {
        const { env } = await import('$amplify/env/notifications');
        const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
        Amplify.configure(resourceConfig, libraryOptions);
        const client = generateClient<Schema>();
        const { title, message } = getNotificationContent(template, recipient, data);
        await client.models.Notification.create({
          userId: recipient.userId,
          userType: recipient.userType,
          type: template,
          title,
          message,
          data: data || undefined,
        });
        results.appSyncNotification = { created: true };
      } catch (appSyncErr: any) {
        console.warn('AppSync Notification creation failed (email/SMS still sent):', appSyncErr?.message);
        results.appSyncNotification = { created: false, error: appSyncErr?.message };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        results,
      }),
    };
  } catch (error: any) {
    console.error('Notification Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Notification failed',
      }),
    };
  }
};

/**
 * Send Email via SES
 * 
 * Note: For calendar invites, we'll include a download link in the email
 * since SES SendEmailCommand doesn't support attachments directly.
 * Use SendRawEmailCommand for attachments (future enhancement).
 */
async function sendEmail(template: string, recipient: any, data: any) {
  const emailContent = getEmailTemplate(template, recipient, data);

  // Generate calendar invite link if this is a booking confirmation
  if (template === 'booking_confirmed' && data.appointmentDate && data.appointmentTime) {
    const calendarInvite = generateCalendarInvite(data, recipient);
    // Store calendar invite in S3 or generate download link
    // For MVP: Include download link in email body
    const calendarLink = `${process.env.PORTAL_URL || 'https://app.modeledmanagement.com'}/calendar-invite/${data.bookingId || 'download'}.ics`;
    // TODO: Upload .ics file to S3 and generate signed URL
  }

  const command = new SendEmailCommand({
    Source: `${FROM_NAME} <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [recipient.email],
    },
    Message: {
      Subject: {
        Data: emailContent.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: emailContent.html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: emailContent.text,
          Charset: 'UTF-8',
        },
      },
    },
  });

  const response = await sesClient.send(command);
  return {
    messageId: response.MessageId,
    status: 'sent',
  };
}

/**
 * Generate Calendar Invite (.ics file)
 */
function generateCalendarInvite(data: any, recipient: any): string {
  // Parse date and time
  const appointmentDate = new Date(`${data.appointmentDate} ${data.appointmentTime}`);
  const endDate = new Date(appointmentDate);
  endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

  // Format dates for ICS (YYYYMMDDTHHMMSS)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatDate(appointmentDate);
  const end = formatDate(endDate);
  const now = formatDate(new Date());

  // Generate unique ID
  const uid = `modeled-${data.bookingId || Date.now()}@modeledmanagement.com`;

  // Create ICS content
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Modeled Management//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${data.serviceType || 'Beauty Service'} with ${data.professionalName || 'Professional'}`,
    `DESCRIPTION:Booking confirmed through Modeled Management\\n\\nService: ${data.serviceType || 'N/A'}\\nProfessional: ${data.professionalName || 'N/A'}\\nLocation: ${data.location || 'N/A'}`,
    `LOCATION:${data.location || 'TBD'}`,
    `ORGANIZER;CN=Modeled Management:mailto:${FROM_EMAIL}`,
    `ATTENDEE;CN=${recipient.name};RSVP=TRUE:mailto:${recipient.email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Your appointment is tomorrow!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

/**
 * Send SMS via SNS
 */
async function sendSMS(template: string, recipient: any, data: any) {
  const message = getSMSTemplate(template, recipient, data);

  // Format phone number (ensure it starts with +1 for US)
  let phoneNumber = recipient.phone;
  if (!phoneNumber.startsWith('+')) {
    phoneNumber = phoneNumber.startsWith('1') ? `+${phoneNumber}` : `+1${phoneNumber}`;
  }

  const command = new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: message,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional',
      },
    },
  });

  const response = await snsClient.send(command);
  return {
    messageId: response.MessageId,
    status: 'sent',
  };
}

/**
 * Get Email Template
 */
function getEmailTemplate(template: string, recipient: any, data: any) {
  const templates: any = {
    booking_confirmed: {
      subject: `Booking confirmed! Calendar invite attached 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Cormorant Garamond', Georgia, serif; color: #2D2926; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B1E3F; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #FFFEF9; }
            .button { display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #5C5552; font-size: 12px; margin-top: 30px; }
            .calendar-note { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipient.name},</p>
              <p>Your booking is confirmed!</p>
              <ul>
                <li><strong>Service:</strong> ${data.serviceType || 'N/A'}</li>
                <li><strong>Professional:</strong> ${data.professionalName || 'N/A'}</li>
                <li><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</li>
                <li><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</li>
                <li><strong>Location:</strong> ${data.location || 'N/A'}</li>
                ${data.professionalPhone ? `<li><strong>Professional Phone:</strong> ${data.professionalPhone}</li>` : ''}
              </ul>
              <div class="calendar-note">
                <p><strong>📅 Calendar Invite:</strong> A calendar invite (.ics file) is attached to this email. Add it to your calendar to never miss an appointment!</p>
              </div>
              <p><strong>What to expect:</strong></p>
              <ul>
                <li>You'll receive a reminder 24 hours before your appointment</li>
                <li>Show up on time</li>
                <li>Bring a valid ID for verification</li>
                <li>Enjoy your service</li>
              </ul>
              <p><strong>Important reminders:</strong></p>
              <ul>
                <li>⚠️ Cancellations less than 24 hours before affect your reliability score</li>
                <li>⚠️ No-shows result in a penalty</li>
                <li>✅ Complete the session and submit feedback to boost your score</li>
              </ul>
              ${data.portalLink ? `<a href="${data.portalLink}" class="button">View Booking in Portal</a>` : ''}
              <p>We're so excited for you! Have fun! ✨</p>
            </div>
            <div class="footer">
              <p>Modeled Management</p>
              <p>Connecting models with beauty professionals</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${recipient.name},\n\nYour booking is confirmed!\n\nService: ${data.serviceType}\nProfessional: ${data.professionalName}\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\nLocation: ${data.location}\n\nA calendar invite (.ics file) is attached to this email.\n\nYou'll receive a reminder 24 hours before your appointment.\n\nSee you soon!\n\nModeled Management`,
    },
    booking_reminder: {
      subject: `Reminder: Your Appointment Tomorrow`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Cormorant Garamond', Georgia, serif; color: #2D2926; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B1E3F; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #FFFEF9; }
            .footer { text-align: center; color: #5C5552; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${recipient.name},</p>
              <p>This is a friendly reminder about your appointment tomorrow:</p>
              <ul>
                <li><strong>Service:</strong> ${data.serviceType || 'N/A'}</li>
                <li><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</li>
                <li><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</li>
                <li><strong>Location:</strong> ${data.location || 'N/A'}</li>
              </ul>
              <p>We're looking forward to seeing you! 🍒</p>
            </div>
            <div class="footer">
              <p>Modeled Management</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${recipient.name},\n\nReminder: Your appointment is tomorrow!\n\nService: ${data.serviceType}\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\nLocation: ${data.location}\n\nSee you soon!\n\nModeled Management`,
    },
    match_opportunity: {
      subject: `New opportunity! 🎯`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Cormorant Garamond', Georgia, serif; color: #2D2926; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B1E3F; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #FFFEF9; }
            .button { display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #5C5552; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 You're Cherry-Picked!</h1>
            </div>
            <div class="content">
              <p>Hi ${recipient.name},</p>
              <p>You have a new opportunity!</p>
              <ul>
                <li><strong>Service:</strong> ${data.serviceType || 'N/A'}</li>
                <li><strong>Professional:</strong> ${data.professionalName || 'N/A'}</li>
                <li><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</li>
                <li><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</li>
                <li><strong>Location:</strong> ${data.location || 'N/A'}</li>
                <li><strong>You'd earn:</strong> $${data.amount || '0'}</li>
              </ul>
              ${data.portalLink ? `<a href="${data.portalLink}" class="button">View in Portal</a>` : ''}
              <p><strong>Act fast!</strong> The first model to accept and pay gets the booking. Others go on a waitlist.</p>
            </div>
            <div class="footer">
              <p>Modeled Management</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${recipient.name},\n\nNew opportunity!\n\nService: ${data.serviceType}\nProfessional: ${data.professionalName}\nDate: ${data.appointmentDate} at ${data.appointmentTime}\nLocation: ${data.location}\nYou'd earn: $${data.amount}\n\n${data.portalLink ? `View: ${data.portalLink}` : ''}\n\nModeled Management`,
    },
    payment_required: {
      subject: `Payment required to confirm booking 💳`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Cormorant Garamond', Georgia, serif; color: #2D2926; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B1E3F; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #FFFEF9; }
            .button { display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #5C5552; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Required</h1>
            </div>
            <div class="content">
              <p>Hi ${recipient.name},</p>
              <p>You've accepted the opportunity! Now complete payment to secure your booking.</p>
              <ul>
                <li><strong>Service:</strong> ${data.serviceType || 'N/A'}</li>
                <li><strong>Professional:</strong> ${data.professionalName || 'N/A'}</li>
                <li><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</li>
                <li><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</li>
                <li><strong>Model Fee:</strong> $${data.amount || '0.00'}</li>
              </ul>
              ${data.paymentLink ? `<a href="${data.paymentLink}" class="button">Pay Now</a>` : ''}
              <p><strong>What happens next:</strong></p>
              <ol>
                <li>Complete payment</li>
                <li>Get approved and receive calendar invite with all details</li>
                <li>Get reminder 24 hours before</li>
                <li>Show up and enjoy your service!</li>
              </ol>
              <p><strong>Important:</strong> Payment must be completed within 24 hours or the booking will be released to the waitlist.</p>
            </div>
            <div class="footer">
              <p>Modeled Management</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${recipient.name},\n\nPayment required to confirm booking.\n\nService: ${data.serviceType}\nDate: ${data.appointmentDate} at ${data.appointmentTime}\nModel Fee: $${data.amount}\n\n${data.paymentLink ? `Pay: ${data.paymentLink}` : ''}\n\nModeled Management`,
    },
    payment_reminder: {
      subject: `Payment Required for Your Booking`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Cormorant Garamond', Georgia, serif; color: #2D2926; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B1E3F; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #FFFEF9; }
            .button { display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #fff; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #5C5552; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Required</h1>
            </div>
            <div class="content">
              <p>Hi ${recipient.name},</p>
              <p>To confirm your booking, please complete payment:</p>
              <ul>
                <li><strong>Amount:</strong> $${data.amount || '0.00'}</li>
                <li><strong>Service:</strong> ${data.serviceType || 'N/A'}</li>
                <li><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</li>
              </ul>
              ${data.paymentLink ? `<a href="${data.paymentLink}" class="button">Pay Now</a>` : ''}
              <p>Your booking will be confirmed once payment is received.</p>
            </div>
            <div class="footer">
              <p>Modeled Management</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${recipient.name},\n\nPayment required: $${data.amount}\n\nService: ${data.serviceType}\nDate: ${data.appointmentDate}\n\n${data.paymentLink ? `Pay: ${data.paymentLink}` : ''}\n\nModeled Management`,
    },
  };

  return templates[template] || templates.booking_confirmation;
}

/**
 * Get SMS Template
 */
function getSMSTemplate(template: string, recipient: any, data: any) {
  const templates: any = {
    booking_confirmed: `🍒 Modeled: Booking confirmed! ${data.serviceType} with ${data.professionalName} on ${data.appointmentDate} at ${data.appointmentTime}. Location: ${data.location}. Calendar invite sent to email.`,
    booking_reminder: `⏰ Modeled: Reminder - Your ${data.serviceType} appointment is tomorrow at ${data.appointmentTime}. See you at ${data.location}!`,
    match_opportunity: `🎯 Modeled: New opportunity! ${data.serviceType} on ${data.appointmentDate}. Earn $${data.amount}. ${data.portalLink ? `View: ${data.portalLink}` : ''}`,
    payment_required: `💳 Modeled: Payment required ($${data.amount}) to confirm ${data.serviceType} on ${data.appointmentDate}. ${data.paymentLink ? `Pay: ${data.paymentLink}` : ''}`,
  };

  return templates[template] || templates.booking_confirmed;
}

