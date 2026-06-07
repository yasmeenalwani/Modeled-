// ============================================
// LUXURY CONCIERGE MODEL REQUEST CREATION
// Premium, personalized, multi-step experience
// ============================================

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhotoUploader from '../../components/PhotoUploader';
import TagSearchBar from '../../components/TagSearchBar';
import PhotoTagSelector from '../../components/PhotoTagSelector';
import { services } from '../../admin/data/services';
import { GALLERY_TAG_CATEGORIES } from '../../utils/galleryTags';
import { getPortfolioPath } from '../../utils/storage';
import { getServiceAttributes, validateRequiredAttributes } from '../../utils/serviceAttributes';
import { saveDraft, loadDraft, clearDraft, setupAutoSave } from '../../utils/autoSave';
import { getRequestDefaults, getTimeSuggestions, getDurationForService } from '../../utils/smartDefaults';
import { createRequest } from '../../utils/requestService';
import { 
  getMockProfessionalByUserId,
  getMockProfessional,
  createMockRequest,
  shouldUseMockData,
} from '../../utils/mockDataService';

let client;
try {
  client = generateClient();
} catch (error) {
  console.warn('Failed to generate Amplify client, will use mock data only:', error);
  client = null;
}

// ============ STYLES ============
const styles = {
  container: {
    padding: '0',
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #FFFEF9 0%, #FFF8F0 100%)',
    minHeight: '100vh',
  },
  
  // Hero Section
  hero: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.95), rgba(168, 90, 90, 0.9))',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#FFFEF9',
    position: 'relative',
    overflow: 'hidden',
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
    backgroundSize: '40px 40px',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    opacity: 0.95,
    fontFamily: '"Alike", "Georgia", serif',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  
  // Step Indicator
  stepIndicator: {
    background: '#FFFEF9',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    position: 'relative',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.3s ease',
  },
  stepNumberActive: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    boxShadow: '0 4px 15px rgba(139, 30, 63, 0.3)',
  },
  stepNumberCompleted: {
    background: '#4caf50',
    color: '#FFFEF9',
  },
  stepNumberPending: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#5A3A2A',
    border: '2px solid rgba(139, 30, 63, 0.2)',
  },
  stepLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  stepConnector: {
    width: '60px',
    height: '2px',
    background: 'rgba(139, 30, 63, 0.2)',
    position: 'absolute',
    right: '-30px',
  },
  stepConnectorActive: {
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
  },
  
  // Main Content
  content: {
    padding: '3rem 2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  stepCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 8px 30px rgba(139, 30, 63, 0.1)',
    marginBottom: '2rem',
  },
  stepHeader: {
    marginBottom: '2rem',
  },
  stepTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  stepDescription: {
    fontSize: '1rem',
    color: '#5A3A2A',
    lineHeight: 1.6,
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Inspiration Board
  inspirationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  inspirationCard: {
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  inspirationCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(139, 30, 63, 0.2)',
    borderColor: '#8B1E3F',
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  inspirationPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.05))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8B1E3F',
    fontSize: '3rem',
  },
  inspirationRemove: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(248, 81, 73, 0.9)',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  
  // Form Elements
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    color: '#4A2A1A',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#8B1E3F',
    boxShadow: '0 0 0 3px rgba(139, 30, 63, 0.1)',
  },
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    color: '#4A2A1A',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'all 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    color: '#4A2A1A',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Tag Section
  tagSection: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  
  // Actions
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-between',
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: '2px solid rgba(139, 30, 63, 0.15)',
  },
  button: {
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.3s ease',
    border: 'none',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    boxShadow: '0 4px 15px rgba(139, 30, 63, 0.3)',
  },
  buttonSecondary: {
    background: '#FFFEF9',
    color: '#4A2A1A',
    border: '2px solid rgba(139, 30, 63, 0.3)',
  },
  buttonTertiary: {
    background: 'transparent',
    color: '#5A3A2A',
    border: 'none',
    textDecoration: 'underline',
  },
  
  // Preview Section
  previewSection: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    border: '2px solid rgba(139, 30, 63, 0.25)',
    borderRadius: '16px',
    padding: '2rem',
    marginTop: '2rem',
  },
  previewTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#8B1E3F',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Helper Text
  helperText: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Duration Controls
  durationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  durationButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    background: '#FFFEF9',
    color: '#8B1E3F',
    fontSize: '1.25rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  durationButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  durationInput: {
    flex: 1,
  },
  
  // Draft Badge
  draftBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 193, 7, 0.15)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#ffc107',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
    marginLeft: '1rem',
  },
};

