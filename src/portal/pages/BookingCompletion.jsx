import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionPhotoUploader from '../../components/SessionPhotoUploader';
import TipPayment from '../../components/TipPayment';
import { completeBookingForTraining } from '../../utils/bookingCompletion';
import { processTip } from '../../utils/tipTracking';
import { getBookingById } from '../../utils/bookingService';
import { getMockModel } from '../../utils/mockDataService';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    transition: 'width 0.3s ease',
  },
  
  // Section
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '1.5rem',
  },
  requiredBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem',
  },
  optionalBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem',
  },
  
  // Form
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.9)',
  },
  labelHint: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(20,20,30,0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  
  // Rating
  ratingGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  ratingItem: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '0.5rem',
  },
  starRating: {
    display: 'flex',
    gap: '0.25rem',
    fontSize: '1.5rem',
  },
  star: {
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  starHover: {
    transform: 'scale(1.2)',
  },
  
  // Checkbox
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
  },
  
  // Products
  productInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  productInputField: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
  },
  removeBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '6px',
    color: '#e94560',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(76,175,80,0.2)',
    border: '1px solid rgba(76,175,80,0.3)',
    borderRadius: '6px',
    color: '#4caf50',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  
  // Actions
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
  },
  btn: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  
  // Status
  statusMessage: {
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statusSuccess: {
    background: 'rgba(76,175,80,0.1)',
    border: '1px solid rgba(76,175,80,0.3)',
    color: '#4caf50',
  },
  statusError: {
    background: 'rgba(233,69,96,0.1)',
    border: '1px solid rgba(233,69,96,0.3)',
    color: '#e94560',
  },
};

// Fallback when no bookingId or booking not found
const defaultBooking = {
  id: 'booking-123',
  serviceType: 'blowdry',
  serviceDescription: 'Blowout training session',
  modelName: 'Emma Johnson',
  modelId: 'model-1',
  appointmentDate: '2024-12-15',
  appointmentTime: '10:00 AM',
  duration: 60, // minutes
};

