# Technical Breakdown: Blowout Request Process 🔧

## AWS Services Architecture & Implementation

---

## 🎯 Process Overview (Updated: Multi-Match with Waitlist)

**Key Change**: One request → Multiple matches → First to pay wins → Rest go to waitlist

---

## Step 1: Professional Creates Request

### **AWS Services Used:**

#### 1. **Amazon Cognito** (Authentication)
- **Service**: `cognito-idp`
- **Action**: `GetUser` / `GetIdToken`
- **Purpose**: Verify Sarah is authenticated
- **Implementation**:
  ```javascript
  // Frontend: src/portal/pages/PortalDashboard.jsx
  import { fetchAuthSession } from 'aws-amplify/auth';
  
  const session = await fetchAuthSession();
  const token = session.tokens.idToken; // JWT token
  const userId = session.userId; // Sarah's user ID
  ```

#### 2. **AWS AppSync** (GraphQL API)
- **Service**: `appsync`
- **Action**: `CreateModelRequest` mutation
- **Purpose**: Save request to database
- **Implementation**:
  ```javascript
  // Frontend: src/portal/pages/PortalDashboard.jsx
  import { generateClient } from 'aws-amplify/api';
  import { createModelRequest } from './graphql/mutations';
  
  const client = generateClient();
  const request = await client.graphql({
    query: createModelRequest,
    variables: {
      input: {
        professionalId: userId,
        serviceType: 'blowout',
        requestedDate: '2024-12-20',
        requestedTime: '10:00 AM',
        duration: 60,
        location: 'Luxe Studio',
        desiredHairLength: 'medium',
        status: 'pending',
      }
    }
  });
  ```

#### 3. **Amazon DynamoDB** (Database)
- **Service**: `dynamodb`
- **Action**: `PutItem` (via AppSync)
- **Purpose**: Store request data
- **Table**: `ModelRequest-<env>`
- **Item Structure**:
  ```json
  {
    "id": "req-123",
    "professionalId": "prof-sarah-001",
    "serviceType": "blowout",
    "requestedDate": "2024-12-20",
    "requestedTime": "10:00 AM",
    "status": "pending",
    "createdAt": "2024-12-15T09:00:00Z",
    "updatedAt": "2024-12-15T09:00:00Z"
  }
  ```
- **Partition Key**: `id`
- **GSI**: `professionalId-status-index` (for querying by professional)

#### 4. **AWS CloudWatch** (Metrics)
- **Service**: `cloudwatch`
- **Action**: `PutMetricData`
- **Purpose**: Track request creation
- **Implementation**:
  ```javascript
  // src/utils/cloudwatch.js
  await putMetric('RequestCreated', 1, 'Count', {
    ServiceType: 'blowout',
    ProfessionalId: userId,
  });
  ```

#### 5. **AWS CloudTrail** (Security Logging)
- **Service**: `cloudtrail`
- **Action**: Automatically logs all API calls
- **Event Logged**:
  ```json
  {
    "eventTime": "2024-12-15T09:00:00Z",
    "eventName": "GraphQLAPI",
    "userIdentity": {
      "type": "IAMUser",
      "userName": "prof-sarah-001"
    },
    "requestParameters": {
      "operation": "CreateModelRequest"
    },
    "responseElements": {
      "statusCode": 200
    }
  }
  ```

---

## Step 2: Admin Runs Matching Algorithm

### **AWS Services Used:**

#### 1. **AWS AppSync** (Query Models)
- **Service**: `appsync`
- **Action**: `ListModelProfiles` query
- **Purpose**: Get all available models
- **Implementation**:
  ```javascript
  // Admin Dashboard: src/admin/pages/MatchEnginePage.jsx
  const { data } = await client.graphql({
    query: listModelProfiles,
    variables: {
      filter: {
        status: { eq: 'active' },
        openToStyling: { eq: true }
      }
    }
  });
  ```

