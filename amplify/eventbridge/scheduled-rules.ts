/**
 * EventBridge Scheduled Rules - Reference Documentation
 * 
 * NOTE: EventBridge rules must be created manually in AWS Console or via AWS CLI
 * because Amplify Gen 2 doesn't fully support EventBridge scheduled rules in CDK yet.
 * 
 * See EVENTBRIDGE_SETUP_GUIDE.md for step-by-step setup instructions.
 * 
 * Rules to Create:
 * 1. BookingRemindersRule - Every hour (rate(1 hour))
 * 2. ChatActivationRule - Every 15 minutes (rate(15 minutes))
 * 3. ModelPaymentRemindersRule - Every 6 hours (rate(6 hours))
 * 
 * Lambda Functions:
 * - booking-reminders
 * - chat-activation
 * - model-payment-reminders
 */

// This file is for documentation only
// Actual EventBridge rules are created via AWS Console or CLI
// See EVENTBRIDGE_SETUP_GUIDE.md for instructions

export const EVENTBRIDGE_RULES = {
  bookingReminders: {
    name: 'BookingRemindersRule',
    schedule: 'rate(1 hour)',
    target: 'booking-reminders',
    description: 'Send booking reminders 24 hours before appointment',
  },
  chatActivation: {
    name: 'ChatActivationRule',
    schedule: 'rate(15 minutes)',
    target: 'chat-activation',
    description: 'Activate chats at scheduled times (24h before for support, 1h before for direct)',
  },
  paymentReminders: {
    name: 'ModelPaymentRemindersRule',
    schedule: 'rate(6 hours)',
    target: 'model-payment-reminders',
    description: 'Send payment reminders to models who accepted match but haven\'t paid',
  },
  crmFollowups: {
    name: 'CRMFollowupsRule',
    schedule: 'rate(1 day)', // Run daily
    target: 'crm-followups',
    description: 'Send automated follow-up emails to prospects',
  },
};

