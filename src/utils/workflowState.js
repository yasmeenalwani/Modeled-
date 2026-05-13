/**
 * Workflow State Management
 * 
 * Centralized state tracking for requests, matches, and bookings
 * Provides utilities for checking status, transitions, and workflow progress
 */

// ============ STATUS ENUMS ============

export const REQUEST_STATUS = {
  PENDING: 'pending',
  MATCHING: 'matching',
  MATCHED: 'matched',
  BOOKED: 'booked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const MATCH_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  WAITLIST: 'waitlist',
};

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// ============ STATUS TRANSITIONS ============

export const REQUEST_TRANSITIONS = {
  [REQUEST_STATUS.PENDING]: [REQUEST_STATUS.MATCHING, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.MATCHING]: [REQUEST_STATUS.MATCHED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.MATCHED]: [REQUEST_STATUS.BOOKED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.BOOKED]: [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.COMPLETED]: [], // Terminal state
  [REQUEST_STATUS.CANCELLED]: [], // Terminal state
};

export const MATCH_TRANSITIONS = {
  [MATCH_STATUS.PENDING]: [MATCH_STATUS.APPROVED, MATCH_STATUS.EXPIRED],
  [MATCH_STATUS.APPROVED]: [MATCH_STATUS.SENT, MATCH_STATUS.EXPIRED],
  [MATCH_STATUS.SENT]: [MATCH_STATUS.ACCEPTED, MATCH_STATUS.DECLINED, MATCH_STATUS.EXPIRED],
  [MATCH_STATUS.ACCEPTED]: [MATCH_STATUS.WAITLIST], // If booking taken by another
  [MATCH_STATUS.DECLINED]: [], // Terminal state
  [MATCH_STATUS.EXPIRED]: [], // Terminal state
  [MATCH_STATUS.WAITLIST]: [MATCH_STATUS.ACCEPTED], // If booking opens up
};

export const BOOKING_TRANSITIONS = {
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW],
  [BOOKING_STATUS.COMPLETED]: [], // Terminal state
  [BOOKING_STATUS.CANCELLED]: [], // Terminal state
  [BOOKING_STATUS.NO_SHOW]: [], // Terminal state
};

// ============ WORKFLOW STAGES ============

export const WORKFLOW_STAGES = {
  REQUEST_CREATION: 'request_creation',
  MATCHING: 'matching',
  MATCH_APPROVAL: 'match_approval',
  MODEL_ACCEPTANCE: 'model_acceptance',
  PAYMENT_PROCESSING: 'payment_processing',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  PRE_SESSION: 'pre_session',
  SESSION_COMPLETION: 'session_completion',
  FEEDBACK: 'feedback',
  POST_SESSION: 'post_session',
};

// ============ UTILITY FUNCTIONS ============

/**
 * Check if a status transition is valid
 */
export function isValidTransition(currentStatus, newStatus, type = 'request') {
  const transitions = {
    request: REQUEST_TRANSITIONS,
    match: MATCH_TRANSITIONS,
    booking: BOOKING_TRANSITIONS,
  }[type];

  if (!transitions || !transitions[currentStatus]) {
    return false;
  }

  return transitions[currentStatus].includes(newStatus);
}

/**
 * Get the current workflow stage for a request
 */