#### 2. **Amazon DynamoDB** (Read Models)
- **Service**: `dynamodb`
- **Action**: `Query` / `Scan` (via AppSync)
- **Purpose**: Retrieve model profiles
- **Table**: `ModelProfile-<env>`
- **Query Pattern**:
  ```javascript
  // DynamoDB Query (via AppSync)
  {
    TableName: "ModelProfile-dev",
    IndexName: "status-openToStyling-index",
    KeyConditionExpression: "status = :status AND openToStyling = :openToStyling",
    ExpressionAttributeValues: {
      ":status": "active",
      ":openToStyling": true
    }
  }
  ```

#### 3. **Matching Algorithm** (Client-Side Processing)
- **Location**: `src/matching/matchingEngine.js`
- **Function**: `findMatches(models, request)`
- **Process**:
  1. Filters models by basic criteria
  2. Scores each model (0-100)
  3. Sorts by score (highest first)
  4. Returns top N matches (e.g., top 5)
- **Scoring Components**:
  ```javascript
  // Matching algorithm breakdown
  const score = {
    attributeMatch: 30,    // Hair color, length, texture
    availabilityMatch: 25, // Can they make the time?
    locationMatch: 20,     // Proximity to location
    agenticScores: 25      // Reliability, feedback, experience
  };
  ```

#### 4. **AWS AppSync** (Create Multiple Matches)
- **Service**: `appsync`
- **Action**: `CreateMatch` mutation (called multiple times)
- **Purpose**: Create match records for top candidates
- **Implementation**:
  ```javascript
  // Admin Dashboard: src/admin/pages/MatchEnginePage.jsx
  const topMatches = findMatches(models, request, { limit: 5 });
  
  // Create matches for top 5 models
  for (const match of topMatches) {
    await client.graphql({
      query: createMatch,
      variables: {
        input: {
          requestId: request.id,
          modelId: match.modelId,
          matchScore: match.score,
          scoreBreakdown: match.breakdown,
          status: 'sent', // All start as 'sent'
        }
      }
    });
  }
  ```

#### 5. **Amazon DynamoDB** (Store Matches)
- **Service**: `dynamodb`
- **Action**: `PutItem` (multiple items)
- **Purpose**: Store match records
- **Table**: `Match-<env>`
- **Items Created**:
  ```json
  // Match 1 (Emma - 92%)
  {
    "id": "match-001",
    "requestId": "req-123",
    "modelId": "model-emma-001",
    "matchScore": 92,
    "status": "sent",
    "sentAt": "2024-12-15T09:15:00Z"
  }
  
  // Match 2 (Sophia - 78%)
  {
    "id": "match-002",
    "requestId": "req-123",
    "modelId": "model-sophia-002",
    "matchScore": 78,
    "status": "sent",
    "sentAt": "2024-12-15T09:15:00Z"
  }
  
  // ... 3 more matches
  ```

