#!/bin/bash

# EventBridge Setup Script
# Creates the 3 critical EventBridge rules for automated reminders

set -e

echo "🚀 Setting up EventBridge rules..."

# Get Lambda function ARNs (adjust these to match your actual ARNs)
# You can find these in AWS Console → Lambda → Functions

BOOKING_REMINDERS_ARN="arn:aws:lambda:REGION:ACCOUNT:function:booking-reminders"
CHAT_ACTIVATION_ARN="arn:aws:lambda:REGION:ACCOUNT:function:chat-activation"
PAYMENT_REMINDERS_ARN="arn:aws:lambda:REGION:ACCOUNT:function:model-payment-reminders"

# Get region and account ID
REGION=$(aws configure get region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Update ARNs with actual region and account
BOOKING_REMINDERS_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:booking-reminders"
CHAT_ACTIVATION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:chat-activation"
PAYMENT_REMINDERS_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:model-payment-reminders"

# Rule 1: Booking Reminders (every hour)
echo "📅 Creating booking reminders rule..."
aws events put-rule \
  --name booking-reminders-24h \
  --schedule-expression "rate(1 hour)" \
  --description "Send booking reminders 24 hours before appointment" \
  --state ENABLED

aws events put-targets \
  --rule booking-reminders-24h \
  --targets "Id"="1","Arn"="\"${BOOKING_REMINDERS_ARN}\"","Input"="{\"reminderType\":\"24h\"}"

# Add Lambda permission
aws lambda add-permission \
  --function-name booking-reminders \
  --statement-id allow-eventbridge-booking-reminders \
  --action 'lambda:InvokeFunction' \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/booking-reminders-24h"

# Rule 2: Payment Reminders (every 6 hours)
echo "💰 Creating payment reminders rule..."
aws events put-rule \
  --name model-payment-reminders \
  --schedule-expression "rate(6 hours)" \
  --description "Send payment reminders to models every 6 hours" \
  --state ENABLED

aws events put-targets \
  --rule model-payment-reminders \
  --targets "Id"="1","Arn"="\"${PAYMENT_REMINDERS_ARN}\""

aws lambda add-permission \
  --function-name model-payment-reminders \
  --statement-id allow-eventbridge-payment-reminders \
  --action 'lambda:InvokeFunction' \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/model-payment-reminders"

# Rule 3: Chat Activation (every 15 minutes to check for bookings)
echo "💬 Creating chat activation rule..."
aws events put-rule \
  --name chat-activation-scheduled \
  --schedule-expression "rate(15 minutes)" \
  --description "Activate chats at scheduled times (24h before for support, 1h before for direct)" \
  --state ENABLED

aws events put-targets \
  --rule chat-activation-scheduled \
  --targets "Id"="1","Arn"="\"${CHAT_ACTIVATION_ARN}\""

aws lambda add-permission \
  --function-name chat-activation \
  --statement-id allow-eventbridge-chat-activation \
  --action 'lambda:InvokeFunction' \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/chat-activation-scheduled"

echo "✅ EventBridge rules created successfully!"
echo ""
echo "📋 Created rules:"
echo "   1. booking-reminders-24h (every hour)"
echo "   2. model-payment-reminders (every 6 hours)"
echo "   3. chat-activation-scheduled (every 15 minutes)"
echo ""
echo "⚠️  Note: You still need to enable DynamoDB streams manually for chat activation on booking events"