export function getWorkflowStage(request, match = null, booking = null) {
  if (!request) return null;

  // If booking exists and is completed, we're at feedback/post-session
  if (booking?.status === BOOKING_STATUS.COMPLETED) {
    if (booking.modelFeedback && booking.professionalFeedback) {
      return WORKFLOW_STAGES.POST_SESSION;
    }
    return WORKFLOW_STAGES.FEEDBACK;
  }

  // If booking exists and is confirmed, we're at pre-session or session
  if (booking?.status === BOOKING_STATUS.CONFIRMED) {
    const appointmentDate = new Date(booking.appointmentDate);
    const now = new Date();
    const hoursUntil = (appointmentDate - now) / (1000 * 60 * 60);

    if (hoursUntil < 0) {
      return WORKFLOW_STAGES.SESSION_COMPLETION;
    }
    return WORKFLOW_STAGES.PRE_SESSION;
  }

  // If booking exists, we're at booking confirmation
  if (booking) {
    return WORKFLOW_STAGES.BOOKING_CONFIRMATION;
  }

  // If match exists and is accepted, we're at payment
  if (match?.status === MATCH_STATUS.ACCEPTED) {
    return WORKFLOW_STAGES.PAYMENT_PROCESSING;
  }

  // If match exists and is sent, we're waiting for model acceptance
  if (match?.status === MATCH_STATUS.SENT) {
    return WORKFLOW_STAGES.MODEL_ACCEPTANCE;
  }

  // If match exists and is approved, we're at match approval
  if (match?.status === MATCH_STATUS.APPROVED) {
    return WORKFLOW_STAGES.MATCH_APPROVAL;
  }

  // If match exists, we're at matching
  if (match) {
    return WORKFLOW_STAGES.MATCHING;
  }

  // If request status is matching, we're at matching
  if (request.status === REQUEST_STATUS.MATCHING) {
    return WORKFLOW_STAGES.MATCHING;
  }

  // Otherwise, we're at request creation
  return WORKFLOW_STAGES.REQUEST_CREATION;
}

/**
 * Get next actions for a workflow stage
 */
export function getNextActions(stage, request, match, booking) {
  const actions = [];

  switch (stage) {
    case WORKFLOW_STAGES.REQUEST_CREATION:
      if (request.status === REQUEST_STATUS.PENDING) {
        actions.push({ label: 'Start Matching', action: 'start_matching' });
      }
      break;

    case WORKFLOW_STAGES.MATCHING:
      actions.push({ label: 'View Matches', action: 'view_matches' });
      break;

    case WORKFLOW_STAGES.MATCH_APPROVAL:
      actions.push({ label: 'Approve Matches', action: 'approve_matches' });
      actions.push({ label: 'Send to Models', action: 'send_matches' });
      break;

    case WORKFLOW_STAGES.MODEL_ACCEPTANCE:
      actions.push({ label: 'Accept Match', action: 'accept_match' });
      actions.push({ label: 'Decline Match', action: 'decline_match' });
      break;

    case WORKFLOW_STAGES.PAYMENT_PROCESSING:
      if (booking?.modelPaymentStatus === PAYMENT_STATUS.PENDING) {
        actions.push({ label: 'Complete Payment', action: 'pay' });
      }
      break;

    case WORKFLOW_STAGES.BOOKING_CONFIRMATION:
      actions.push({ label: 'View Booking', action: 'view_booking' });
      actions.push({ label: 'Add to Calendar', action: 'add_calendar' });
      break;

    case WORKFLOW_STAGES.PRE_SESSION:
      actions.push({ label: 'View Details', action: 'view_booking' });
      break;

    case WORKFLOW_STAGES.SESSION_COMPLETION:
      actions.push({ label: 'Mark Complete', action: 'mark_complete' });
      break;

    case WORKFLOW_STAGES.FEEDBACK:
      if (!booking.modelFeedback) {
        actions.push({ label: 'Leave Feedback', action: 'leave_feedback' });
      }
      break;

    default:
      break;
  }

  return actions;
}

/**
 * Get workflow progress percentage
 */
export function getWorkflowProgress(stage) {
  const stageOrder = [
    WORKFLOW_STAGES.REQUEST_CREATION,
    WORKFLOW_STAGES.MATCHING,
    WORKFLOW_STAGES.MATCH_APPROVAL,
    WORKFLOW_STAGES.MODEL_ACCEPTANCE,
    WORKFLOW_STAGES.PAYMENT_PROCESSING,
    WORKFLOW_STAGES.BOOKING_CONFIRMATION,
    WORKFLOW_STAGES.PRE_SESSION,
    WORKFLOW_STAGES.SESSION_COMPLETION,
    WORKFLOW_STAGES.FEEDBACK,
    WORKFLOW_STAGES.POST_SESSION,
  ];

  const index = stageOrder.indexOf(stage);
  if (index === -1) return 0;

  return Math.round(((index + 1) / stageOrder.length) * 100);
}