#### 6. **AWS Lambda** (Notifications Function)
- **Service**: `lambda`
- **Function**: `notificationsFunction`
- **Action**: `Invoke` (multiple invocations)
- **Purpose**: Send notifications to all matched models
- **Implementation**:
  ```javascript
  // Admin Dashboard triggers notifications
  for (const match of topMatches) {
    await invoke({
      functionName: 'notificationsFunction',
      payload: {
        type: 'both', // email + SMS
        template: 'match_notification',
        recipient: {
          email: match.modelEmail,
          phone: match.modelPhone,
          name: match.modelName,
        },
        data: {
          serviceType: 'blowout',
          appointmentDate: 'Dec 20, 2024',
          appointmentTime: '10:00 AM',
          matchScore: match.score,
          bookingLink: `https://app.modeled.com/match/${match.id}/accept`,
        }
      }
    });
  }
  ```

#### 7. **Amazon SES** (Email Service)
- **Service**: `ses`
- **Action**: `SendEmail` (via Lambda)
- **Purpose**: Send email notifications
- **Lambda Implementation**:
  ```javascript
  // amplify/functions/notifications/handler.ts
  import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
  
  const sesClient = new SESClient({ region: 'us-east-1' });
  
  const command = new SendEmailCommand({
    Source: 'noreply@modeledmanagement.com',
    Destination: {
      ToAddresses: [recipient.email],
    },
    Message: {
      Subject: { Data: 'New Match Found! 🎉' },
      Body: {
        Html: { Data: emailTemplate },
        Text: { Data: textTemplate },
      },
    },
  });
  
  await sesClient.send(command);
  ```

#### 8. **Amazon SNS** (SMS Service)
- **Service**: `sns`
- **Action**: `Publish` (via Lambda)
- **Purpose**: Send SMS notifications
- **Lambda Implementation**:
  ```javascript
  // amplify/functions/notifications/handler.ts
  import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
  
  const snsClient = new SNSClient({ region: 'us-east-1' });
  
  const command = new PublishCommand({
    PhoneNumber: recipient.phone, // +1234567890
    Message: '🎉 Modeled: New match! Blowout on Dec 20...',
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional',
      },
    },
  });
  
  await snsClient.send(command);
  ```

#### 9. **AWS CloudWatch** (Metrics)
- **Service**: `cloudwatch`
- **Action**: `PutMetricData`
- **Purpose**: Track matching activity
- **Metrics Sent**:
  ```javascript
  await putMetric('MatchesCreated', topMatches.length, 'Count');
  await putMetric('MatchScore', match.score, 'None', {
    RequestId: request.id,
  });
  await putMetric('NotificationsSent', topMatches.length * 2, 'Count'); // email + SMS
  ```

---

## Step 3: Multiple Models Receive Notifications (Race Condition)

### **AWS Services Used:**

#### 1. **Amazon SES** (Email Delivery)
- **Service**: `ses`
- **Action**: `SendEmail` (5 emails sent simultaneously)
- **Delivery**: 
  - Emma receives email at 09:15:00
  - Sophia receives email at 09:15:01
  - Olivia receives email at 09:15:02
  - ... (all within seconds)

#### 2. **Amazon SNS** (SMS Delivery)
- **Service**: `sns`
- **Action**: `Publish` (5 SMS sent simultaneously)
- **Delivery**: Similar timing to emails

#### 3. **AWS CloudWatch Logs** (Notification Logging)
- **Service**: `logs`
- **Action**: Automatic logging
- **Log Group**: `/aws/lambda/notifications`
- **Log Entries**:
  ```
  [2024-12-15 09:15:00] Match notification sent to emma@example.com
  [2024-12-15 09:15:01] Match notification sent to sophia@example.com
  [2024-12-15 09:15:02] Match notification sent to olivia@example.com
  ```

---

## Step 4: First Model Accepts & Pays (Race Condition Handling)

### **Critical: First-to-Pay Wins Logic**

### **AWS Services Used:**

#### 1. **AWS AppSync** (Check Match Status)
- **Service**: `appsync`
- **Action**: `GetMatch` query
- **Purpose**: Check if match is still available
- **Implementation**:
  ```javascript
  // Model Portal: src/portal/model-pages/ModelDashboard.jsx
  const { data } = await client.graphql({
    query: getMatch,
    variables: { id: matchId }
  });
  
  // Check if already booked
  if (data.getMatch.status === 'accepted' && data.getMatch.bookingId) {
    // Already taken - redirect to waitlist
    return { status: 'unavailable', waitlist: true };
  }
  ```

#### 2. **Amazon DynamoDB** (Atomic Update - Critical!)
- **Service**: `dynamodb`
- **Action**: `UpdateItem` with conditional expression
- **Purpose**: Ensure only first model can claim the booking
- **Implementation**:
  ```javascript
  // Backend: AppSync resolver or Lambda
  // Atomic update with condition check
  const updateParams = {
    TableName: 'Match-dev',
    Key: { id: matchId },
    UpdateExpression: 'SET #status = :accepted, #bookingId = :bookingId',
    ConditionExpression: '#status = :sent AND attribute_not_exists(#bookingId)',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#bookingId': 'bookingId',
    },
    ExpressionAttributeValues: {
      ':accepted': 'accepted',
      ':sent': 'sent',
      ':bookingId': bookingId,
    },
    ReturnValues: 'ALL_NEW',
  };
  
  try {
    const result = await dynamodb.update(updateParams).promise();
    // Success - this model got it!
    return { success: true, match: result.Attributes };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      // Someone else got it first - go to waitlist
      return { success: false, waitlist: true };
    }
    throw error;
  }
  ```

#### 3. **AWS AppSync** (Create Booking)
- **Service**: `appsync`
- **Action**: `CreateBooking` mutation
- **Purpose**: Create booking record (only if match update succeeded)
- **Implementation**:
  ```javascript
  // Only called if atomic update succeeded
  const booking = await client.graphql({
    query: createBooking,
    variables: {
      input: {
        matchId: matchId,
        requestId: requestId,
        modelId: modelId,
        professionalId: professionalId,
        appointmentDate: '2024-12-20',
        appointmentTime: '10:00 AM',
        status: 'confirmed', // pending payment
        modelPaymentStatus: 'pending',
      }
    }
  });
  ```

#### 4. **AWS Lambda** (Stripe Payment Function)
- **Service**: `lambda`
- **Function**: `stripePaymentFunction`
- **Action**: `Invoke`
- **Purpose**: Create payment intent
- **Implementation**:
  ```javascript
  // Frontend: src/pages/PaymentPage.jsx
  import { createPaymentIntent } from '../utils/stripe';
  
  const { clientSecret, paymentIntentId } = await createPaymentIntent({
    amount: 10.00, // Model fee
    bookingId: booking.id,
    customerId: modelStripeCustomerId,
  });
  ```

#### 5. **Stripe API** (Payment Processing)
- **Service**: External (via Lambda)
- **Action**: `paymentIntents.create`
- **Purpose**: Create secure payment intent
- **Lambda Implementation**:
  ```javascript
  // amplify/functions/stripe-payment/handler.ts
  import { Stripe } from 'stripe';
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000, // $10.00 in cents
    currency: 'usd',
    customer: customerId,
    metadata: {
      bookingId: bookingId,
      modelId: modelId,
    },
    automatic_payment_methods: { enabled: true },
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
  ```

#### 6. **Stripe Elements** (Frontend Payment)
- **Service**: Client-side (Stripe.js)
- **Action**: `confirmPayment`
- **Purpose**: Process payment securely
- **Implementation**:
  ```javascript
  // Frontend: src/components/PaymentForm.jsx
  import { useStripe, useElements } from '@stripe/react-stripe-js';
  
  const stripe = useStripe();
  const elements = useElements();
  
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret: clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/payment-success`,
    },
    redirect: 'if_required',
  });
  
  if (paymentIntent.status === 'succeeded') {
    // Payment successful!
  }
  ```