export default function BookingCompletion() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(defaultBooking);
  const [bookingLoading, setBookingLoading] = useState(!!bookingId);
  const [step, setStep] = useState(1); // 1: Photos, 2: Feedback, 3: Optional
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipCompleted, setTipCompleted] = useState(false);
  
  // Photo state
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [beforePhotos, setBeforePhotos] = useState([]);
  
  // Feedback state (MANDATORY)
  const [modelRating, setModelRating] = useState(0);
  const [modelHoverRating, setModelHoverRating] = useState(0);
  const [overallExperience, setOverallExperience] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  
  // Optional state
  const [goodTipper, setGoodTipper] = useState(false);
  const [productsSold, setProductsSold] = useState([]);
  const [newProduct, setNewProduct] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [modelBehavior, setModelBehavior] = useState('');
  
  // Training category
  const [trainingCategory, setTrainingCategory] = useState('blowouts');
  const [trainingModule, setTrainingModule] = useState('');

  // Load booking by ID from URL (mock or real)
  useEffect(() => {
    if (!bookingId) {
      setBookingLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const b = await getBookingById(bookingId);
        if (!mounted) return;
        if (b) {
          const model = b.modelId ? getMockModel(b.modelId) : null;
          const modelName = b.modelName || (model ? `${model.firstName || ''} ${model.lastName || ''}`.trim() : 'Model');
          setBooking({
            id: b.id,
            serviceType: b.serviceType || 'Service',
            serviceDescription: b.serviceDescription || '',
            modelName,
            modelId: b.modelId,
            appointmentDate: b.appointmentDate || '',
            appointmentTime: b.appointmentTime || '',
            duration: b.duration ?? 60,
            professionalId: b.professionalId,
            servicePrice: b.paymentAmount ?? b.modelFee,
          });
        }
      } catch (e) {
        if (mounted) console.error('Error loading booking:', e);
      } finally {
        if (mounted) setBookingLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [bookingId]);
  
  // Calculate progress
  const progress = useMemo(() => {
    let completed = 0;
    let total = 3;
    
    // Step 1: Photos (at least 1 after photo required)
    if (afterPhotos.length > 0) completed++;
    
    // Step 2: Feedback (all required fields)
    if (modelRating > 0 && overallExperience && technicalNotes) completed++;
    
    // Step 3: Optional (not required, but counts if filled)
    if (goodTipper || productsSold.length > 0 || additionalNotes) completed++;
    
    return (completed / total) * 100;
  }, [afterPhotos, modelRating, overallExperience, technicalNotes, goodTipper, productsSold, additionalNotes]);
  
  // Check if mandatory fields are complete
  const canComplete = useMemo(() => {
    return afterPhotos.length > 0 && 
           modelRating > 0 && 
           overallExperience.trim() !== '' && 
           technicalNotes.trim() !== '';
  }, [afterPhotos, modelRating, overallExperience, technicalNotes]);
  
  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setProductsSold([...productsSold, newProduct.trim()]);
      setNewProduct('');
    }
  };
  
  const handleRemoveProduct = (index) => {
    setProductsSold(productsSold.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!canComplete) {
      setError('Please complete all required fields (after photos, model rating, overall experience, and technical notes)');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const completionData = {
        bookingId: bookingId || booking.id,
        
        // Mandatory
        afterPhotos: afterPhotos.map(p => p.url || p),
        beforePhotos: beforePhotos.map(p => p.url || p),
        feedback: {
          modelRating,
          overallExperience,
          technicalNotes,
          whatWentWell,
          whatToImprove,
        },
        
        // Optional
        goodTipper,
        productsSold,
        additionalNotes,
        modelBehavior,
        
        // Training
        trainingCategory,
        trainingModule,
        duration: booking.duration, // minutes
      };
      
      const result = await completeBookingForTraining(completionData);
      
      if (result.success) {
        setSuccess(true);
        // Show tip prompt after successful completion
        setShowTip(true);
        // Don't navigate yet - let them tip first
      } else {
        setError(result.error || 'Failed to complete booking');
      }
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (bookingLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Complete Training Session</h1>
          <p style={styles.subtitle}>Loading booking…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Complete Training Session</h1>
        <p style={styles.subtitle}>
          Complete all required fields to log your training hours
        </p>
        
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div style={{ ...styles.statusMessage, ...styles.statusError }}>
          <span>⚠️</span> {error}
        </div>
      )}
      
      {success && (
        <div style={{ ...styles.statusMessage, ...styles.statusSuccess }}>
          Booking completed! Training hours logged. Redirecting...
        </div>
      )}
      
      {/* Step 1: Photos (MANDATORY) */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Session Photos
          <span style={styles.requiredBadge}>REQUIRED</span>
        </div>
        <p style={styles.sectionSubtitle}>
          Upload at least <strong>1 after photo</strong> to prove the service was completed. 
          Before photos are optional but helpful.
        </p>
        
        <SessionPhotoUploader
          session={{
            bookingId: bookingId || booking.id,
            service: booking.serviceType,
            serviceIcon: '💨',
            modelName: booking.modelName,
            date: booking.appointmentDate,
            proName: 'You',
          }}
          onComplete={(data) => {
            setAfterPhotos(data.afterPhotos || []);
            setBeforePhotos(data.beforePhotos || []);
          }}
        />
        
        {afterPhotos.length === 0 && (
          <div style={{ ...styles.statusMessage, ...styles.statusError, marginTop: '1rem' }}>
            <span>⚠️</span> At least 1 after photo is required
          </div>
        )}
      </div>
      
      {/* Step 2: Feedback (MANDATORY) */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Session Feedback
          <span style={styles.requiredBadge}>REQUIRED</span>
        </div>
        <p style={styles.sectionSubtitle}>
          Provide feedback about the model and your training experience
        </p>
        
        {/* Model Rating */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Model Rating <span style={{ color: '#e94560' }}>*</span>
          </label>
          <div style={styles.ratingGroup}>
            <div style={styles.ratingItem}>
              <div style={styles.ratingLabel}>Overall Experience</div>
              <div style={styles.starRating}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    style={{
                      ...styles.star,
                      color: star <= (modelHoverRating || modelRating) ? '#ffc107' : 'rgba(255,255,255,0.3)',
                    }}
                    onMouseEnter={() => setModelHoverRating(star)}
                    onMouseLeave={() => setModelHoverRating(0)}
                    onClick={() => setModelRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall Experience */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Overall Experience <span style={{ color: '#e94560' }}>*</span>
            <div style={styles.labelHint}>Describe your overall experience with this model</div>
          </label>
          <textarea
            style={styles.textarea}
            value={overallExperience}
            onChange={(e) => setOverallExperience(e.target.value)}
            placeholder="e.g., Model was punctual, professional, and had great hair for training..."
            required
          />
        </div>
        
        {/* Technical Notes */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Technical Notes <span style={{ color: '#e94560' }}>*</span>
            <div style={styles.labelHint}>What techniques did you practice? What did you learn?</div>
          </label>
          <textarea
            style={styles.textarea}
            value={technicalNotes}
            onChange={(e) => setTechnicalNotes(e.target.value)}
            placeholder="e.g., Practiced round brush techniques on medium-length wavy hair. Focused on creating volume at the roots..."
            required
          />
        </div>
        
        {/* What Went Well */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            What Went Well
            <div style={styles.labelHint}>Optional: What aspects of the session went particularly well?</div>
          </label>
          <textarea
            style={styles.textarea}
            value={whatWentWell}
            onChange={(e) => setWhatWentWell(e.target.value)}
            placeholder="e.g., Model's hair texture was perfect for practicing volume techniques..."
          />
        </div>
        
        {/* What to Improve */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Areas for Improvement
            <div style={styles.labelHint}>Optional: What would you do differently next time?</div>
          </label>
          <textarea
            style={styles.textarea}
            value={whatToImprove}
            onChange={(e) => setWhatToImprove(e.target.value)}
            placeholder="e.g., Could work on speed - took longer than expected..."
          />
        </div>
      </div>
      
      {/* Step 3: Optional Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>➕</span> Additional Information
          <span style={styles.optionalBadge}>OPTIONAL</span>
        </div>
        <p style={styles.sectionSubtitle}>
          Help us track additional metrics and improve the platform
        </p>
        
        {/* Good Tipper */}
        <div style={styles.formGroup}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              style={styles.checkboxInput}
              checked={goodTipper}
              onChange={(e) => setGoodTipper(e.target.checked)}
            />
            <span style={styles.checkboxLabel}>
              Model was a good tipper 💰
            </span>
          </label>
        </div>
        
        {/* Products Sold */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Products Sold
            <div style={styles.labelHint}>List any products you sold during the session</div>
          </label>
          {productsSold.map((product, index) => (
            <div key={index} style={styles.productInput}>
              <input
                type="text"
                style={styles.productInputField}
                value={product}
                readOnly
              />
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => handleRemoveProduct(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <div style={styles.productInput}>
            <input
              type="text"
              style={styles.productInputField}
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
              placeholder="Enter product name..."
            />
            <button
              type="button"
              style={styles.addBtn}
              onClick={handleAddProduct}
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Additional Notes
            <div style={styles.labelHint}>Any other information you'd like to share</div>
          </label>
          <textarea
            style={styles.textarea}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g., Model mentioned she'd love to come back for color training..."
          />
        </div>
        
        {/* Model Behavior */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Model Behavior Notes
            <div style={styles.labelHint}>For admin use: Any behavioral observations (positive or negative)</div>
          </label>
          <textarea
            style={styles.textarea}
            value={modelBehavior}
            onChange={(e) => setModelBehavior(e.target.value)}
            placeholder="e.g., Very professional, great communication, followed instructions well..."
          />
        </div>
      </div>
      
      {/* Training Category Selection */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Training Category
          <span style={styles.requiredBadge}>REQUIRED</span>
        </div>
        <p style={styles.sectionSubtitle}>
          Select which training category these hours should count towards
        </p>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Category</label>
          <select
            style={styles.select}
            value={trainingCategory}
            onChange={(e) => setTrainingCategory(e.target.value)}
          >
            <option value="blowouts">Blowouts & Styling</option>
            <option value="haircuts">Haircuts</option>
            <option value="color">Color</option>
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Module (Optional)</label>
          <input
            type="text"
            style={styles.input}
            value={trainingModule}
            onChange={(e) => setTrainingModule(e.target.value)}
            placeholder="e.g., Round Brush Techniques, Layering, etc."
          />
        </div>
      </div>
      
      {/* Actions */}
      {!success && (
        <div style={styles.actions}>
          <button
            style={styles.btnSecondary}
            onClick={() => navigate('/portal/bookings')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              ...(!canComplete || submitting ? styles.btnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!canComplete || submitting}
          >
            {submitting ? 'Submitting...' : 'Complete & Log Training Hours'}
          </button>
        </div>
      )}
      
      {/* Tip Payment (shown after completion) */}
      {success && showTip && !tipCompleted && (
        <div style={{ marginTop: '2rem' }}>
          <TipPayment
            servicePrice={booking.servicePrice || 90}
            professionalName="Sarah M." // TODO: Fetch from booking
            professionalVenmo="@sarah-stylist" // TODO: Fetch from professional profile
            professionalId={booking.professionalId}
            bookingId={bookingId || booking.id}
            onTipComplete={async (tipData) => {
              try {
                await processTip(tipData);
                setTipCompleted(true);
                setTimeout(() => {
                  navigate('/portal/bookings');
                }, 2000);
              } catch (error) {
                console.error('Error processing tip:', error);
              }
            }}
            onSkip={() => {
              setTipCompleted(true);
              setTimeout(() => {
                navigate('/portal/bookings');
              }, 1000);
            }}
          />
        </div>
      )}
      
      {/* Success message with tip option */}
      {success && !showTip && (
        <div style={styles.actions}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate('/portal/bookings')}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