/**
 * Check if workflow is complete
 */
export function isWorkflowComplete(stage) {
  return stage === WORKFLOW_STAGES.POST_SESSION;
}

/**
 * Get status badge color
 */
export function getStatusColor(status, type = 'request') {
  const colorMap = {
    request: {
      [REQUEST_STATUS.PENDING]: '#ff9800',
      [REQUEST_STATUS.MATCHING]: '#2196f3',
      [REQUEST_STATUS.MATCHED]: '#9c27b0',
      [REQUEST_STATUS.BOOKED]: '#4caf50',
      [REQUEST_STATUS.COMPLETED]: '#4caf50',
      [REQUEST_STATUS.CANCELLED]: '#f44336',
    },
    match: {
      [MATCH_STATUS.PENDING]: '#ff9800',
      [MATCH_STATUS.APPROVED]: '#2196f3',
      [MATCH_STATUS.SENT]: '#9c27b0',
      [MATCH_STATUS.ACCEPTED]: '#4caf50',
      [MATCH_STATUS.DECLINED]: '#f44336',
      [MATCH_STATUS.EXPIRED]: '#757575',
      [MATCH_STATUS.WAITLIST]: '#ff9800',
    },
    booking: {
      [BOOKING_STATUS.CONFIRMED]: '#4caf50',
      [BOOKING_STATUS.COMPLETED]: '#4caf50',
      [BOOKING_STATUS.CANCELLED]: '#f44336',
      [BOOKING_STATUS.NO_SHOW]: '#f44336',
    },
    payment: {
      [PAYMENT_STATUS.PENDING]: '#ff9800',
      [PAYMENT_STATUS.PAID]: '#4caf50',
      [PAYMENT_STATUS.REFUNDED]: '#2196f3',
      [PAYMENT_STATUS.FAILED]: '#f44336',
    },
  };

  return colorMap[type]?.[status] || '#757575';
}

/**
 * Get status label
 */
export function getStatusLabel(status, type = 'request') {
  const labelMap = {
    request: {
      [REQUEST_STATUS.PENDING]: 'Pending',
      [REQUEST_STATUS.MATCHING]: 'Matching',
      [REQUEST_STATUS.MATCHED]: 'Matched',
      [REQUEST_STATUS.BOOKED]: 'Booked',
      [REQUEST_STATUS.COMPLETED]: 'Completed',
      [REQUEST_STATUS.CANCELLED]: 'Cancelled',
    },
    match: {
      [MATCH_STATUS.PENDING]: 'Pending Approval',
      [MATCH_STATUS.APPROVED]: 'Approved',
      [MATCH_STATUS.SENT]: 'Sent to Model',
      [MATCH_STATUS.ACCEPTED]: 'Accepted',
      [MATCH_STATUS.DECLINED]: 'Declined',
      [MATCH_STATUS.EXPIRED]: 'Expired',
      [MATCH_STATUS.WAITLIST]: 'Waitlist',
    },
    booking: {
      [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
      [BOOKING_STATUS.COMPLETED]: 'Completed',
      [BOOKING_STATUS.CANCELLED]: 'Cancelled',
      [BOOKING_STATUS.NO_SHOW]: 'No Show',
    },
    payment: {
      [PAYMENT_STATUS.PENDING]: 'Pending',
      [PAYMENT_STATUS.PAID]: 'Paid',
      [PAYMENT_STATUS.REFUNDED]: 'Refunded',
      [PAYMENT_STATUS.FAILED]: 'Failed',
    },
  };

  return labelMap[type]?.[status] || status;
}