#### 7. **Stripe Webhook** (Payment Confirmation)
- **Service**: External (Stripe → AWS)
- **Action**: HTTP POST to Lambda
- **Purpose**: Confirm payment completion
- **Lambda Implementation**:
  ```javascript
  // amplify/functions/stripe-payment/handler.ts
  export const webhookHandler = async (event) => {
    const signature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      webhookSecret
    );
    
    if (stripeEvent.type === 'payment_intent.succeeded') {
      const paymentIntent = stripeEvent.data.object;
      const bookingId = paymentIntent.metadata.bookingId;
      
      // Update booking in DynamoDB
      await updateBookingPayment(bookingId, paymentIntent.id, 'paid');
    }
  };
  ```

#### 8. **Amazon DynamoDB** (Update Booking)
- **Service**: `dynamodb`
- **Action**: `UpdateItem`
- **Purpose**: Mark payment as complete
- **Update**:
  ```javascript
  {
    TableName: 'Booking-dev',
    Key: { id: bookingId },
    UpdateExpression: 'SET #paymentStatus = :paid, #paymentDate = :now, #status = :confirmed',
    ExpressionAttributeNames: {
      '#paymentStatus': 'modelPaymentStatus',
      '#paymentDate': 'paymentDate',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':paid': 'paid',
      ':now': new Date().toISOString(),
      ':confirmed': 'confirmed',
    },
  }
  ```