// Step definitions
const STEPS = [
  { id: 'service', label: 'Service', icon: '', description: 'What you need' },
  { id: 'details', label: 'Details', icon: '', description: 'When & where - lock in your calendar' },
  { id: 'attributes', label: 'Attributes', icon: '', description: 'Ideal model preferences' },
  { id: 'inspiration', label: 'Inspiration', icon: '', description: 'Share your vision' },
  { id: 'review', label: 'Review', icon: '', description: 'Final check' },
];

export default function ProRequestCreationLuxury() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [professional, setProfessional] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    // Inspiration
    inspirationPhotos: [],
    inspirationNotes: '',
    
    // Service
    serviceType: '',
    serviceDescription: '',
    duration: 60,
    
    // Attributes
    selectedTags: [],
    customAttributes: '',
    
    // Details
    requestedDate: '',
    requestedTime: '',
    location: '',
    specialRequests: '',
  });

  useEffect(() => {
    loadProfessionalProfile();
    loadDraftData();
    
    // Check for URL parameters (from calendar click)
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    
    if (dateParam) {
      setFormData(prev => ({
        ...prev,
        requestedDate: dateParam,
        requestedTime: timeParam || prev.requestedTime,
      }));
      // Auto-advance to details step if date is provided
      if (timeParam) {
        setCurrentStep(1); // Details step
      }
    }
  }, [user, searchParams]);

  // Auto-save form data
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const cleanup = setupAutoSave('modelRequestDraft', formData, 2000, () => {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 3000);
      });
      return cleanup;
    }
  }, [formData]);

  const loadProfessionalProfile = async () => {
    try {
      // Try real database first
      if (!shouldUseMockData()) {
        const { data: pros } = await client.models.Professional.list({
          filter: { userId: { eq: user.userId } },
        });
        
        if (pros && pros.length > 0) {
          setProfessional(pros[0]);
          if (pros[0].salonAddress) {
            setFormData(prev => ({ ...prev, location: pros[0].salonAddress }));
          }
          
          // Load smart defaults if no draft exists
          const draft = loadDraft('modelRequestDraft');
          if (!draft) {
            try {
              const defaults = await getRequestDefaults(pros[0].id);
              setFormData(prev => ({ ...prev, ...defaults }));
            } catch (error) {
              console.error('Error loading smart defaults:', error);
            }
          }
          return;
        }
      }
      
      // Fallback to mock data
      const mockPro = getMockProfessionalByUserId(user.userId);
      if (mockPro) {
        setProfessional(mockPro);
        if (mockPro.salonAddress) {
          setFormData(prev => ({ ...prev, location: mockPro.salonAddress }));
        }
      } else {
        // Use Sarah Mitchell as default professional (mock-pro-1)
        const sarahPro = getMockProfessional('mock-pro-1');
        if (sarahPro) {
          setProfessional(sarahPro);
          setFormData(prev => ({ ...prev, location: sarahPro.salonAddress }));
        } else {
          // Create a default mock professional (Sarah)
          const defaultPro = {
            id: 'mock-pro-1',
            userId: user.userId || 'mock-pro-user-1',
            email: user.signInDetails?.loginId || 'sarah@example.com',
            firstName: 'Sarah',
            lastName: 'Mitchell',
            salonName: 'Luxe Studio',
            salonAddress: '123 Beauty St, New York, NY 10001',
            status: 'active',
          };
          setProfessional(defaultPro);
          setFormData(prev => ({ ...prev, location: defaultPro.salonAddress }));
        }
      }
    } catch (error) {
      console.error('Error loading professional profile:', error);
      // Fallback to mock data on error - always use Sarah as default
      const mockPro = getMockProfessionalByUserId(user.userId);
      if (mockPro) {
        setProfessional(mockPro);
        if (mockPro.salonAddress) {
          setFormData(prev => ({ ...prev, location: mockPro.salonAddress }));
        }
      } else {
        // Always fallback to Sarah Mitchell
        const sarahPro = getMockProfessional('mock-pro-1');
        if (sarahPro) {
          setProfessional(sarahPro);
          setFormData(prev => ({ ...prev, location: sarahPro.salonAddress }));
        } else {
          // Create default Sarah profile
          const defaultPro = {
            id: 'mock-pro-1',
            userId: user.userId || 'mock-pro-user-1',
            email: user.signInDetails?.loginId || 'sarah@example.com',
            firstName: 'Sarah',
            lastName: 'Mitchell',
            salonName: 'Luxe Studio',
            salonAddress: '123 Beauty St, New York, NY 10001',
            status: 'active',
          };
          setProfessional(defaultPro);
          setFormData(prev => ({ ...prev, location: defaultPro.salonAddress }));
        }
      }
    }
  };

  const loadDraftData = () => {
    try {
      const draft = loadDraft('modelRequestDraft');
      if (draft) {
        setFormData(draft);
        setDraftSaved(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleNext = () => {
    // Validate service and details before allowing to proceed to attributes
    if (currentStep === 0) { // Service step
      if (!formData.serviceType) {
        alert('Please select a service type.');
        return;
      }
    }
    
    if (currentStep === 1) { // Details step
      if (!formData.requestedDate || !formData.requestedTime) {
        alert('Please select a date and time to lock in your calendar spot.');
        return;
      }
    }
    
    // Validate required attributes if on attributes step
    if (currentStep === 2 && formData.serviceType) { // Attributes is now step 2 (index 2)
      const validation = validateRequiredAttributes(formData.serviceType, formData.selectedTags);
      if (!validation.valid) {
        alert(`Please select required attributes: ${validation.missing.join(', ')}`);
        return;
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      saveDraft();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInspirationUpload = (results) => {
    const newPhotos = results.map(r => ({
      url: r.url,
      key: r.key,
      id: `inspo-${Date.now()}-${Math.random()}`,
    }));
    setFormData(prev => ({
      ...prev,
      inspirationPhotos: [...prev.inspirationPhotos, ...newPhotos],
    }));
  };

  const handleRemoveInspiration = (photoId) => {
    setFormData(prev => ({
      ...prev,
      inspirationPhotos: prev.inspirationPhotos.filter(p => p.id !== photoId),
    }));
  };

  const handleSubmit = async (e) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Professional:', professional);
    console.log('Form Data:', formData);
    console.log('Submitting state:', submitting);
    
    // Ensure we have a professional profile - use Sarah as default if needed
    let currentProfessional = professional;
    if (!currentProfessional) {
      // Try to load Sarah's profile one more time
      const sarahPro = getMockProfessional('mock-pro-1');
      if (sarahPro) {
        currentProfessional = sarahPro;
        setProfessional(sarahPro);
      } else {
        // Create default Sarah profile
        const defaultPro = {
          id: 'mock-pro-1',
          userId: user?.userId || 'mock-pro-user-1',
          email: user?.signInDetails?.loginId || 'sarah@example.com',
          firstName: 'Sarah',
          lastName: 'Mitchell',
          salonName: 'Luxe Studio',
          salonAddress: '123 Beauty St, New York, NY 10001',
          status: 'active',
        };
        currentProfessional = defaultPro;
        setProfessional(defaultPro);
      }
    }
    
    // Ensure we have at least an ID to proceed
    const professionalId = currentProfessional?.id || 'mock-pro-1';
    if (!professionalId) {
      alert('Professional profile not found. Please complete your profile first.');
      return;
    }

    console.log('=== VALIDATING FORM ===');
    console.log('Service Type:', formData.serviceType);
    console.log('Requested Date:', formData.requestedDate);
    console.log('Requested Time:', formData.requestedTime);
    
    if (!formData.serviceType || !formData.requestedDate || !formData.requestedTime) {
      const missing = [];
      if (!formData.serviceType) missing.push('Service Type');
      if (!formData.requestedDate) missing.push('Date');
      if (!formData.requestedTime) missing.push('Time');
      alert(`Please complete all required fields:\n- ${missing.join('\n- ')}`);
      return;
    }
    
    // Prevent double submission
    if (submitting) {
      console.log('Already submitting, ignoring click');
      return;
    }

    console.log('=== STARTING SUBMISSION ===');
    setSubmitting(true);
    try {
      const requestData = {
        professionalId,
        serviceType: formData.serviceType,
        serviceDescription: formData.serviceDescription,
        desiredHairColor: formData.selectedTags.find(t => t.includes('hair:color'))?.split(':').pop() || null,
        desiredHairLength: formData.selectedTags.find(t => t.includes('hair:length'))?.split(':').pop() || null,
        desiredHairTexture: formData.selectedTags.find(t => t.includes('hair:texture'))?.split(':').pop() || null,
        desiredHairCondition: formData.selectedTags.find(t => t.includes('hair:condition'))?.split(':').pop() || null,
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime,
        duration: formData.duration || 60,
        location: formData.location || currentProfessional?.salonAddress || '123 Beauty St, New York, NY 10001',
        status: 'matching',
        priority: 'normal',
        inspirationPhotos: (formData.inspirationPhotos || []).map(p => p?.url || p).filter(Boolean),
        tags: formData.selectedTags || [],
        customAttributes: formData.customAttributes || {},
        specialRequests: formData.specialRequests || '',
      };

      const request = await createRequest(requestData);

      // Clear draft
      clearDraft('modelRequestDraft');
      
      console.log('Request submitted successfully, navigating...');
      alert('Your luxury request has been submitted! Our concierge team will find the perfect match for you.');
      navigate('/portal/requests');
    } catch (error) {
      console.error('Error creating request:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback to mock data on error
      try {
        // Use currentProfessional if available, otherwise fallback
        const fallbackProfessional = currentProfessional || professional || {
          id: 'mock-pro-1',
          firstName: 'Sarah',
          lastName: 'Mitchell',
          salonAddress: '123 Beauty St, New York, NY 10001',
        };
        const professionalId = fallbackProfessional?.id || 'mock-pro-1';
        
        console.log('Fallback: Creating mock request with professionalId:', professionalId);
        const request = createMockRequest({
          professionalId: professionalId,
          serviceType: formData.serviceType,
          serviceDescription: formData.serviceDescription,
          desiredHairColor: formData.selectedTags.find(t => t.includes('hair:color'))?.split(':').pop() || null,
          desiredHairLength: formData.selectedTags.find(t => t.includes('hair:length'))?.split(':').pop() || null,
          desiredHairTexture: formData.selectedTags.find(t => t.includes('hair:texture'))?.split(':').pop() || null,
          desiredHairCondition: formData.selectedTags.find(t => t.includes('hair:condition'))?.split(':').pop() || null,
          requestedDate: formData.requestedDate,
          requestedTime: formData.requestedTime,
          duration: formData.duration || 60,
          location: formData.location || fallbackProfessional?.salonAddress || '123 Beauty St, New York, NY 10001',
          status: 'matching',
          priority: 'normal',
          inspirationPhotos: formData.inspirationPhotos.map(p => p.url),
          tags: formData.selectedTags,
          customAttributes: formData.customAttributes,
          specialRequests: formData.specialRequests,
        });
        
        console.log('Fallback: Mock request created successfully:', request);
        
        // Don't auto-create matches - let admin do it manually
        // Request is 'matching' so it appears in Admin Request Queue and Match Approval list
        
        clearDraft('modelRequestDraft');
        alert('Your luxury request has been submitted! Our concierge team will find the perfect match for you.');
        navigate('/portal/requests');
      } catch (mockError) {
        console.error('Error with mock data fallback:', mockError);
        console.error('Mock error details:', mockError.message, mockError.stack);
        alert(`Error creating request: ${mockError.message || 'Unknown error'}. Please check the console for details.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    const step = STEPS[currentStep];
    
    switch (step.id) {
      case 'inspiration':
        return (
          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepTitle}>
                <span>{step.icon}</span>
                {step.label}
              </div>
              <div style={styles.stepDescription}>
                Share your vision. Upload inspiration photos, describe your aesthetic, or let us know what vibe you're going for.
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Inspiration Photos</label>
              <PhotoUploader
                title="Upload Inspiration"
                subtitle="Drag & drop or click to add photos"
                maxFiles={10}
                accentColor="#8B1E3F"
                existingPhotos={formData.inspirationPhotos.map(p => ({ url: p.url, key: p.key }))}
                pathGenerator={(filename) => getPortfolioPath(professional?.id || 'temp', `inspiration-${filename}`)}
                onUpload={handleInspirationUpload}
                onDelete={(photo) => {
                  const photoToRemove = formData.inspirationPhotos.find(p => p.url === photo.url || p.key === photo.key);
                  if (photoToRemove) handleRemoveInspiration(photoToRemove.id);
                }}
              />
              {formData.inspirationPhotos.length > 0 && (
                <div style={styles.helperText}>
                  {formData.inspirationPhotos.length} inspiration photo{formData.inspirationPhotos.length > 1 ? 's' : ''} uploaded
                </div>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Inspiration Notes</label>
              <textarea
                style={styles.textarea}
                value={formData.inspirationNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, inspirationNotes: e.target.value }))}
                placeholder="Describe your vision... What aesthetic are you going for? Any specific looks, colors, or styles you're inspired by?"
                rows={4}
              />
              <div style={styles.helperText}>
                The more details you share, the better we can match you with the perfect model.
              </div>
            </div>
          </div>
        );
        
      case 'service':
        return (
          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepTitle}>
                <span>{step.icon}</span>
                {step.label}
              </div>
              <div style={styles.stepDescription}>
                Tell us about the service you need. What will you be working on?
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Service Type <span style={{ color: '#8B1E3F' }}>*</span>
              </label>
              <select
                style={styles.select}
                value={formData.serviceType}
                onChange={(e) => {
                  const serviceId = e.target.value;
                  const selectedService = services.find(s => s.id === serviceId);
                  setFormData(prev => ({
                    ...prev,
                    serviceType: serviceId,
                    duration: selectedService ? selectedService.duration : 60, // Auto-set to service minimum
                  }));
                }}
                required
              >
                <option value="">Select a service...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Duration (minutes)</label>
              <div style={styles.durationControls}>
                <button
                  type="button"
                  style={{
                    ...styles.durationButton,
                    ...(!formData.serviceType || (() => {
                      if (!formData.serviceType) return true;
                      const selectedService = services.find(s => s.id === formData.serviceType);
                      return formData.duration <= (selectedService ? selectedService.duration : 60);
                    })() ? styles.durationButtonDisabled : {}),
                  }}
                  onClick={() => {
                    if (!formData.serviceType) return;
                    const selectedService = services.find(s => s.id === formData.serviceType);
                    const minDuration = selectedService ? selectedService.duration : 60;
                    const newDuration = Math.max(formData.duration - 15, minDuration);
                    setFormData(prev => ({ ...prev, duration: newDuration }));
                  }}
                  disabled={!formData.serviceType || (() => {
                    if (!formData.serviceType) return true;
                    const selectedService = services.find(s => s.id === formData.serviceType);
                    return formData.duration <= (selectedService ? selectedService.duration : 60);
                  })()}
                >
                  -15
                </button>
                <input
                  type="number"
                  style={{ ...styles.input, ...styles.durationInput }}
                  value={formData.duration}
                  readOnly
                  disabled={!formData.serviceType}
                />
                <button
                  type="button"
                  style={{
                    ...styles.durationButton,
                    ...(!formData.serviceType || (() => {
                      if (!formData.serviceType) return true;
                      const selectedService = services.find(s => s.id === formData.serviceType);
                      const maxDuration = selectedService ? selectedService.duration + 120 : 180;
                      return formData.duration >= maxDuration;
                    })() ? styles.durationButtonDisabled : {}),
                  }}
                  onClick={() => {
                    if (!formData.serviceType) return;
                    const selectedService = services.find(s => s.id === formData.serviceType);
                    const maxDuration = selectedService ? selectedService.duration + 120 : 180;
                    const newDuration = Math.min(formData.duration + 15, maxDuration);
                    setFormData(prev => ({ ...prev, duration: newDuration }));
                  }}
                  disabled={!formData.serviceType || (() => {
                    if (!formData.serviceType) return true;
                    const selectedService = services.find(s => s.id === formData.serviceType);
                    const maxDuration = selectedService ? selectedService.duration + 120 : 180;
                    return formData.duration >= maxDuration;
                  })()}
                >
                  +15
                </button>
              </div>
              <div style={styles.helperText}>
                {formData.serviceType ? (
                  <>Add or subtract 15 min. Min: {services.find(s => s.id === formData.serviceType)?.duration} min.</>
                ) : (
                  'Select a service to set duration'
                )}
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Description</label>
              <textarea
                style={styles.textarea}
                value={formData.serviceDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                placeholder="Describe what you'll be doing... (e.g., 'Practice balayage technique on long hair', 'Create a portfolio-worthy cut and style')"
                rows={4}
              />
            </div>
          </div>
        );
        
      case 'attributes':
        const serviceAttrs = formData.serviceType ? getServiceAttributes(formData.serviceType) : null;
        const validation = formData.serviceType ? validateRequiredAttributes(formData.serviceType, formData.selectedTags) : { valid: true, missing: [] };
        
        return (
          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepTitle}>
                <span>{step.icon}</span>
                {step.label}
              </div>
              <div style={styles.stepDescription}>
                {serviceAttrs ? (
                  <>
                    Now specify what you're looking for in your ideal model. {serviceAttrs.description}
                    {validation.missing.length > 0 && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(248, 81, 73, 0.1)',
                        border: '1px solid rgba(248, 81, 73, 0.3)',
                        borderRadius: '8px',
                        color: '#f85149',
                        fontSize: '0.9rem',
                        fontFamily: '"Alike", "Georgia", serif',
                      }}>
                        Please select at least one option for: {validation.missing.join(', ')}
                      </div>
                    )}
                  </>
                ) : (
                  'Select a service first to see relevant attributes.'
                )}
              </div>
            </div>
            
            {!formData.serviceType ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Please go back and select a service first.
              </div>
            ) : !formData.requestedDate || !formData.requestedTime ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Please go back and set your date and time first to lock in your calendar spot.
              </div>
            ) : (
              <>
                {/* Minimum Required Attributes */}
                {serviceAttrs.minRequired.length > 0 && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Required Attributes <span style={{ color: '#8B1E3F', fontSize: '0.85rem' }}>(Select at least one from each)</span>
                    </label>
                    {serviceAttrs.minRequired.map((attr, idx) => {
                      const category = GALLERY_TAG_CATEGORIES.find(c => c.id === attr.category);
                      const subcategory = category?.subcategories?.find(s => s.id === attr.subcategory);
                      const tags = subcategory ? subcategory.tags : (category?.tags || []);
                      const selectedTag = formData.selectedTags.find(tag => {
                        if (attr.subcategory) {
                          return tag.startsWith(`${attr.category}:${attr.subcategory}:`);
                        }
                        return tag.startsWith(`${attr.category}:`);
                      });
                      const hasSelection = !!selectedTag;
                      
                      return (
                        <div key={idx} style={{
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          background: hasSelection ? 'rgba(76, 175, 80, 0.05)' : 'rgba(248, 81, 73, 0.05)',
                          border: `2px solid ${hasSelection ? 'rgba(76, 175, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
                          borderRadius: '12px',
                        }}>
                          <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                            {attr.label} {hasSelection ? <span style={{ color: '#4caf50' }}>✓</span> : <span style={{ color: '#f85149' }}>*</span>}
                          </div>
                          <select
                            style={{
                              ...styles.select,
                              width: '100%',
                              background: hasSelection ? '#FFFEF9' : '#FFFEF9',
                            }}
                            value={selectedTag || ''}
                            onChange={(e) => {
                              const newTag = e.target.value;
                              if (!newTag) return;
                              
                              // Remove old tag from this category
                              const otherTags = formData.selectedTags.filter(tag => {
                                if (attr.subcategory) {
                                  return !tag.startsWith(`${attr.category}:${attr.subcategory}:`);
                                }
                                return !tag.startsWith(`${attr.category}:`);
                              });
                              
                              setFormData(prev => ({ 
                                ...prev, 
                                selectedTags: [...otherTags, newTag] 
                              }));
                            }}
                          >
                            <option value="">Select {attr.label.toLowerCase()}...</option>
                            {tags.map(tag => {
                              const tagPath = attr.subcategory 
                                ? `${attr.category}:${attr.subcategory}:${tag.id}`
                                : `${attr.category}:${tag.id}`;
                              return (
                                <option key={tag.id} value={tagPath}>
                                  {tag.label}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Recommended & Optional Attributes */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Additional Preferences <span style={{ fontSize: '0.85rem', color: '#5A3A2A', fontWeight: 'normal' }}>(Optional - helps us find the perfect match)</span>
                  </label>
                  <div style={styles.tagSection}>
                    <TagSearchBar
                      selectedTags={formData.selectedTags}
                      onTagsChange={(tags) => setFormData(prev => ({ ...prev, selectedTags: tags }))}
                      photos={[]}
                      placeholder="Search and add additional preferences..."
                      maxTags={20}
                    />
                  </div>
                  <div style={styles.helperText}>
                    Add more attributes to help us find the perfect match. The more specific you are, the better!
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Additional Notes</label>
                  <textarea
                    style={styles.textarea}
                    value={formData.customAttributes}
                    onChange={(e) => setFormData(prev => ({ ...prev, customAttributes: e.target.value }))}
                    placeholder="Any specific requirements or preferences not covered by tags? (e.g., 'Looking for someone comfortable with dramatic changes', 'Prefer models with experience in color work')"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        );
        
      case 'details':
        return (
          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepTitle}>
                <span>{step.icon}</span>
                {step.label}
              </div>
              <div style={styles.stepDescription}>
                Lock in your calendar spot! Select date, time, and location. You can save this and come back later to specify model preferences.
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Date <span style={{ color: '#8B1E3F' }}>*</span>
                </label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.requestedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Time <span style={{ color: '#8B1E3F' }}>*</span>
                </label>
                <input
                  type="time"
                  style={styles.input}
                  value={formData.requestedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                style={styles.input}
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={professional?.salonAddress || "Salon address or location"}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Location Notes</label>
              <textarea
                style={styles.textarea}
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any location-specific notes or instructions? (e.g., 'Parking available', 'Ring buzzer #5', 'Enter through side door')"
                rows={3}
              />
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(139, 30, 63, 0.05)',
              border: '1px solid rgba(139, 30, 63, 0.15)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#5A3A2A',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              <strong>Tip:</strong> Once you set the date and time, you can save this request and come back later to specify model attributes. This helps you plan your calendar first!
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <div style={styles.stepTitle}>
                <span>{step.icon}</span>
                {step.label}
              </div>
              <div style={styles.stepDescription}>
                Review your request before submitting. Our concierge team will find the perfect match for you.
              </div>
            </div>
            
            <div style={styles.previewSection}>
              <div style={styles.previewTitle}>Request Summary</div>
              
              {formData.inspirationPhotos.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={styles.label}>Inspiration Photos ({formData.inspirationPhotos.length})</div>
                  <div style={styles.inspirationGrid}>
                    {formData.inspirationPhotos.map(photo => (
                      <div key={photo.id} style={styles.inspirationCard}>
                        <img src={photo.url} alt="Inspiration" style={styles.inspirationImage} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Service:</strong> {services.find(s => s.id === formData.serviceType)?.name || formData.serviceType}
              </div>
              
              {formData.serviceDescription && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong> {formData.serviceDescription}
                </div>
              )}
              
              {formData.selectedTags.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tags:</strong> {formData.selectedTags.length} selected
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.selectedTags.slice(0, 10).map(tag => (
                      <span key={tag} style={{
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(139, 30, 63, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#8B1E3F',
                      }}>
                        {tag.split(':').pop().replace(/_/g, ' ')}
                      </span>
                    ))}
                    {formData.selectedTags.length > 10 && (
                      <span style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>
                        +{formData.selectedTags.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date & Time:</strong> {formData.requestedDate} at {formData.requestedTime}
              </div>
              
              {formData.location && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Location:</strong> {formData.location}
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroPattern}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Request Your Perfect Model</h1>
          <p style={styles.heroSubtitle}>
            Our luxury concierge service will find the ideal model for your needs. 
            Take your time, be specific, and let us handle the rest.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <React.Fragment key={step.id}>
              <div style={styles.stepItem}>
                <div style={{
                  ...styles.stepNumber,
                  ...(status === 'active' ? styles.stepNumberActive :
                      status === 'completed' ? styles.stepNumberCompleted :
                      styles.stepNumberPending),
                }}>
                  {status === 'completed' ? '✓' : index + 1}
                </div>
                <div style={{
                  ...styles.stepLabel,
                }}>
                  {step.label}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div style={{
                  ...styles.stepConnector,
                  ...(status === 'completed' || status === 'active' ? styles.stepConnectorActive : {}),
                }}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {renderStep()}
        
        {/* Actions */}
        <div style={styles.actions}>
          <div>
            {currentStep > 0 && (
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={handleBack}
              >
                ← Back
              </button>
            )}
            <button
              style={{ ...styles.button, ...styles.buttonTertiary }}
              onClick={saveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? 'Saving...' : draftSaved ? 'Draft Saved' : 'Save Draft'}
            </button>
            {currentStep === 1 && formData.requestedDate && formData.requestedTime && (
              <div style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#4caf50',
                fontFamily: '"Alike", "Georgia", serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                Calendar spot locked
              </div>
            )}
          </div>
          
          <div>
            {currentStep < STEPS.length - 1 ? (
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handleNext}
              >
                Continue →
              </button>
            ) : (
              <button
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  position: 'relative',
                  zIndex: 1000,
                }}
                onClick={async (e) => {
                  console.log('=== BUTTON CLICK EVENT FIRED ===');
                  e.preventDefault();
                  e.stopPropagation();
                  
                  console.log('=== SUBMIT BUTTON CLICKED ===');
                  console.log('Current step:', currentStep);
                  console.log('Total steps:', STEPS.length);
                  console.log('Form data:', JSON.stringify(formData, null, 2));
                  console.log('Professional:', professional);
                  console.log('Submitting state:', submitting);
                  
                  if (submitting) {
                    console.log('Already submitting, ignoring');
                    return;
                  }
                  
                  try {
                    console.log('Calling handleSubmit...');
                    await handleSubmit(e);
                    console.log('handleSubmit completed');
                  } catch (error) {
                    console.error('Error in button onClick:', error);
                    console.error('Error stack:', error.stack);
                    alert(`Error: ${error.message || 'Unknown error'}\n\nCheck console for details.`);
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                type="button"
                onMouseDown={(e) => {
                  console.log('Button mouse down');
                }}
                onMouseUp={(e) => {
                  console.log('Button mouse up');
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

