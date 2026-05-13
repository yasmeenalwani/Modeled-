import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';
import type { Handler } from 'aws-lambda';

/**
 * Analytics API Handler
 * 
 * Provides secure access to RDS analytics queries
 * 
 * Event structure:
 * {
 *   action: 'getRevenueByMonth' | 'getRevenueTrends' | 'getServicePerformance' | etc.,
 *   params: { months: 12, days: 30, ... }
 * }
 */
export const handler: Handler = async (event) => {
  console.log('Analytics API Event:', JSON.stringify(event, null, 2));

  const secretsClient = new SecretsManagerClient({ region: process.env.RDS_REGION || 'us-east-1' });
  let pgClient: Client | null = null;

  try {
    // Get RDS credentials from Secrets Manager
    // Try to get secret ARN from environment, or use secret name
    const secretId = process.env.RDS_SECRET_ARN || 'modeled-analytics-db-credentials';
    
    const secretResponse = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretId,
      })
    );

    const credentials = JSON.parse(secretResponse.SecretString || '{}');
    
    // Endpoint can come from:
    // 1. Environment variable RDS_ENDPOINT
    // 2. Secret's 'host' field
    // 3. Separate 'rds-endpoint' secret
    let endpoint = process.env.RDS_ENDPOINT || credentials.host || credentials.endpoint;
    
    if (!endpoint) {
      // Try to get endpoint from separate secret
      try {
        const endpointSecretResponse = await secretsClient.send(
          new GetSecretValueCommand({
            SecretId: 'rds-endpoint',
          })
        );
        endpoint = endpointSecretResponse.SecretString?.trim().replace(/"/g, '');
      } catch (error) {
        console.warn('Could not retrieve endpoint from separate secret:', error);
      }
    }
    
    if (!endpoint) {
      throw new Error('RDS endpoint not found. Please set RDS_ENDPOINT environment variable or ensure secret contains "host" field.');
    }

    // Connect to RDS
    pgClient = new Client({
      host: endpoint,
      port: 5432,
      database: process.env.RDS_DATABASE || 'modeled_analytics',
      user: credentials.username,
      password: credentials.password,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await pgClient.connect();

    const { action, params = {} } = event;

    let result;

    switch (action) {
      case 'getRevenueByMonth':
        result = await getRevenueByMonth(pgClient, params.months || 12);
        break;

      case 'getRevenueTrends':
        result = await getRevenueTrends(pgClient, params.days || 30);
        break;

      case 'getServicePerformance':
        result = await getServicePerformance(pgClient);
        break;

      case 'getMatchConversion':
        result = await getMatchConversion(pgClient, params.weeks || 12);
        break;

      case 'getRequestTrends':
        result = await getRequestTrends(pgClient, params.days || 30);
        break;

      case 'getTopProfessionals':
        result = await getTopProfessionals(pgClient, params.limit || 10);
        break;

      case 'getTopModels':
        result = await getTopModels(pgClient, params.limit || 10);
        break;

      case 'getRevenueByDateRange':
        result = await getRevenueByDateRange(pgClient, params.startDate, params.endDate);
        break;

      case 'refreshViews':
        result = await refreshAnalyticsViews(pgClient);
        break;

      case 'getOnboardingFunnel':
        result = await getOnboardingFunnel(pgClient, params.days || 30, params.userType);
        break;

      case 'getOnboardingDropoff':
        result = await getOnboardingDropoff(pgClient, params.userType);
        break;

      case 'getOnboardingStats':
        result = await getOnboardingStats(pgClient, params.days || 30);
        break;

      case 'trackOnboardingEvent':
        result = await trackOnboardingEvent(pgClient, params.event);
        break;

      case 'getEngagementSummary':
        result = await getEngagementSummary(pgClient, params.days || 30, params.userType);
        break;

      case 'getUserEngagementMetrics':
        result = await getUserEngagementMetrics(pgClient, params.userId, params.userType, params.days);
        break;

      case 'getFeatureEngagement':
        result = await getFeatureEngagement(pgClient, params.userType);
        break;

      case 'getBookingFunnel':
        result = await getBookingFunnel(pgClient, params.days || 30, params.userType);
        break;

      case 'getStickinessMetrics':
        result = await getStickinessMetrics(pgClient, params.days || 30, params.userType);
        break;

      case 'trackEngagementEvent':
        result = await trackEngagementEvent(pgClient, params.event);
        break;

      case 'trackSession':
        result = await trackSession(pgClient, params.session);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
  }
};

// Query functions (same as in rds-analytics.js)
async function getRevenueByMonth(client: Client, months: number) {
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

async function getRevenueTrends(client: Client, days: number) {
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

async function getServicePerformance(client: Client) {
  const query = `SELECT * FROM service_performance ORDER BY total_revenue DESC;`;
  const result = await client.query(query);
  return result.rows;
}

async function getMatchConversion(client: Client, weeks: number) {
  const query = `
    SELECT * FROM match_conversion
    WHERE week >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '${weeks} weeks')
    ORDER BY week DESC;
  `;
  const result = await client.query(query);
  return result.rows;
}

async function getRequestTrends(client: Client, days: number) {
  const query = `
    SELECT * FROM trends_summary
    WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
    ORDER BY date DESC;
  `;
  const result = await client.query(query);
  return result.rows;
}

async function getTopProfessionals(client: Client, limit: number) {
  const query = `
    SELECT 
      professional_id,
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      SUM(payment_amount) as total_revenue,
      AVG(payment_amount) as avg_revenue_per_booking
    FROM bookings
    WHERE professional_id IS NOT NULL
    GROUP BY professional_id
    ORDER BY total_revenue DESC
    LIMIT $1;
  `;
  const result = await client.query(query, [limit]);
  return result.rows;
}

async function getTopModels(client: Client, limit: number) {
  const query = `
    SELECT 
      model_id,
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
      AVG(m.match_score) as avg_match_score
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

async function getRevenueByDateRange(client: Client, startDate: string, endDate: string) {
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

async function refreshAnalyticsViews(client: Client) {
  await client.query('SELECT refresh_revenue_summary()');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY trends_summary');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY service_performance');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY match_conversion');
  await client.query('SELECT refresh_onboarding_views()');
  await client.query('SELECT refresh_engagement_views()');
  return { success: true, message: 'Views refreshed' };
}

// ============================================
// ENGAGEMENT ANALYTICS FUNCTIONS
// ============================================

async function getEngagementSummary(client: Client, days: number, userType?: string) {
  let query = `
    SELECT * FROM engagement_summary
    WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
  `;
  const params: any[] = [];
  
  if (userType) {
    query += ` AND user_type = $1`;
    params.push(userType);
  }
  
  query += ` ORDER BY date DESC, user_type;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getUserEngagementMetrics(client: Client, userId?: string, userType?: string, days?: number) {
  let query = 'SELECT * FROM user_engagement_metrics WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (userId) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  if (userType) {
    query += ` AND user_type = $${paramIndex}`;
    params.push(userType);
    paramIndex++;
  }
  
  if (days) {
    query += ` AND last_active_at >= CURRENT_DATE - INTERVAL '${days} days'`;
  }
  
  query += ` ORDER BY days_active DESC, total_sessions DESC LIMIT 100;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getFeatureEngagement(client: Client, userType?: string) {
  let query = 'SELECT * FROM feature_engagement';
  const params: any[] = [];
  
  if (userType) {
    query += ` WHERE user_type = $1`;
    params.push(userType);
  }
  
  query += ` ORDER BY unique_users DESC, starts DESC;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getBookingFunnel(client: Client, days: number, userType?: string) {
  let query = `
    SELECT * FROM booking_funnel
    WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
  `;
  const params: any[] = [];
  
  if (userType) {
    query += ` AND user_type = $1`;
    params.push(userType);
  }
  
  query += ` ORDER BY date DESC, user_type;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getStickinessMetrics(client: Client, days: number, userType?: string) {
  // Calculate sessions per user, days active per week, etc.
  const query = `
    SELECT 
      user_type,
      COUNT(DISTINCT user_id) as total_users,
      COUNT(DISTINCT session_id) as total_sessions,
      AVG(sessions_per_user) as avg_sessions_per_user,
      AVG(days_active) as avg_days_active,
      COUNT(DISTINCT CASE WHEN days_active >= 3 THEN user_id END) as engaged_users,
      (COUNT(DISTINCT CASE WHEN days_active >= 3 THEN user_id END)::DECIMAL / 
       NULLIF(COUNT(DISTINCT user_id), 0) * 100) as engagement_rate
    FROM (
      SELECT 
        user_id,
        user_type,
        COUNT(DISTINCT session_id) as sessions_per_user,
        COUNT(DISTINCT DATE(created_at)) as days_active
      FROM engagement_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ${userType ? `AND user_type = $1` : ''}
      GROUP BY user_id, user_type
    ) user_stats
    ${userType ? 'WHERE user_type = $1' : ''}
    GROUP BY user_type
    ORDER BY user_type;
  `;
  
  const result = await client.query(query, userType ? [userType] : undefined);
  return result.rows;
}

async function trackEngagementEvent(client: Client, event: any) {
  const {
    id,
    userId,
    userType,
    eventType,
    eventCategory,
    featureName,
    featureType,
    bookingId,
    requestId,
    waitlistId,
    intentType,
    sessionId,
    sessionDuration,
    pagePath,
    completionStatus,
    score,
    metadata,
  } = event;

  const query = `
    INSERT INTO engagement_events (
      id, user_id, user_type, event_type, event_category,
      feature_name, feature_type, booking_id, request_id, waitlist_id, intent_type,
      session_id, session_duration, page_path, completion_status, score, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `;

  const result = await client.query(query, [
    id,
    userId,
    userType,
    eventType,
    eventCategory || null,
    featureName || null,
    featureType || null,
    bookingId || null,
    requestId || null,
    waitlistId || null,
    intentType || null,
    sessionId || null,
    sessionDuration || null,
    pagePath || null,
    completionStatus || null,
    score || null,
    metadata ? JSON.stringify(metadata) : null,
  ]);

  return { success: true, id: result.rows[0]?.id };
}

async function trackSession(client: Client, session: any) {
  const {
    id,
    userId,
    userType,
    sessionId,
    startedAt,
    endedAt,
    durationSeconds,
    pageViews,
    lastActivityAt,
    deviceType,
    metadata,
  } = session;

  const query = `
    INSERT INTO user_sessions (
      id, user_id, user_type, session_id, started_at, ended_at,
      duration_seconds, page_views, last_activity_at, device_type, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      ended_at = EXCLUDED.ended_at,
      duration_seconds = EXCLUDED.duration_seconds,
      page_views = EXCLUDED.page_views,
      last_activity_at = EXCLUDED.last_activity_at
    RETURNING id;
  `;

  const result = await client.query(query, [
    id,
    userId,
    userType,
    sessionId,
    startedAt,
    endedAt || null,
    durationSeconds || null,
    pageViews || 0,
    lastActivityAt || startedAt,
    deviceType || null,
    metadata ? JSON.stringify(metadata) : null,
  ]);

  return { success: true, id: result.rows[0]?.id };
}

// ============================================
// ONBOARDING ANALYTICS FUNCTIONS
// ============================================

async function getOnboardingFunnel(client: Client, days: number, userType?: string) {
  let query = `
    SELECT * FROM onboarding_funnel
    WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
  `;
  const params: any[] = [];
  
  if (userType) {
    query += ` AND user_type = $1`;
    params.push(userType);
  }
  
  query += ` ORDER BY date DESC, user_type;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getOnboardingDropoff(client: Client, userType?: string) {
  let query = 'SELECT * FROM onboarding_dropoff';
  const params: any[] = [];
  
  if (userType) {
    query += ` WHERE user_type = $1`;
    params.push(userType);
  }
  
  query += ` ORDER BY user_type, step_number;`;
  
  const result = await client.query(query, params.length > 0 ? params : undefined);
  return result.rows;
}

async function getOnboardingStats(client: Client, days: number) {
  const query = `
    SELECT 
      user_type,
      COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END) as total_signup_clicks,
      COUNT(DISTINCT CASE WHEN event_type = 'signup_started' THEN session_id END) as total_signup_starts,
      COUNT(DISTINCT CASE WHEN event_type = 'onboarding_completed' THEN session_id END) as total_completions,
      COUNT(DISTINCT CASE WHEN event_type = 'onboarding_abandoned' THEN session_id END) as total_abandonments,
      (COUNT(DISTINCT CASE WHEN event_type = 'onboarding_completed' THEN session_id END)::DECIMAL / 
       NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END), 0) * 100) as overall_completion_rate,
      (COUNT(DISTINCT CASE WHEN event_type = 'signup_started' THEN session_id END)::DECIMAL / 
       NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'signup_clicked' THEN session_id END), 0) * 100) as overall_start_rate
    FROM onboarding_events
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY user_type
    ORDER BY user_type;
  `;
  const result = await client.query(query);
  return result.rows;
}

async function trackOnboardingEvent(client: Client, event: any) {
  const {
    id,
    userType,
    eventType,
    stepName,
    stepNumber,
    sessionId,
    userId,
    metadata,
  } = event;

  const query = `
    INSERT INTO onboarding_events (
      id, user_type, event_type, step_name, step_number, 
      session_id, user_id, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `;

  const result = await client.query(query, [
    id,
    userType,
    eventType,
    stepName || null,
    stepNumber || null,
    sessionId,
    userId || null,
    metadata ? JSON.stringify(metadata) : null,
  ]);

  return { success: true, id: result.rows[0]?.id };
}