#### 9. **AWS AppSync** (Update Other Matches to Waitlist)
- **Service**: `appsync`
- **Action**: `UpdateMatch` mutation (batch)
- **Purpose**: Move other matches to waitlist
- **Implementation**:
  ```javascript
  // After successful booking, update other matches
  const otherMatches = await getMatchesByRequestId(requestId);
  
  for (const match of otherMatches) {
    if (match.id !== acceptedMatchId && match.status === 'sent') {
      await client.graphql({
        query: updateMatch,
        variables: {
          input: {
            id: match.id,
            status: 'waitlist', // Moved to waitlist
            waitlistPosition: calculateWaitlistPosition(match),
          }
        }
      });
    }
  }
  ```

#### 10. **Amazon DynamoDB** (Waitlist Updates)
- **Service**: `dynamodb`
- **Action**: `UpdateItem` (batch)
- **Purpose**: Update match statuses
- **Updates**:
  ```json
  // Match 2 (Sophia) - Now on waitlist
  {
    "id": "match-002",
    "status": "waitlist",
    "waitlistPosition": 1,
    "updatedAt": "2024-12-15T10:05:00Z"
  }
  
  // Match 3 (Olivia) - Now on waitlist
  {
    "id": "match-003",
    "status": "waitlist",
    "waitlistPosition": 2,
    "updatedAt": "2024-12-15T10:05:00Z"
  }
  ```

#### 11. **AWS Lambda** (Waitlist Notifications)
- **Service**: `lambda`
- **Function**: `notificationsFunction`
- **Action**: `Invoke` (for waitlisted models)
- **Purpose**: Notify models they're on waitlist
- **Implementation**:
  ```javascript
  // Notify waitlisted models
  for (const match of waitlistedMatches) {
    await invoke({
      functionName: 'notificationsFunction',
      payload: {
        type: 'email',
        template: 'waitlist_notification',
        recipient: {
          email: match.modelEmail,
          name: match.modelName,
        },
        data: {
          serviceType: 'blowout',
          waitlistPosition: match.waitlistPosition,
          message: 'Booking was taken, but you're next in line if it opens up!',
        }
      }
    });
  }
  ```

#### 12. **Amazon SES** (Waitlist Emails)
- **Service**: `ses`
- **Action**: `SendEmail`
- **Purpose**: Send waitlist notifications
- **Emails Sent**: 4 emails (to waitlisted models)

---

## Step 5: Notifications Sent (After Payment)

### **AWS Services Used:**

#### 1. **AWS Lambda** (Notifications Function)
- **Service**: `lambda`
- **Function**: `notificationsFunction`
- **Action**: `Invoke` (2 invocations)
- **Purpose**: Send confirmation notifications

#### 2. **Amazon SES** (Confirmation Emails)
- **Service**: `ses`
- **Action**: `SendEmail` (2 emails)
- **Recipients**: Emma (model) + Sarah (professional)

#### 3. **Amazon SNS** (Confirmation SMS)
- **Service**: `sns`
- **Action**: `Publish` (2 SMS)
- **Recipients**: Emma + Sarah

#### 4. **AWS CloudWatch** (Notification Metrics)
- **Service**: `cloudwatch`
- **Action**: `PutMetricData`
- **Metrics**:
  ```javascript
  await putMetric('NotificationSent', 1, 'Count', {
    Type: 'booking_confirmation',
    Channel: 'email',
    Success: 'true',
  });
  ```

---

## Step 6: Calendar Events Created

### **AWS Services Used:**

