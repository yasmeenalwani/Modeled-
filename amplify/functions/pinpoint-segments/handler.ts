import { 
  PinpointClient, 
  CreateSegmentCommand, 
  GetSegmentCommand,
  UpdateSegmentCommand,
  UpdateEndpointCommand,
  GetEndpointCommand,
} from '@aws-sdk/client-pinpoint';
import type { Handler } from 'aws-lambda';

const pinpointClient = new PinpointClient({ 
  region: process.env.PINPOINT_REGION || 'us-east-1' 
});

const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID || '';

/**
 * Pinpoint Segments Handler
 * 
 * Handles segment and endpoint operations:
 * - Create/update segments
 * - Sync user data to endpoints
 * - Get segment details
 */
export const handler: Handler = async (event) => {
  console.log('Pinpoint Segments Event:', JSON.stringify(event, null, 2));
  
  try {
    const { action, ...params } = event;
    
    switch (action) {
      case 'createSegment':
        return await createSegment(params);
      case 'getSegment':
        return await getSegment(params);
      case 'updateSegment':
        return await updateSegment(params);
      case 'updateEndpoint':
        return await updateEndpoint(params);
      case 'getEndpoint':
        return await getEndpoint(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Pinpoint Segments Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    };
  }
};

/**
 * Create a new segment
 */
async function createSegment(params: {
  name: string;
  criteria: {
    Demographic?: {
      UserAttributes?: Record<string, string[]>;
    };
    Behavior?: {
      Recency?: {
        Duration: string;
        RecencyType: 'ACTIVE' | 'INACTIVE';
      };
    };
  };
}) {
  const { name, criteria } = params;
  
  const command = new CreateSegmentCommand({
    ApplicationId: PINPOINT_APP_ID,
    WriteSegmentRequest: {
      Name: name,
      Dimensions: criteria,
    },
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      segmentId: response.SegmentResponse?.Id,
      arn: response.SegmentResponse?.Arn,
    }),
  };
}

/**
 * Get segment details
 */
async function getSegment(params: {
  segmentId: string;
}) {
  const { segmentId } = params;
  
  const command = new GetSegmentCommand({
    ApplicationId: PINPOINT_APP_ID,
    SegmentId: segmentId,
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      segment: response.SegmentResponse,
    }),
  };
}

/**
 * Update segment
 */
async function updateSegment(params: {
  segmentId: string;
  criteria: any;
}) {
  const { segmentId, criteria } = params;
  
  const command = new UpdateSegmentCommand({
    ApplicationId: PINPOINT_APP_ID,
    SegmentId: segmentId,
    WriteSegmentRequest: {
      Dimensions: criteria,
    },
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      segment: response.SegmentResponse,
    }),
  };
}

/**
 * Update or create user endpoint in Pinpoint
 * Syncs user data for segmentation
 */
async function updateEndpoint(params: {
  userId: string;
  email?: string;
  phone?: string;
  attributes?: Record<string, string[]>;
  metrics?: Record<string, number>;
}) {
  const { userId, email, phone, attributes = {}, metrics = {} } = params;
  
  const endpointId = userId; // Use userId as endpoint ID
  
  const command = new UpdateEndpointCommand({
    ApplicationId: PINPOINT_APP_ID,
    EndpointId: endpointId,
    EndpointRequest: {
      ChannelType: email ? 'EMAIL' : phone ? 'SMS' : 'EMAIL',
      Address: email || phone || '',
      Attributes: attributes,
      Metrics: metrics,
      User: {
        UserId: userId,
        UserAttributes: attributes,
      },
    },
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      messageRequestId: response.MessageBody?.MessageRequestId,
    }),
  };
}

/**
 * Get endpoint details
 */
async function getEndpoint(params: {
  userId: string;
}) {
  const { userId } = params;
  const endpointId = userId;
  
  const command = new GetEndpointCommand({
    ApplicationId: PINPOINT_APP_ID,
    EndpointId: endpointId,
  });
  
  const response = await pinpointClient.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      endpoint: response.EndpointResponse,
    }),
  };
}

