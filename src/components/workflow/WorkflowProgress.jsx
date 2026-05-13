/**
 * Workflow Progress Component
 * 
 * Displays the current stage of a request/booking workflow
 * Shows progress bar, current stage, and next actions
 */

import React from 'react';
import {
  getWorkflowStage,
  getWorkflowProgress,
  getNextActions,
  getStatusColor,
  getStatusLabel,
  WORKFLOW_STAGES,
} from '../../utils/workflowState';

// ============ STYLES ============
const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    transition: 'width 0.3s ease',
    borderRadius: '4px',
  },
  stageInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  currentStage: {
    fontSize: '0.9rem',
    color: '#666',
  },
  progressPercent: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F',
  },
  stages: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    position: 'relative',
    padding: '0.5rem 0',
  },
  stageItem: {
    flex: 1,
    textAlign: 'center',
    position: 'relative',
  },
  stageDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#e0e0e0',
    margin: '0 auto 0.5rem',
    border: '2px solid #fff',
    transition: 'all 0.3s ease',
  },
  stageDotActive: {
    background: '#8B1E3F',
    boxShadow: '0 0 0 4px rgba(139, 30, 63, 0.2)',
  },
  stageDotCompleted: {
    background: '#4caf50',
  },
  stageLabel: {
    fontSize: '0.7rem',
    color: '#999',
    textTransform: 'capitalize',
  },
  stageLabelActive: {
    color: '#8B1E3F',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#8B1E3F',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionButtonHover: {
    background: '#A85A5A',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
};

// ============ STAGE LABELS ============
const STAGE_LABELS = {
  [WORKFLOW_STAGES.REQUEST_CREATION]: 'Request',
  [WORKFLOW_STAGES.MATCHING]: 'Matching',
  [WORKFLOW_STAGES.MATCH_APPROVAL]: 'Approval',
  [WORKFLOW_STAGES.MODEL_ACCEPTANCE]: 'Acceptance',
  [WORKFLOW_STAGES.PAYMENT_PROCESSING]: 'Payment',
  [WORKFLOW_STAGES.BOOKING_CONFIRMATION]: 'Confirmed',
  [WORKFLOW_STAGES.PRE_SESSION]: 'Pre-Session',
  [WORKFLOW_STAGES.SESSION_COMPLETION]: 'Session',
  [WORKFLOW_STAGES.FEEDBACK]: 'Feedback',
  [WORKFLOW_STAGES.POST_SESSION]: 'Complete',
};

// ============ STAGE ORDER ============
const STAGE_ORDER = [
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

export default function WorkflowProgress({
  request,
  match = null,
  booking = null,
  onAction = null,
  showStages = true,
  showActions = true,
  compact = false,
}) {
  const stage = getWorkflowStage(request, match, booking);
  const progress = getWorkflowProgress(stage);
  const actions = getNextActions(stage, request, match, booking);

  if (!request) {
    return null;
  }

  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };

  if (compact) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Workflow Progress</span>
          <span style={styles.progressPercent}>{progress}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.stageInfo}>
          <span style={styles.currentStage}>
            Current: {STAGE_LABELS[stage] || stage}
          </span>
          <span
            style={{
              ...styles.statusBadge,
              background: getStatusColor(request.status, 'request'),
              color: '#fff',
            }}
          >
            {getStatusLabel(request.status, 'request')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Workflow Progress</span>
        <span style={styles.progressPercent}>{progress}%</span>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {showStages && (
        <div style={styles.stages}>
          {STAGE_ORDER.map((s, index) => {
            const isActive = s === stage;
            const isCompleted = index < currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <div key={s} style={styles.stageItem}>
                <div
                  style={{
                    ...styles.stageDot,
                    ...(isActive ? styles.stageDotActive : {}),
                    ...(isCompleted ? styles.stageDotCompleted : {}),
                  }}
                />
                <div
                  style={{
                    ...styles.stageLabel,
                    ...(isActive ? styles.stageLabelActive : {}),
                  }}
                >
                  {STAGE_LABELS[s]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.stageInfo}>
        <span style={styles.currentStage}>
          Current Stage: <strong>{STAGE_LABELS[stage] || stage}</strong>
        </span>
        <span
          style={{
            ...styles.statusBadge,
            background: getStatusColor(request.status, 'request'),
            color: '#fff',
          }}
        >
          {getStatusLabel(request.status, 'request')}
        </span>
      </div>

      {showActions && actions.length > 0 && (
        <div style={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              style={styles.actionButton}
              onClick={() => handleAction(action.action)}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.actionButtonHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.background = styles.actionButton.background;
                e.target.style.transform = 'none';
                e.target.style.boxShadow = 'none';
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

