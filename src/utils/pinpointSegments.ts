/**
 * Pinpoint Segments Utility
 * 
 * Functions for managing user segments in Pinpoint
 * 
 * Usage:
 * - Create segment: createSegment(name, criteria)
 * - Get segment: getSegment(segmentId)
 * - Update endpoint: updateEndpoint(userId, userData)
 */

import { invoke } from 'aws-amplify/function';

export interface SegmentCriteria {
  Demographic?: {
    UserAttributes?: Record<string, string[]>;
  };
  Behavior?: {
    Recency?: {
      Duration: string;
      RecencyType: 'ACTIVE' | 'INACTIVE';
    };
  };
}

/**
 * Create a new segment
 */
export async function createSegment(
  name: string,
  criteria: SegmentCriteria
) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-segments',
      payload: {
        action: 'createSegment',
        name,
        criteria,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error creating segment:', error);
    throw error;
  }
}

/**
 * Get segment details
 */
export async function getSegment(segmentId: string) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-segments',
      payload: {
        action: 'getSegment',
        segmentId,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error getting segment:', error);
    throw error;
  }
}

/**
 * Update or create user endpoint in Pinpoint
 */
export async function updateEndpoint(
  userId: string,
  userData: {
    email?: string;
    phone?: string;
    attributes?: Record<string, string[]>;
    metrics?: Record<string, number>;
  }
) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-segments',
      payload: {
        action: 'updateEndpoint',
        userId,
        ...userData,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error updating endpoint:', error);
    throw error;
  }
}

/**
 * Get endpoint details
 */
export async function getEndpoint(userId: string) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-segments',
      payload: {
        action: 'getEndpoint',
        userId,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error getting endpoint:', error);
    throw error;
  }
}

/**
 * Predefined segment creation helpers
 */
export const SegmentHelpers = {
  /**
   * Create "Active Models" segment
   */
  activeModels: () => createSegment('Active Models', {
    Demographic: {
      UserAttributes: {
        userType: ['Model'],
      },
    },
    Behavior: {
      Recency: {
        Duration: 'DAY_30',
        RecencyType: 'ACTIVE',
      },
    },
  }),
  
  /**
   * Create "Inactive Models" segment
   */
  inactiveModels: () => createSegment('Inactive Models', {
    Demographic: {
      UserAttributes: {
        userType: ['Model'],
      },
    },
    Behavior: {
      Recency: {
        Duration: 'DAY_60',
        RecencyType: 'INACTIVE',
      },
    },
  }),
  
  /**
   * Create "Active Professionals" segment
   */
  activeProfessionals: () => createSegment('Active Professionals', {
    Demographic: {
      UserAttributes: {
        userType: ['Professional'],
      },
    },
    Behavior: {
      Recency: {
        Duration: 'DAY_30',
        RecencyType: 'ACTIVE',
      },
    },
  }),
  
  /**
   * Create "New Users" segment (joined in last 7 days)
   */
  newUsers: () => createSegment('New Users', {
    Behavior: {
      Recency: {
        Duration: 'DAY_7',
        RecencyType: 'ACTIVE',
      },
    },
  }),
};