#### 1. **Client-Side Processing** (No AWS)
- **Service**: Browser (JavaScript)
- **Action**: Generate iCal file / Google Calendar URL
- **Purpose**: Create calendar events
- **Implementation**:
  ```javascript
  // src/utils/calendar.js
  // No AWS services - pure client-side
  const icalContent = generateICalFile(event);
  const googleUrl = generateGoogleCalendarUrl(event);
  ```

#### 2. **Amazon S3** (Optional: Store Calendar Links)
- **Service**: `s3`
- **Action**: `PutObject` (optional)
- **Purpose**: Store calendar event metadata
- **Implementation** (if storing):
  ```javascript
  await uploadFile({
    key: `bookings/${bookingId}/calendar.ics`,
    body: icalContent,
    contentType: 'text/calendar',
  });
  ```

---

## Step 7: 24-Hour Reminder (Scheduled)

### **AWS Services Used:**

#### 1. **Amazon EventBridge** (Scheduler)
- **Service**: `events`
- **Action**: Scheduled rule
- **Purpose**: Trigger reminder Lambda
- **Configuration**:
  ```javascript
  // CloudFormation/CDK
  new events.Rule(stack, 'ReminderRule', {
    schedule: events.Schedule.rate(cdk.Duration.hours(1)),
    targets: [
      new targets.LambdaFunction(reminderFunction),
    ],
  });
  ```

#### 2. **AWS Lambda** (Reminder Function)
- **Service**: `lambda`
- **Function**: `reminderFunction` (or part of notificationsFunction)
- **Action**: `Invoke` (scheduled)
- **Purpose**: Check bookings 24h away and send reminders
- **Implementation**:
  ```javascript
  // Lambda function
  export const handler = async (event) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Query bookings for tomorrow
    const bookings = await queryBookings({
      appointmentDate: tomorrow.toISOString().split('T')[0],
      status: 'confirmed',
    });
    
    // Send reminders
    for (const booking of bookings) {
      await sendBookingReminder(booking);
    }
  };
  ```

#### 3. **Amazon DynamoDB** (Query Bookings)
- **Service**: `dynamodb`
- **Action**: `Query`
- **Purpose**: Find bookings 24h away
- **Query**:
  ```javascript
  {
    TableName: 'Booking-dev',
    IndexName: 'appointmentDate-status-index',
    KeyConditionExpression: 'appointmentDate = :date AND #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':date': '2024-12-19',
      ':status': 'confirmed',
    },
  }
  ```

#### 4. **Amazon SES** (Reminder Emails)
- **Service**: `ses`
- **Action**: `SendEmail` (2 emails)
- **Purpose**: Send 24h reminders

#### 5. **Amazon SNS** (Reminder SMS)
- **Service**: `sns`
- **Action**: `Publish` (2 SMS)
- **Purpose**: Send 24h reminders

---

## Step 8: Service Performed

### **AWS Services Used:**

#### 1. **Amazon S3** (Photo Storage)
- **Service**: `s3`
- **Action**: `PutObject` (multiple)
- **Purpose**: Store before/after photos
- **Implementation**:
  ```javascript
  // Professional Portal: src/portal/pages/PortalGallery.jsx
  import { uploadFile } from '../utils/storage';
  
  // Upload before photo
  await uploadFile({
    key: `session-photos/${bookingId}/before.jpg`,
    body: beforePhotoFile,
    contentType: 'image/jpeg',
  });
  
  // Upload after photo
  await uploadFile({
    key: `session-photos/${bookingId}/after.jpg`,
    body: afterPhotoFile,
    contentType: 'image/jpeg',
  });
  ```

#### 2. **AWS AppSync** (Update Booking)
- **Service**: `appsync`
- **Action**: `UpdateBooking` mutation
- **Purpose**: Mark service as completed
- **Update**:
  ```javascript
  await client.graphql({
    query: updateBooking,
    variables: {
      input: {
        id: bookingId,
        status: 'completed',
        afterPhotos: [
          's3://bucket/session-photos/booking-123/after.jpg',
        ],
      }
    }
  });
  ```

