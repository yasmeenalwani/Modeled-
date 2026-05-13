import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';
import type { Handler } from 'aws-lambda';

/**
 * DynamoDB Stream Handler
 * 
 * Syncs DynamoDB changes to RDS PostgreSQL
 * 
 * Event structure from DynamoDB Streams:
 * {
 *   Records: [
 *     {
 *       eventName: 'INSERT' | 'MODIFY' | 'REMOVE',
 *       dynamodb: {
 *         NewImage: { ... },
 *         OldImage: { ... }
 *       }
 *     }
 *   ]
 * }
 */
export const handler: Handler = async (event) => {
  console.log('DynamoDB Stream Event:', JSON.stringify(event, null, 2));

  const secretsClient = new SecretsManagerClient({ region: process.env.RDS_REGION || 'us-east-1' });
  let pgClient: Client | null = null;

  try {
    // Get RDS credentials from Secrets Manager
    const secretResponse = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: process.env.RDS_SECRET_ARN,
      })
    );

    const credentials = JSON.parse(secretResponse.SecretString || '{}');
    const endpoint = process.env.RDS_ENDPOINT || credentials.host;

    // Connect to RDS
    pgClient = new Client({
      host: endpoint,
      port: 5432,
      database: process.env.RDS_DATABASE || 'modeled_analytics',
      user: credentials.username,
      password: credentials.password,
      ssl: {
        rejectUnauthorized: false, // For RDS, this is safe
      },
    });

    await pgClient.connect();
    console.log('Connected to RDS');

    // Process each record from DynamoDB Stream
    for (const record of event.Records) {
      const eventName = record.eventName;
      const tableName = record.eventSourceARN.split('/')[1];

      console.log(`Processing ${eventName} for table ${tableName}`);

      switch (eventName) {
        case 'INSERT':
        case 'MODIFY':
          await syncRecord(pgClient, tableName, record.dynamodb.NewImage, eventName);
          break;

        case 'REMOVE':
          await deleteRecord(pgClient, tableName, record.dynamodb.OldImage);
          break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sync completed successfully' }),
    };
  } catch (error: any) {
    console.error('Sync error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
  }
};

/**
 * Sync a record to RDS
 */
async function syncRecord(client: Client, tableName: string, item: any, eventType: string) {
  // Map DynamoDB table names to RDS table names
  const tableMap: Record<string, string> = {
    'Booking': 'bookings',
    'ModelRequest': 'model_requests',
    'Match': 'matches',
    'ModelProfile': 'model_profiles',
    'Professional': 'professionals',
    'Partner': 'partners',
    'Service': 'services',
  };

  const rdsTableName = tableMap[tableName] || tableName.toLowerCase();
  
  if (!rdsTableName || rdsTableName === tableName.toLowerCase()) {
    console.log(`Skipping table ${tableName} - not mapped for analytics`);
    return;
  }

  // Convert DynamoDB item to flat object
  const flatItem = flattenDynamoDBItem(item);

  try {
    switch (tableName) {
      case 'Booking':
        await syncBooking(client, flatItem, eventType);
        break;
      case 'ModelRequest':
        await syncModelRequest(client, flatItem, eventType);
        break;
      case 'Match':
        await syncMatch(client, flatItem, eventType);
        break;
      case 'ModelProfile':
      case 'Professional':
      case 'Partner':
        // TODO: Add RDS sync for these tables when needed
        console.log(`Sync skipped for ${tableName} (not yet implemented)`);
        break;
      default:
        console.log(`No specific sync handler for ${tableName}`);
    }
  } catch (error: any) {
    console.error(`Error syncing ${tableName}:`, error);
    // Don't throw - continue processing other records
  }
}

/**
 * Sync Booking to RDS
 */
