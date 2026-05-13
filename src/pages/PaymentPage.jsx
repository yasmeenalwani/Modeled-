import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StripeProvider from '../components/StripeProvider';
import PaymentForm from '../components/PaymentForm';
import { createBookingFromMatch } from '../utils/bookingService';
import { getMatchById } from '../utils/matchService';
import { getServiceById } from '../admin/data/services';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

/**
 * PaymentPage
 *
 * Page for processing payments for bookings
 *
 * URL: /payment/:bookingId  (bookingId can be "match-xxx" for match payments)
 */
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      if (bookingId?.startsWith('match-')) {
        const matchId = bookingId;
        const match = await getMatchById(matchId);
        if (!match) {
          setError('Match not found');
          setLoading(false);
          return;
        }
        let request = null;
        try {
          const res = await client.models.ModelRequest.get({ id: match.requestId });
          request = res.data;
        } catch {
          // Mock mode or request not found - use match/fallback
        }
        const service = request ? getServiceById(request.serviceType) : null;
        const modelFee = service?.modelFee ?? request?.modelPayment ?? 25;
        const rawDate = request?.requestedDate;
        const appointmentDate = rawDate
          ? (typeof rawDate === 'string' ? rawDate.split('T')[0] : rawDate instanceof Date ? rawDate.toISOString().split('T')[0] : 'TBD')
          : 'TBD';
        setBooking({
          id: bookingId,
          matchId,
          amount: modelFee,
          serviceType: request?.serviceType || service?.name || 'Service',
          appointmentDate,
          appointmentTime: request?.requestedTime || '10:00 AM',
        });
      } else {
        try {
          const { data: existingBooking } = await client.models.Booking.get({ id: bookingId });
          if (existingBooking) {
            setBooking({
              id: existingBooking.id,
              amount: existingBooking.modelFee ?? 25,
              serviceType: existingBooking.serviceType || 'Service',
              appointmentDate: typeof existingBooking.appointmentDate === 'string'
                ? existingBooking.appointmentDate.split('T')[0]
                : 'TBD',
              appointmentTime: existingBooking.appointmentTime || '10:00 AM',
            });
          } else {
            setError('Booking not found');
          }
        } catch {
          setError('Booking not found');
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    
    try {
      // If this is a matchId (from match approval), create full booking
      if (bookingId?.startsWith('match-') || booking?.matchId) {
        const matchId = booking?.matchId || bookingId; // Use full id e.g. "match-xxx"
        
        // Create booking with calendar sync
        const result = await createBookingFromMatch(matchId, {
          paymentIntentId: paymentResult.paymentIntentId,
          customerId: paymentResult.customerId,
          amount: paymentResult.amount,
          modelPaid: paymentResult.status === 'succeeded',
          proPaid: false, // Professional pays separately
        });

        // Redirect to success page
        navigate(`/model-portal/sessions?booking=${result.booking.id}`);
      } else {
        // Existing booking - just update payment status
        // TODO: Update booking payment status
        navigate(`/model-portal/sessions?booking=${bookingId}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Payment succeeded but booking creation failed: ${error.message}. Please contact support.`);
      navigate('/model-portal/sessions');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFEF9 0%, #FAF6F0 100%)',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading: {
      textAlign: 'center',
      color: '#5C5552',
    },
    error: {
      padding: '2rem',
      background: '#fff',
      borderRadius: '12px',
      color: '#f44336',
      textAlign: 'center',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#8B1E3F',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <StripeProvider>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {booking && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <h2 style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color: '#2D2926',
                marginBottom: '1rem',
              }}>
                Booking Details
              </h2>
              <div style={{ color: '#5C5552', lineHeight: '1.8' }}>
                <div><strong>Service:</strong> {booking.serviceType}</div>
                <div><strong>Date:</strong> {booking.appointmentDate}</div>
                <div><strong>Time:</strong> {booking.appointmentTime}</div>
              </div>
            </div>
          )}

          <PaymentForm
            amount={booking?.amount || 0}
            bookingId={bookingId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            accentColor="#8B1E3F"
          />
        </div>
      </StripeProvider>
    </div>
  );
}