#### 3. **Amazon DynamoDB** (Store Feedback)
- **Service**: `dynamodb`
- **Action**: `UpdateItem`
- **Purpose**: Store feedback ratings
- **Update**:
  ```json
  {
    "id": "booking-123",
    "modelFeedback": {
      "rating": 5,
      "comments": "Amazing blowout!",
      "submittedAt": "2024-12-20T11:00:00Z"
    },
    "professionalFeedback": {
      "rating": 5,
      "comments": "Emma was great!",
      "submittedAt": "2024-12-20T11:05:00Z"
    }
  }
  ```

---

## Step 9: Metrics & Security Logging

### **AWS Services Used:**

#### 1. **AWS CloudWatch** (Custom Metrics)
- **Service**: `cloudwatch`
- **Action**: `PutMetricData`
- **Purpose**: Track business metrics
- **Metrics Sent**:
  ```javascript
  // Booking confirmed
  await putMetric('BookingConfirmed', 1, 'Count', {
    ServiceType: 'blowout',
  });
  
  // Payment processed
  await putMetric('PaymentProcessed', 1, 'Count', {
    Status: 'success',
    Amount: 10.00,
  });
  
  // Service completed
  await putMetric('ServiceCompleted', 1, 'Count', {
    ServiceType: 'blowout',
  });
  ```

#### 2. **AWS CloudWatch Logs** (Application Logs)
- **Service**: `logs`
- **Action**: Automatic logging
- **Log Groups**:
  - `/aws/lambda/stripe-payment`
  - `/aws/lambda/notifications`
  - `/aws/appsync/api`

#### 3. **AWS CloudTrail** (Security Logging)
- **Service**: `cloudtrail`
- **Action**: Automatic logging
- **Events Logged**:
  - All AppSync API calls
  - All DynamoDB operations
  - All S3 operations
  - All Lambda invocations
  - All SES/SNS operations

#### 4. **Amazon DynamoDB Streams** (Optional: Real-time Updates)
- **Service**: `dynamodb-streams`
- **Action**: Stream events
- **Purpose**: Real-time updates to dashboard
- **Implementation** (if using):
  ```javascript
  // Stream triggers Lambda
  // Lambda updates CloudWatch metrics in real-time
  ```

---

## Step 10: Admin Dashboard Updates

### **AWS Services Used:**

#### 1. **AWS AppSync** (Query Data)
- **Service**: `appsync`
- **Action**: `ListBookings`, `ListMatches`, etc.
- **Purpose**: Fetch dashboard data
- **Queries**:
  ```javascript
  // Get all bookings
  const bookings = await client.graphql({
    query: listBookings,
    variables: {
      filter: {
        status: { eq: 'completed' },
      }
    }
  });
  
  // Get revenue
  const revenue = bookings.reduce((sum, b) => sum + b.totalRevenue, 0);
  ```

#### 2. **Amazon DynamoDB** (Read Data)
- **Service**: `dynamodb`
- **Action**: `Query` / `Scan` (via AppSync)
- **Purpose**: Retrieve dashboard data

#### 3. **AWS CloudWatch** (Dashboard Metrics)
- **Service**: `cloudwatch`
- **Action**: `GetMetricStatistics`
- **Purpose**: Display metrics on dashboard
- **Metrics Retrieved**:
  - Total bookings
  - Revenue
  - Error rates
  - Active users

---

## 🔄 Waitlist Management (Additional Flow)

### **If Booking Cancels:**

#### 1. **AWS AppSync** (Cancel Booking)
- **Service**: `appsync`
- **Action**: `UpdateBooking` mutation
- **Purpose**: Mark booking as cancelled

