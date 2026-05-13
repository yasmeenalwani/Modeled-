import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

/**
 * RDS Analytics Utilities
 * 
 * Functions to query RDS PostgreSQL for analytics and reporting
 */

let pgClient = null;
let connectionPromise = null;

/**
 * Get RDS connection
 */
async function getConnection() {
  if (pgClient && !pgClient.ended) {
    return pgClient;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });
    
    // Get credentials from Secrets Manager
    const secretResponse = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: process.env.RDS_SECRET_ARN || 'modeled-analytics-db-credentials',
      })
    );

    const credentials = JSON.parse(secretResponse.SecretString || '{}');
    const endpoint = process.env.RDS_ENDPOINT || credentials.host;

    const client = new Client({
      host: endpoint,
      port: 5432,
      database: process.env.RDS_DATABASE || 'modeled_analytics',
      user: credentials.username,
      password: credentials.password,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    pgClient = client;
    return client;
  })();

  return connectionPromise;
}

/**
 * Revenue by month and service type
 */
export async function getRevenueByMonth(months = 12) {
  const client = await getConnection();
  
  const query = `
    SELECT 
      month,
      service_type,
      SUM(total_revenue) as revenue,
      SUM(booking_count) as bookings,
      AVG(avg_booking_value) as avg_value
    FROM revenue_summary
    WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${months} months')
    GROUP BY month, service_type
    ORDER BY month DESC, revenue DESC;
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Revenue trends over time
 */
export async function getRevenueTrends(days = 30) {
  const client = await getConnection();
  
  const query = `
    SELECT 
      DATE_TRUNC('day', appointment_date) as date,
      SUM(payment_amount) as daily_revenue,
      COUNT(*) as daily_bookings,
      AVG(payment_amount) as avg_booking_value
    FROM bookings
    WHERE appointment_date >= CURRENT_DATE - INTERVAL '${days} days'
      AND status IN ('confirmed', 'completed')
    GROUP BY DATE_TRUNC('day', appointment_date)
    ORDER BY date DESC;
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Service performance metrics
 */
export async function getServicePerformance() {
  const client = await getConnection();
  
  const query = `
    SELECT * FROM service_performance
    ORDER BY total_revenue DESC;
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Match conversion rates
 */
export async function getMatchConversion(weeks = 12) {
  const client = await getConnection();
  
  const query = `
    SELECT * FROM match_conversion
    WHERE week >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '${weeks} weeks')
    ORDER BY week DESC;
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Request trends
 */
export async function getRequestTrends(days = 30) {
  const client = await getConnection();
  
  const query = `
    SELECT * FROM trends_summary
    WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date DESC;
  `;

  const result = await client.query(query);
  return result.rows;
}

/**
 * Top performing professionals
 */
export async function getTopProfessionals(limit = 10) {
  const client = await getConnection();
  
  const query = `
    SELECT 
      professional_id,
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      SUM(payment_amount) as total_revenue,
      AVG(payment_amount) as avg_revenue_per_booking,
      AVG(duration) as avg_duration
    FROM bookings
    WHERE professional_id IS NOT NULL
    GROUP BY professional_id
    ORDER BY total_revenue DESC
    LIMIT $1;
  `;

  const result = await client.query(query, [limit]);
  return result.rows;
}

/**
 * Top performing models
 */
export async function getTopModels(limit = 10) {
  const client = await getConnection();
  
  const query = `
    SELECT 
      model_id,
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      AVG(match_score) as avg_match_score,
      COUNT(CASE WHEN status = 'waitlist' THEN 1 END) as waitlist_count
    FROM matches m
    LEFT JOIN bookings b ON m.booking_id = b.id
    WHERE model_id IS NOT NULL
    GROUP BY model_id
    ORDER BY total_bookings DESC, avg_match_score DESC
    LIMIT $1;
  `;

  const result = await client.query(query, [limit]);
  return result.rows;
}

/**
 * Revenue by date range
 */
export async function getRevenueByDateRange(startDate: string, endDate: string) {
  const client = await getConnection();
  
  const query = `
    SELECT 
      DATE_TRUNC('day', appointment_date) as date,
      service_type,
      SUM(payment_amount) as revenue,
      COUNT(*) as bookings
    FROM bookings
    WHERE appointment_date >= $1
      AND appointment_date <= $2
      AND status IN ('confirmed', 'completed')
    GROUP BY DATE_TRUNC('day', appointment_date), service_type
    ORDER BY date DESC, revenue DESC;
  `;

  const result = await client.query(query, [startDate, endDate]);
  return result.rows;
}

/**
 * Refresh materialized views
 */
export async function refreshAnalyticsViews() {
  const client = await getConnection();
  
  await client.query('SELECT refresh_revenue_summary()');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY trends_summary');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY service_performance');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY match_conversion');
  
  return { success: true, message: 'Views refreshed' };
}

