import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AuthorizationType, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { stripePaymentFunction } from './functions/stripe-payment/resource';
import { notificationsFunction } from './functions/notifications/resource';
import { dynamodbSyncFunction } from './functions/dynamodb-sync/resource';
import { analyticsApiFunction } from './functions/analytics-api/resource';
import { photoAnalysisFunction } from './functions/photo-analysis/resource';
import { identityVerificationFunction } from './functions/identity-verification/resource';
import { matchExpirationFunction } from './functions/match-expiration/resource';
import { pinpointCampaignsFunction } from './functions/pinpoint-campaigns/resource';
import { pinpointSegmentsFunction } from './functions/pinpoint-segments/resource';
import { bookingRemindersFunction } from './functions/booking-reminders/resource';
import { chatActivationFunction } from './functions/chat-activation/resource';
import { modelPaymentRemindersFunction } from './functions/model-payment-reminders/resource';
import { autoMatchingFunction } from './functions/auto-matching/resource';
import { agenticDecayFunction } from './functions/agentic-decay/resource';
import { crmOutreachFunction } from './functions/crm-outreach/resource';
import { crmFollowupsFunction } from './functions/crm-followups/resource';
// import { monitoring } from './monitoring/resource'; // Uncomment to enable monitoring

/**
 * MODELED MANAGEMENT - AWS Backend Configuration
 * 
 * Services:
 * - Auth: Amazon Cognito (user authentication)
 * - Data: AWS AppSync + DynamoDB (GraphQL API + database)
 * - Storage: Amazon S3 (photos, documents, videos)
 * - Functions: Lambda for Stripe payments & notifications (SES/SNS + Pinpoint)
 * - Analytics: RDS PostgreSQL for analytics & reporting
 * - Sync: DynamoDB Streams → RDS sync function
 * - Monitoring: CloudWatch dashboards, alarms, and CloudTrail security logging
 *   (Note: CloudWatch alarms can be set up via script or AWS Console - see CLOUDWATCH_ALARMS_SETUP.md)
 * 
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  stripePaymentFunction,
  notificationsFunction,
  dynamodbSyncFunction,
  analyticsApiFunction,
  photoAnalysisFunction,
  identityVerificationFunction,
  matchExpirationFunction,
  pinpointCampaignsFunction,
  pinpointSegmentsFunction,
  bookingRemindersFunction,
  chatActivationFunction,
  modelPaymentRemindersFunction,
  autoMatchingFunction,
  agenticDecayFunction,
  crmOutreachFunction,
  crmFollowupsFunction,
  // ...monitoring, // Uncomment to enable monitoring resources
});

// Wire booking-reminders and model-payment-reminders to invoke notifications Lambda
const bookingRemindersLambda = backend.bookingRemindersFunction.resources.lambda;
const modelPaymentRemindersLambda = backend.modelPaymentRemindersFunction.resources.lambda;
const notificationsLambda = backend.notificationsFunction.resources.lambda;
(bookingRemindersLambda as NodejsFunction).addEnvironment('NOTIFICATIONS_FUNCTION_NAME', notificationsLambda.functionName);
notificationsLambda.grantInvoke(bookingRemindersLambda);
(modelPaymentRemindersLambda as NodejsFunction).addEnvironment('NOTIFICATIONS_FUNCTION_NAME', notificationsLambda.functionName);
notificationsLambda.grantInvoke(modelPaymentRemindersLambda);

// ============ Identity Verification REST API ============
const apiStack = backend.createStack('IdentityVerificationApi');
const identityVerificationLambda = backend.identityVerificationFunction.resources.lambda;

const identityVerificationApi = new RestApi(apiStack, 'IdentityVerificationRestApi', {
  restApiName: 'identityVerificationApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const lambdaIntegration = new LambdaIntegration(identityVerificationLambda);
const verifyIdentityPath = identityVerificationApi.root.addResource('verify-identity', {
  defaultMethodOptions: { authorizationType: AuthorizationType.IAM },
});
verifyIdentityPath.addMethod('POST', lambdaIntegration);

const apiPolicy = new PolicyStatement({
  actions: ['execute-api:Invoke'],
  resources: [`${identityVerificationApi.arnForExecuteApi('*', '/verify-identity', 'dev')}`],
});
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(apiPolicy);

backend.addOutput({
  custom: {
    API: {
      identityVerificationApi: {
        endpoint: identityVerificationApi.url,
        region: Stack.of(identityVerificationApi).region,
        apiName: 'identityVerificationApi',
      },
    },
  },
});

// ============ Stripe Payment REST API ============
const stripeApiStack = backend.createStack('StripePaymentApi');
const stripePaymentLambda = backend.stripePaymentFunction.resources.lambda;

const stripePaymentApi = new RestApi(stripeApiStack, 'StripePaymentRestApi', {
  restApiName: 'stripePaymentApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: [...Cors.DEFAULT_HEADERS, 'stripe-signature'],
  },
});

const stripeLambdaIntegration = new LambdaIntegration(stripePaymentLambda);

// POST /payment — create payment intent, confirm, setup intent, attach method
const stripePaymentPath = stripePaymentApi.root.addResource('payment', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});
stripePaymentPath.addMethod('POST', stripeLambdaIntegration);

// POST /refund
const stripeRefundPath = stripePaymentApi.root.addResource('refund', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});
stripeRefundPath.addMethod('POST', stripeLambdaIntegration);

// POST /webhook — Stripe calls this after payment events (no auth, Stripe signs the payload)
const stripeWebhookPath = stripePaymentApi.root.addResource('webhook', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});
stripeWebhookPath.addMethod('POST', stripeLambdaIntegration);

// Grant the Lambda permission to read from Secrets Manager
stripePaymentLambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['secretsmanager:GetSecretValue'],
  resources: [
    `arn:aws:secretsmanager:*:*:secret:stripe-secret-key*`,
    `arn:aws:secretsmanager:*:*:secret:stripe-webhook-secret*`,
  ],
}));

backend.addOutput({
  custom: {
    stripeApiName: 'stripePaymentApi',
    stripeApiEndpoint: stripePaymentApi.url,
  },
});

// TODO: DynamoDB Stream for auto-matching
// When ModelRequest table supports it, wire: backend.data.resources.tables["ModelRequest"]
// → EventSourceMapping with tableStreamArn. See docs.amplify.aws/.../dynamo-db-stream