async function syncBooking(client: Client, item: any, eventType: string) {
  const query = `
    INSERT INTO bookings (
      id, request_id, model_id, professional_id,
      appointment_date, appointment_time, duration, location,
      service_type, service_description,
      model_fee, model_payment_status, professional_fee, professional_payment_status,
      payment_amount, payment_currency, payment_date,
      status, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      request_id = EXCLUDED.request_id,
      model_id = EXCLUDED.model_id,
      professional_id = EXCLUDED.professional_id,
      appointment_date = EXCLUDED.appointment_date,
      appointment_time = EXCLUDED.appointment_time,
      duration = EXCLUDED.duration,
      location = EXCLUDED.location,
      service_type = EXCLUDED.service_type,
      service_description = EXCLUDED.service_description,
      model_fee = EXCLUDED.model_fee,
      model_payment_status = EXCLUDED.model_payment_status,
      professional_fee = EXCLUDED.professional_fee,
      professional_payment_status = EXCLUDED.professional_payment_status,
      payment_amount = EXCLUDED.payment_amount,
      payment_currency = EXCLUDED.payment_currency,
      payment_date = EXCLUDED.payment_date,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at;
  `;

  await client.query(query, [
    item.id,
    item.requestId,
    item.modelId,
    item.professionalId,
    item.appointmentDate,
    item.appointmentTime,
    item.duration,
    item.location,
    item.serviceType,
    item.serviceDescription,
    item.modelFee,
    item.modelPaymentStatus,
    item.professionalFee,
    item.professionalPaymentStatus,
    item.paymentAmount,
    item.paymentCurrency,
    item.paymentDate,
    item.status,
    item.createdAt || new Date().toISOString(),
    item.updatedAt || new Date().toISOString(),
  ]);
}

/**
 * Sync ModelRequest to RDS
 */
async function syncModelRequest(client: Client, item: any, eventType: string) {
  const query = `
    INSERT INTO model_requests (
      id, professional_id, service_type, service_description,
      requested_date, requested_time, duration, location,
      status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) 
    DO UPDATE SET
      professional_id = EXCLUDED.professional_id,
      service_type = EXCLUDED.service_type,
      service_description = EXCLUDED.service_description,
      requested_date = EXCLUDED.requested_date,
      requested_time = EXCLUDED.requested_time,
      duration = EXCLUDED.duration,
      location = EXCLUDED.location,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at;
  `;

  await client.query(query, [
    item.id,
    item.professionalId,
    item.serviceType,
    item.serviceDescription,
    item.requestedDate,
    item.requestedTime,
    item.duration,
    item.location,
    item.status,
    item.createdAt || new Date().toISOString(),
    item.updatedAt || new Date().toISOString(),
  ]);
}

/**
 * Sync Match to RDS
 */
async function syncMatch(client: Client, item: any, eventType: string) {
  const query = `
    INSERT INTO matches (
      id, request_id, model_id, match_score,
      status, waitlist_position, booking_id,
      sent_at, responded_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) 
    DO UPDATE SET
      request_id = EXCLUDED.request_id,
      model_id = EXCLUDED.model_id,
      match_score = EXCLUDED.match_score,
      status = EXCLUDED.status,
      waitlist_position = EXCLUDED.waitlist_position,
      booking_id = EXCLUDED.booking_id,
      sent_at = EXCLUDED.sent_at,
      responded_at = EXCLUDED.responded_at,
      updated_at = EXCLUDED.updated_at;
  `;

  await client.query(query, [
    item.id,
    item.requestId,
    item.modelId,
    item.matchScore,
    item.status,
    item.waitlistPosition,
    item.bookingId,
    item.sentAt,
    item.respondedAt,
    item.createdAt || new Date().toISOString(),
    item.updatedAt || new Date().toISOString(),
  ]);
}

/**
 * Delete a record from RDS
 */
async function deleteRecord(client: Client, tableName: string, item: any) {
  const flatItem = flattenDynamoDBItem(item);
  const tableMap: Record<string, string> = {
    'Booking': 'bookings',
    'ModelRequest': 'model_requests',
    'Match': 'matches',
  };

  const rdsTableName = tableMap[tableName];
  if (!rdsTableName) return;

  await client.query(`DELETE FROM ${rdsTableName} WHERE id = $1`, [flatItem.id]);
}

/**
 * Flatten DynamoDB item format to regular object
 */
function flattenDynamoDBItem(item: any): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (value && typeof value === 'object' && 'S' in value) {
      // String
      result[key] = value.S;
    } else if (value && typeof value === 'object' && 'N' in value) {
      // Number
      result[key] = parseFloat((value as { N: string }).N);
    } else if (value && typeof value === 'object' && 'BOOL' in value) {
      // Boolean
      result[key] = value.BOOL;
    } else if (value && typeof value === 'object' && 'NULL' in value) {
      // Null
      result[key] = null;
    } else if (value && typeof value === 'object' && 'L' in value) {
      // List
      result[key] = (value as { L: unknown[] }).L.map((v: unknown) => flattenDynamoDBItem(v as Record<string, unknown>));
    } else if (value && typeof value === 'object' && 'M' in value) {
      // Map
      result[key] = flattenDynamoDBItem(value.M);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

