/**
 * CloudTrail Utilities
 * 
 * Helper functions for CloudTrail security logging
 * 
 * Note: CloudTrail automatically logs all AWS API calls.
 * These utilities help you query and understand the logs.
 */

/**
 * Format CloudTrail event for display
 */
export function formatCloudTrailEvent(event) {
  return {
    timestamp: event.eventTime,
    user: event.userIdentity?.userName || event.userIdentity?.type || 'Unknown',
    action: event.eventName,
    service: event.eventSource,
    resource: event.resources?.[0]?.resourceName || 'N/A',
    ipAddress: event.sourceIPAddress,
    userAgent: event.userAgent,
    success: event.responseElements ? 'Success' : 'Failed',
    errorCode: event.errorCode || null,
    errorMessage: event.errorMessage || null,
  };
}

/**
 * Filter events by type
 */
export function filterEventsByType(events, eventType) {
  return events.filter(event => event.eventName === eventType);
}

/**
 * Filter events by user
 */
export function filterEventsByUser(events, username) {
  return events.filter(event => 
    event.userIdentity?.userName === username ||
    event.userIdentity?.arn?.includes(username)
  );
}

/**
 * Filter events by service
 */
export function filterEventsByService(events, service) {
  return events.filter(event => event.eventSource?.includes(service));
}

/**
 * Get security events (failed auth, unauthorized access, etc.)
 */
export function getSecurityEvents(events) {
  return events.filter(event => 
    event.errorCode ||
    event.eventName?.includes('Unauthorized') ||
    event.eventName?.includes('Denied') ||
    (event.eventName === 'ConsoleLogin' && !event.responseElements)
  );
}

/**
 * Get admin actions
 */
export function getAdminActions(events) {
  const adminEvents = [
    'CreateUser',
    'DeleteUser',
    'UpdateUser',
    'PutItem',
    'DeleteItem',
    'UpdateItem',
    'CreateFunction',
    'DeleteFunction',
    'UpdateFunctionConfiguration',
  ];
  
  return events.filter(event => adminEvents.includes(event.eventName));
}

/**
 * Get data access events (S3, DynamoDB reads)
 */
export function getDataAccessEvents(events) {
  return events.filter(event => 
    event.eventName?.includes('Get') ||
    event.eventName?.includes('List') ||
    event.eventName?.includes('Query') ||
    event.eventName?.includes('Scan')
  );
}

/**
 * Get recent events (last N hours)
 */
export function getRecentEvents(events, hours = 24) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  
  return events.filter(event => 
    new Date(event.eventTime) >= cutoff
  );
}

/**
 * Group events by user
 */
export function groupEventsByUser(events) {
  const grouped = {};
  
  events.forEach(event => {
    const user = event.userIdentity?.userName || 'Unknown';
    if (!grouped[user]) {
      grouped[user] = [];
    }
    grouped[user].push(event);
  });
  
  return grouped;
}

/**
 * Get event summary statistics
 */
export function getEventSummary(events) {
  const summary = {
    total: events.length,
    byService: {},
    byUser: {},
    byAction: {},
    errors: 0,
    successes: 0,
  };
  
  events.forEach(event => {
    // By service
    const service = event.eventSource?.split('.')[0] || 'Unknown';
    summary.byService[service] = (summary.byService[service] || 0) + 1;
    
    // By user
    const user = event.userIdentity?.userName || 'Unknown';
    summary.byUser[user] = (summary.byUser[user] || 0) + 1;
    
    // By action
    summary.byAction[event.eventName] = (summary.byAction[event.eventName] || 0) + 1;
    
    // Success/Error
    if (event.errorCode) {
      summary.errors++;
    } else {
      summary.successes++;
    }
  });
  
  return summary;
}

