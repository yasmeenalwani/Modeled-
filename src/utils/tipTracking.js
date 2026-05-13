// ============================================
// TIP TRACKING & PROCESSING
// ============================================

import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';

const client = generateClient();

/**
 * Process and record a tip payment
 * @param {object} tipData
 * @returns {Promise<object>}
 */
export async function processTip(tipData) {
  try {
    const {
      bookingId,
      professionalId,
      amount,
      method, // 'stripe', 'venmo', 'cash'
      fee = 0,
      professionalReceives,
      stripePaymentIntentId,
      venmoHandle,
      manualEntry = false,
    } = tipData;
    
    const isMockData = bookingId?.startsWith('booking-') || bookingId?.startsWith('mock-');
    
    if (!isMockData) {
      // In real implementation, create a Tip record
      // For now, we'll update the booking with tip information
      await client.models.Booking.update({
        id: bookingId,
        tipAmount: amount,
        tipMethod: method,
        tipFee: fee,
        tipProfessionalReceives: professionalReceives,
        tipStripePaymentIntentId: stripePaymentIntentId,
        tipVenmoHandle: venmoHandle,
        tipRecordedAt: new Date().toISOString(),
      });
      
      // Send notification to professional
      await createNotification({
        userId: professionalId,
        userType: 'professional',
        type: 'tip_received',
        title: 'Tip Received!',
        message: `You received a $${amount} tip${method === 'venmo' ? ' via Venmo' : method === 'cash' ? ' in cash' : ''}. ${professionalReceives < amount ? `After fees, you'll receive $${professionalReceives}.` : 'You receive the full amount!'}`,
        link: `/portal/earnings`,
        actionText: 'View Earnings',
        relatedEntityId: bookingId,
        data: { tipAmount: amount, method, professionalReceives },
      });
    } else {
      console.log('📝 Mock mode: Would process tip:', tipData);
    }
    
    return {
      success: true,
      tipAmount: amount,
      professionalReceives,
      method,
    };
  } catch (error) {
    console.error('Error processing tip:', error);
    throw error;
  }
}

/**
 * Get tip statistics for a professional
 * @param {string} professionalId
 * @param {object} filters - { startDate, endDate, method }
 * @returns {Promise<object>}
 */
export async function getTipStats(professionalId, filters = {}) {
  try {
    // In real implementation, query Tip records or Booking records with tips
    // For now, return mock structure
    return {
      totalTips: 0,
      totalReceived: 0,
      totalFees: 0,
      averageTip: 0,
      byMethod: {
        stripe: { count: 0, total: 0, fees: 0 },
        venmo: { count: 0, total: 0, fees: 0 },
        cash: { count: 0, total: 0, fees: 0 },
      },
      recentTips: [],
    };
  } catch (error) {
    console.error('Error fetching tip stats:', error);
    throw error;
  }
}

/**
 * Calculate suggested tip amounts based on service price
 * @param {number} servicePrice
 * @returns {Array<{percent: number, amount: number}>}
 */
export function calculateSuggestedTips(servicePrice) {
  const percentages = [15, 18, 20, 25, 30];
  return percentages.map(percent => ({
    percent,
    amount: Math.round((servicePrice * percent) / 100),
  }));
}

/**
 * Calculate Stripe processing fee
 * Stripe standard rate: 2.9% + $0.30 per transaction
 * @param {number} amount
 * @returns {number}
 */
export function calculateStripeFee(amount) {
  return (amount * 0.029) + 0.30;
}

/**
 * Get fee comparison for different tip amounts
 * Useful for showing models the cost difference
 * @param {number} tipAmount
 * @returns {object}
 */
export function getFeeComparison(tipAmount) {
  const stripeFee = calculateStripeFee(tipAmount);
  const stripeReceives = tipAmount - stripeFee;
  const venmoReceives = tipAmount; // No fee
  
  return {
    tipAmount,
    stripe: {
      fee: stripeFee,
      feePercent: ((stripeFee / tipAmount) * 100).toFixed(1),
      professionalReceives: stripeReceives,
    },
    venmo: {
      fee: 0,
      feePercent: 0,
      professionalReceives: venmoReceives,
    },
    savings: {
      amount: stripeFee,
      percent: ((stripeFee / tipAmount) * 100).toFixed(1),
    },
  };
}