#### 2. **Amazon DynamoDB** (Query Waitlist)
- **Service**: `dynamodb`
- **Action**: `Query`
- **Purpose**: Find next person on waitlist
- **Query**:
  ```javascript
  {
    TableName: 'Match-dev',
    IndexName: 'requestId-status-index',
    KeyConditionExpression: 'requestId = :reqId AND #status = :status',
    FilterExpression: 'waitlistPosition = :position',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':reqId': requestId,
      ':status': 'waitlist',
      ':position': 1, // Next in line
    },
    Limit: 1,
  }
  ```

#### 3. **AWS Lambda** (Notify Waitlist)
- **Service**: `lambda`
- **Function**: `notificationsFunction`
- **Action**: `Invoke`
- **Purpose**: Notify next person on waitlist

#### 4. **Amazon SES** (Waitlist Promotion Email)
- **Service**: `ses`
- **Action**: `SendEmail`
- **Purpose**: "Booking opened up! You're next!"

---

## 📊 Complete AWS Services Summary

| Step | AWS Service | Action | Purpose |
|------|-------------|--------|---------|
| 1 | Cognito | GetUser | Authenticate professional |
| 1 | AppSync | CreateModelRequest | Save request |
| 1 | DynamoDB | PutItem | Store request data |
| 1 | CloudWatch | PutMetricData | Track request creation |
| 1 | CloudTrail | Auto-log | Log API call |
| 2 | AppSync | ListModelProfiles | Get available models |
| 2 | DynamoDB | Query | Retrieve model data |
| 2 | AppSync | CreateMatch (x5) | Create 5 match records |
| 2 | DynamoDB | PutItem (x5) | Store matches |
| 2 | Lambda | Invoke (x5) | Send notifications |
| 2 | SES | SendEmail (x5) | Email 5 models |
| 2 | SNS | Publish (x5) | SMS 5 models |
| 2 | CloudWatch | PutMetricData | Track matching |
| 4 | AppSync | GetMatch | Check availability |
| 4 | DynamoDB | UpdateItem (atomic) | Claim booking (race condition) |
| 4 | AppSync | CreateBooking | Create booking |
| 4 | Lambda | Invoke | Stripe payment |
| 4 | Stripe API | paymentIntents.create | Create payment |
| 4 | DynamoDB | UpdateItem | Update booking payment |
| 4 | AppSync | UpdateMatch (x4) | Move others to waitlist |
| 4 | DynamoDB | UpdateItem (x4) | Update waitlist status |
| 4 | Lambda | Invoke (x4) | Notify waitlist |
| 4 | SES | SendEmail (x4) | Waitlist emails |
| 5 | Lambda | Invoke (x2) | Send confirmations |
| 5 | SES | SendEmail (x2) | Confirmation emails |
| 5 | SNS | Publish (x2) | Confirmation SMS |
| 7 | EventBridge | Scheduled rule | Trigger reminder |
| 7 | Lambda | Invoke | Check bookings |
| 7 | DynamoDB | Query | Find bookings 24h away |
| 7 | SES | SendEmail (x2) | Reminder emails |
| 7 | SNS | Publish (x2) | Reminder SMS |
| 8 | S3 | PutObject (x2) | Store photos |
| 8 | AppSync | UpdateBooking | Mark completed |
| 8 | DynamoDB | UpdateItem | Store feedback |
| 9 | CloudWatch | PutMetricData | Track metrics |
| 9 | CloudTrail | Auto-log | Log all events |
| 10 | AppSync | ListBookings | Get dashboard data |
| 10 | CloudWatch | GetMetricStatistics | Get metrics |

---

## 🔐 Security & Compliance

### **All Operations Logged in CloudTrail:**
- ✅ Every API call
- ✅ Every database operation
- ✅ Every file upload
- ✅ Every payment transaction
- ✅ Every notification sent

### **All Metrics Tracked in CloudWatch:**
- ✅ Request creation
- ✅ Match creation
- ✅ Payment processing
- ✅ Notification delivery
- ✅ Service completion
- ✅ Error rates

---

**This is the complete technical breakdown!** Every AWS service, action, and implementation detail. 🚀

