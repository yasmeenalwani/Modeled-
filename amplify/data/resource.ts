import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { notificationsFunction } from '../functions/notifications/resource';
import { stripePaymentFunction } from '../functions/stripe-payment/resource';
import { bookingRemindersFunction } from '../functions/booking-reminders/resource';
import { matchExpirationFunction } from '../functions/match-expiration/resource';
import { modelPaymentRemindersFunction } from '../functions/model-payment-reminders/resource';
import { chatActivationFunction } from '../functions/chat-activation/resource';
import { photoAnalysisFunction } from '../functions/photo-analysis/resource';

/**
 * MODELED MANAGEMENT - Data Schema
 * 
 * Core entities:
 * - ModelProfile: Girls who sign up as models
 * - Professional: Beauty/hair pros looking for models  
 * - Partner: Salons/studios
 * - ModelRequest: What professionals are looking for
 * - Match: Matched models to requests with scores
 * - Booking: Confirmed appointments
 */

const schema = a.schema({
  
  // ============ MODEL PROFILE ============
  // The everyday girls who want to be models
  ModelProfile: a
    .model({
      // Basic Info
      userId: a.string().required(),
      email: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      phone: a.string().required(), // Now required
      
      // Get to Know You Questions
      somethingFun: a.string(), // "Tell us something fun or unexpected about you"
      whatYouCareAbout: a.string(), // "What do you care about or love spending your energy on?"
      favoriteService: a.string(), // "What's your favorite beauty or hair service and what's one you'd love to try?"
      communityInterests: a.string().array(), // ["parties", "events", "perks", "panels", "photoshoots", "other"]
      communityInterestsOther: a.string(), // If "other" is selected
      
      // Terms & Conditions
      termsAccepted: a.boolean().default(false),
      termsAcceptedAt: a.datetime(),
      
      // Physical Attributes (for matching)
      hairColor: a.string(),
      hairLength: a.enum(['short', 'medium', 'long', 'extra_long']),
      hairTexture: a.enum(['straight', 'wavy', 'curly', 'coily']),
      hairCondition: a.enum(['healthy', 'damaged', 'color_treated', 'virgin']),
      virginHair: a.boolean(), // Explicit virgin hair flag (critical for color services)
      allergies: a.boolean().default(false), // Chemical/product allergies (dealbreaker for color/keratin)
      skinTone: a.string(),
      
      // ============ HAIR ENGINE - AUTO-TAGGED ATTRIBUTES ============
      // Simple attributes (shown to users)
      hairLengthSimple: a.enum(['short', 'medium', 'long', 'extra_long']),
      hairColorSimple: a.enum(['black', 'brown', 'blonde', 'red', 'gray', 'colored']),
      hairTextureSimple: a.enum(['straight', 'wavy', 'curly', 'coily']),
      
      // Detailed attributes (admin only - used for matching)
      hairLengthDetailed: a.string(), // "buzzed", "chin-length", "shoulder", "mid-back", "waist+"
      hairColorDetailed: a.json(), // { natural: "dark_brown", depth: 4, undertone: "warm", artificial: "none" }
      hairTextureDetailed: a.string(), // "1A"-"4C" (Andre Walker system)
      hairDensity: a.enum(['thin', 'medium', 'thick']),
      hairPorosity: a.enum(['low', 'medium', 'high']),
      hairHealth: a.json(), // { frizz: "low", damage: "none", splitEnds: false, shine: "natural" }
      hairStyle: a.string(), // Current style: "natural", "braids", "locs", etc.
      
      // Full analysis result (complete JSON from hair engine)
      autoTaggedAttributes: a.json(), // Full analysis result
      attributeConfidence: a.json(), // { hairLength: 0.92, hairColor: 0.88, ... }
      analysisVersion: a.string(), // Engine version (e.g., "MVP-1.0", "ML-2.0")
      
      // User validation (proprietary data collection)
      userValidatedAttributes: a.json(), // What user confirmed/corrected
      userValidatedAt: a.datetime(),
      validationAccuracy: a.float(), // % match between auto and user-validated
      
      // Photo analysis metadata
      lastPhotoAnalysis: a.datetime(),
      photoAnalysisStatus: a.enum(['pending', 'analyzing', 'completed', 'failed']),
      analyzedPhotoCount: a.integer(), // How many photos were analyzed
      
      // ============ BEAUTY ENGINE - AUTO-TAGGED ATTRIBUTES ============
      // SKIN ANALYSIS
      // Simple (user-facing)
      skinToneSimple: a.enum(['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark']),
      skinUndertone: a.enum(['warm', 'cool', 'neutral']),
      skinType: a.enum(['dry', 'normal', 'oily', 'combination']),
      
      // Detailed (admin-only)
      skinToneDetailed: a.json(), // { fitzpatrick: 1-6, hex: "#xxx", description: "..." }
      skinConcerns: a.string().array(), // ["acne", "redness", "hyperpigmentation", "fine_lines", etc.]
      skinTexture: a.enum(['smooth', 'normal', 'textured', 'rough']),
      
      // FACE ANALYSIS
      // Simple (user-facing)
      faceShapeSimple: a.enum(['oval', 'round', 'square', 'heart', 'oblong', 'diamond']),
      
      // Detailed (admin-only)
      faceShapeDetailed: a.json(), // { primary: "oval", secondary: "heart", proportions: {...} }
      faceLength: a.enum(['short', 'average', 'long']),
      foreheadSize: a.enum(['small', 'average', 'large']),
      cheekboneProminence: a.enum(['flat', 'average', 'prominent']),
      jawlineType: a.enum(['soft', 'average', 'defined', 'angular']),
      chinShape: a.enum(['pointed', 'rounded', 'square', 'recessed']),
      
      // EYE ANALYSIS
      // Simple (user-facing)
      eyeColorSimple: a.enum(['brown', 'blue', 'green', 'hazel', 'gray', 'amber']),
      eyeShapeSimple: a.enum(['almond', 'round', 'hooded', 'monolid', 'downturned', 'upturned']),
      
      // Detailed (admin-only)
      eyeColorDetailed: a.json(), // { primary: "brown", secondary: "amber", pattern: "solid", intensity: "dark" }
      eyeSize: a.enum(['small', 'medium', 'large']),
      eyeSpacing: a.enum(['close_set', 'average', 'wide_set']),
      eyeDepth: a.enum(['deep_set', 'average', 'prominent']),
      eyeLidType: a.enum(['visible_crease', 'hooded', 'monolid']),
      
      // EYEBROW ANALYSIS
      // Simple (user-facing)
      eyebrowShapeSimple: a.enum(['arched', 'straight', 'curved', 's_shaped', 'rounded']),
      eyebrowThickness: a.enum(['thin', 'medium', 'thick', 'bushy']),
      
      // Detailed (admin-only)
      eyebrowColorMatch: a.boolean(), // Does it match hair color?
      eyebrowGap: a.enum(['narrow', 'average', 'wide']), // Distance between brows
      eyebrowTailLength: a.enum(['short', 'medium', 'long']),
      eyebrowArch: a.json(), // { position: "high/medium/low", angle: number }
      
      // LIP ANALYSIS
      // Simple (user-facing)
      lipShapeSimple: a.enum(['full', 'thin', 'heart', 'wide', 'round', 'bow_shaped']),
      lipSize: a.enum(['thin', 'medium', 'full', 'very_full']),
      
      // Detailed (admin-only)
      lipProportions: a.json(), // { upperToLower: ratio, width: "narrow/average/wide" }
      lipColor: a.string(), // Natural lip color
      cupidsBow: a.enum(['defined', 'soft', 'flat']),
      
      // NOSE ANALYSIS (admin-only, for contouring/makeup)
      noseShape: a.enum(['straight', 'roman', 'button', 'snub', 'wide', 'narrow']),
      noseBridge: a.enum(['low', 'medium', 'high']),
      noseWidth: a.enum(['narrow', 'average', 'wide']),
      
      // OVERALL BEAUTY PROFILE
      beautyProfileComplete: a.boolean().default(false),
      lastBeautyAnalysis: a.datetime(),
      beautyAnalysisVersion: a.string(),
      
      // User validation for beauty attributes
      userValidatedBeautyAttributes: a.json(),
      beautyValidationAccuracy: a.float(),
      
      // Availability & Preferences
      availability: a.json(), // { monday: ['9am', '10am'], tuesday: [...] }
      locationZip: a.string(),
      willingToTravel: a.boolean(),
      travelRadius: a.integer(), // miles
      
      // Services they're open to
      openToHaircut: a.boolean(),
      openToColor: a.boolean(),
      openToStyling: a.boolean(),
      openToMakeup: a.boolean(),
      openToNails: a.boolean(),
      openToSkincare: a.boolean(),
      
      // Photos (S3 keys)
      photoUrls: a.string().array(),
      headshotUrl: a.string(),
      
      // Profile status (admin review workflow)
      status: a.enum(['pending', 'approved', 'active', 'inactive', 'manual_review', 'needs_changes', 'rejected']),
      
      // Tags for matching (populated by quizzes later)
      tags: a.string().array(),

      // Agentic learning scores (0-100, updated from bookings/feedback)
      reliabilityScore: a.float(), // Show-up rate, punctuality, cancellations
      feedbackScore: a.float(),   // Pro ratings after appointments
      experienceScore: a.float(), // Platform tenure, booking count
      engagementScore: a.float(), // Profile completeness, activity
      compatibilityScore: a.float(), // Historical success by service type
      agenticScores: a.json(),    // Full { reliability, feedback, experience, engagement, compatibility }
      serviceHistory: a.json(),   // { serviceType: { successes, total } } - persisted for compatibility
      servicesCompleted: a.string().array(), // Service types completed (for experience score)
      repeatBookings: a.integer(), // Count of rebookings from same professional
      rebookingCount: a.integer(), // Same as repeatBookings; explicit signal for compatibility
      professionalDeclines: a.integer(), // Times a professional declined this model (compatibility penalty)
      lastActiveDate: a.datetime(), // Updated on login, match response, profile edit (for decay/engagement)
      
      // Identity Verification (AWS Rekognition)
      identityVerified: a.boolean().default(false),
      identityVerificationStatus: a.enum(['pending', 'verified', 'failed', 'manual_review']),
      identityVerificationScore: a.float(), // 0-100 confidence from Rekognition
      identityVerifiedAt: a.datetime(),
      
      // ID Document (S3 key)
      idDocumentUrl: a.string(), // Driver's license, passport, state ID
      idDocumentType: a.enum(['drivers_license', 'passport', 'state_id', 'other']),
      
      // Verification Selfie (S3 key)
      verificationSelfieUrl: a.string(),
      
      // Admin Review
      verificationAdminNotes: a.string(),
      verificationReviewedBy: a.string(), // Admin userId
      verificationReviewedAt: a.datetime(),
      
      // Notes (admin only)
      adminNotes: a.string(),

      // Acquisition
      howDidYouHear: a.string(), // Dropdown: instagram, google, friend, salon, school, event, other
      howDidYouHearOther: a.string(), // Fill-in if "other"

      // Card on file (required for matching)
      stripeCustomerId: a.string(), // Stripe Customer ID for saved payment methods
      defaultPaymentMethodId: a.string(), // Stripe payment method ID (pm_xxx)
      cardOnFileStatus: a.enum(['none', 'valid', 'expired', 'declined', 'removed']),
      cardOnFileFlaggedAt: a.datetime(), // When card was taken down (expired/declined/removed)
    })
    .authorization((allow) => [
      allow.owner(),           // Models can manage their own profile
      allow.group('Admin'),    // Yasmeen can do everything
    ]),

  // ============ PROFESSIONAL ============
  // Beauty/hair pros looking for models to practice on
  Professional: a
    .model({
      userId: a.string().required(),
      email: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      phone: a.string().required(), // Now required
      
      // Professional Info
      specialties: a.string().array(), // ['hair coloring', 'blowouts', 'cuts']
      experienceLevel: a.enum(['student', 'apprentice', 'junior', 'senior']),
      licenseNumber: a.string(),
      yearsWorking: a.integer(), // Total years in the industry
      yearsInSalon: a.integer(), // Years working in a salon specifically
      certifications: a.string().array(), // Array of certification names
      education: a.string(), // Legacy / additional free-text
      educationSchool: a.string(), // Where they went to school (cosmetology/beauty school name)
      educationYearsCompleted: a.string(), // "1", "2", "3", "4+", "graduated"
      educationWorkshopsCourses: a.string(), // Workshops, courses, continuing ed
      inSalonTraining: a.boolean(), // Had previous in-salon training
      inSalonTrainingDetails: a.string(), // Optional details
      howDidYouHear: a.string(), // Dropdown: instagram, google, friend, salon, school, event, other
      howDidYouHearOther: a.string(), // Fill-in if "other"
      
      // Get to Know You Questions
      somethingFun: a.string(), // "Tell us something fun or unexpected about you"
      whatYouCareAbout: a.string(), // "What do you care about?" (personality)
      signatureService: a.string(), // "What's your signature service clients come back for?"
      serviceWantToTry: a.string(), // "What's your new service you want to practice?"
      workValues: a.string().array(), // ["creativity", "speed", "luxury_experience", "education", "inclusivity", etc.]
      workValuesOther: a.string(), // If "other" is selected
      // Legacy - kept for backward compatibility
      favoriteService: a.string(),
      communityInterests: a.string().array(),
      communityInterestsOther: a.string(),
      
      // Terms & Conditions
      termsAccepted: a.boolean().default(false),
      termsAcceptedAt: a.datetime(),
      
      // Where they work (structured for verification)
      salonName: a.string(),
      salonLocationSuffix: a.string(), // e.g. "Upper East Side", "Downtown" for multi-location salons
      salonStreet: a.string(),
      salonCity: a.string(),
      salonState: a.string(),
      salonAddress: a.string(), // Full composed address for display/geocoding
      salonLat: a.float(), // Geocoded from salonAddress (Nominatim)
      salonLng: a.float(),
      locationZip: a.string(), // 5-digit ZIP for matching
      partnerId: a.string(), // Link to Partner if applicable
      
      // Portfolio & Photos (each item: { url, key?, serviceLabel })
      portfolioItems: a.json(), // Array of { url, key, serviceLabel } - min 6, serviceLabel per pic
      portfolioUrls: a.string().array(), // Derived from portfolioItems for backward compat
      selfPhotoUrls: a.string().array(), // Photos of self for verification
      instagramHandle: a.string(),
      
      // Status
      status: a.enum(['pending', 'approved', 'active', 'inactive', 'manual_review', 'needs_changes', 'rejected']),
      
      // Identity Verification (AWS Rekognition)
      identityVerified: a.boolean().default(false),
      identityVerificationStatus: a.enum(['pending', 'verified', 'failed', 'manual_review']),
      identityVerificationScore: a.float(), // 0-100 confidence from Rekognition
      identityVerifiedAt: a.datetime(),
      
      // ID Document (S3 key)
      idDocumentUrl: a.string(), // Driver's license, passport, state ID
      idDocumentType: a.enum(['drivers_license', 'passport', 'state_id', 'other']),
      
      // Verification Selfie (S3 key)
      verificationSelfieUrl: a.string(),
      
      // Admin Review
      verificationAdminNotes: a.string(),
      verificationReviewedBy: a.string(), // Admin userId
      verificationReviewedAt: a.datetime(),
      
      // Admin notes
      adminNotes: a.string(),

      // Card on file (charge when model accepts)
      stripeCustomerId: a.string(),
      defaultPaymentMethodId: a.string(),
      cardOnFileStatus: a.enum(['none', 'valid', 'expired', 'declined', 'removed']),
      cardOnFileFlaggedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('Admin'),
    ]),

  // ============ PARTNER ============
  // Salons and studios
  Partner: a
    .model({
      userId: a.string().required(),
      email: a.string().required(),
      businessName: a.string().required(),
      contactName: a.string().required(),
      phone: a.string().required(), // Now required
      
      // Location (primary / rollup — use locationSites for multi-location)
      address: a.string(),
      city: a.string(),
      state: a.string(),
      zip: a.string(),
      locationSites: a.json(), // [{ id, name, neighborhood, address, city, state, zip, phone, hours, isPrimary, seasonal? }]
      slug: a.string(), // URL-safe id, e.g. roman-k-salon
      tags: a.string().array(), // luxury, multi_location, med_spa, etc.
      sourceUrl: a.string(), // Website used for admin import
      brandSummary: a.string(), // Short public-facing description
      
      // Business info
      businessType: a.enum(['salon', 'studio', 'school', 'spa', 'med_spa', 'barbershop', 'other']),
      website: a.string(), // Optional for inquiry
      howDidYouHear: a.string(),
      howDidYouHearOther: a.string(),
      instagramHandle: a.string(),
      yearsInBusiness: a.integer(), // Number of years in business
      numberOfLocations: a.string(), // Range: "1", "2-5", "6-10", "11-20", "21+"
      numberOfProfessionals: a.integer(), // Number of practicing professionals
      
      // Services with prices (JSON: [{ name, category, priceMin?, priceMax?, priceLabel?, highlights? }])
      servicesList: a.json(),
      pricingNote: a.string(), // e.g. "Pricing varies by location; see romanksalon.com/pricing"
      
      // Photos
      selfPhotoUrls: a.string().array(), // Photos of contact person for verification
      salonPhotoUrls: a.string().array(), // Photos of salon/studio
      
      // Get to Know You Questions (Business-focused)
      somethingFun: a.string(), // "Tell us something fun or unexpected about your business"
      whatYouCareAbout: a.string(), // "What do you care about or love spending your energy on?"
      businessGrowthGoals: a.string(), // "What's your business growth goals?"
      communityInterests: a.string().array(), // ["parties", "events", "perks", "panels", "photoshoots", "other"]
      communityInterestsOther: a.string(), // If "other" is selected
      
      // Terms & Conditions
      termsAccepted: a.boolean().default(false),
      termsAcceptedAt: a.datetime(),
      
      // Status
      status: a.enum(['pending', 'approved', 'active', 'inactive', 'manual_review', 'needs_changes', 'rejected']),
      
      // Identity Verification (AWS Rekognition)
      identityVerified: a.boolean().default(false),
      identityVerificationStatus: a.enum(['pending', 'verified', 'failed', 'manual_review']),
      identityVerificationScore: a.float(), // 0-100 confidence from Rekognition
      identityVerifiedAt: a.datetime(),
      
      // ID Document (S3 key)
      idDocumentUrl: a.string(), // Driver's license, passport, state ID
      idDocumentType: a.enum(['drivers_license', 'passport', 'state_id', 'other']),
      
      // Verification Selfie (S3 key)
      verificationSelfieUrl: a.string(),
      
      // Admin Review
      verificationAdminNotes: a.string(),
      verificationReviewedBy: a.string(), // Admin userId
      verificationReviewedAt: a.datetime(),
      
      adminNotes: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('Admin'),
    ]),

  // ============ MODEL REQUEST ============
  // What professionals are looking for
  ModelRequest: a
    .model({
      professionalId: a.string().required(),
      
      // What they need
      serviceType: a.string().required(), // 'blowout', 'color', 'cut', etc.
      serviceDescription: a.string(),
      
      // Ideal model attributes
      desiredHairColor: a.string(),
      desiredHairLength: a.enum(['short', 'medium', 'long', 'extra_long']),
      desiredHairTexture: a.enum(['straight', 'wavy', 'curly', 'coily']),
      desiredHairCondition: a.enum(['healthy', 'damaged', 'color_treated', 'virgin']),
      
      // When & Where
      requestedDate: a.date().required(),
      requestedTime: a.string().required(),
      duration: a.integer(), // minutes
      location: a.string(),
      locationZip: a.string(), // Extracted 5-digit ZIP for matching (from location or professional salon)
      
      // Pricing
      modelSearchFee: a.float(), // What pro pays Yasmeen
      modelPayment: a.float(),   // What model gets paid
      
      // Status
      status: a.enum(['pending', 'matching', 'matched', 'booked', 'completed', 'cancelled']),
      
      // Admin
      adminNotes: a.string(),
      priority: a.enum(['low', 'normal', 'high', 'urgent']),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('Admin'),
    ]),

  // ============ MATCH ============
  // Potential matches between requests and models
  Match: a
    .model({
      requestId: a.string().required(),
      modelId: a.string().required(),
      
      // Scoring
      matchScore: a.float().required(), // 0-100
      scoreBreakdown: a.json(), // { hairColor: 20, availability: 30, ... }
      
      // Status
      status: a.enum(['pending', 'approved', 'sent', 'accepted', 'declined', 'expired', 'waitlist']),
      
      // Waitlist (if booking was taken by another model)
      waitlistPosition: a.integer(), // 1 = first in line, 2 = second, etc.
      bookingId: a.string(), // Set if this match resulted in a booking
      
      // Timestamps
      sentAt: a.datetime(),
      respondedAt: a.datetime(),
      
      adminNotes: a.string(),
    })
    .authorization((allow) => [
      allow.group('Admin'),  // Only Yasmeen manages matches
    ]),

  // ============ SERVICE ============
  // Services offered through the platform
  Service: a
    .model({
      serviceId: a.string().required(), // 'haircut', 'color', etc.
      name: a.string().required(),
      category: a.string().required(), // 'Hair', 'Makeup', 'Nails'
      icon: a.string(),
      description: a.string(),
      
      // Pricing
      price: a.float().required(), // Base service price
      duration: a.integer(), // Duration in minutes
      
      // Fee structure (Modeled's cut)
      professionalFeePercent: a.float().required(),
      professionalFee: a.float().required(),
      modelFeePercent: a.float().required(),
      modelFee: a.float().required(),
      totalRevenue: a.float().required(), // professionalFee + modelFee
      
      // Requirements
      requirements: a.string().array(),
      
      // Status
      isActive: a.boolean(),
      
      adminNotes: a.string(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),

  // ============ NOTIFICATION ============
  // In-app notifications for portal
  Notification: a
    .model({
      userId: a.string().required(),
      userType: a.enum(['model', 'professional', 'partner', 'admin']),
      
      // Notification content
      type: a.string().required(), // 'match_opportunity', 'payment_required', 'booking_confirmed', etc.
      title: a.string().required(),
      message: a.string().required(),
      
      // Status
      read: a.boolean().default(false),
      readAt: a.datetime(),
      
      // Actions (JSON array of {label, action, primary})
      actions: a.json(),
      
      // Data (JSON object with notification-specific data)
      data: a.json(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.owner(), // Users can only see their own notifications
      allow.group('Admin'),
    ]),

  // ============ BOOKING ============  
  // Confirmed appointments
  Booking: a
    .model({
      matchId: a.string().required(),
      requestId: a.string().required(),
      modelId: a.string().required(),
      professionalId: a.string().required(),
      
      // Appointment details
      appointmentDate: a.date().required(),
      appointmentTime: a.string().required(),
      duration: a.integer(),
      location: a.string(),
      
      // Service
      serviceType: a.string(),
      serviceDescription: a.string(),
      
      // Payment
      modelFee: a.float(),
      modelPaymentStatus: a.enum(['pending', 'paid', 'refunded', 'failed']),
      professionalFee: a.float(),
      professionalPaymentStatus: a.enum(['pending', 'paid', 'refunded', 'failed']),
      
      // Stripe
      stripePaymentIntentId: a.string(),
      stripeCustomerId: a.string(), // For model or professional
      stripePaymentMethodId: a.string(),
      stripeChargeId: a.string(),
      
      // Payment details
      paymentAmount: a.float(), // Total amount charged
      paymentCurrency: a.string(), // 'usd'
      paymentDate: a.datetime(),
      refundAmount: a.float(),
      refundDate: a.datetime(),
      
      // Status
      status: a.enum(['confirmed', 'completed', 'cancelled', 'no_show']),
      
      // Post-service
      modelFeedback: a.json(),
      professionalFeedback: a.json(),
      afterPhotos: a.string().array(),
      
      // Tips
      tipAmount: a.float(),
      tipMethod: a.enum(['stripe', 'venmo', 'cash', 'other']),
      tipFee: a.float(), // Processing fee (Stripe only)
      tipProfessionalReceives: a.float(), // Amount professional actually receives
      tipStripePaymentIntentId: a.string(),
      tipVenmoHandle: a.string(),
      tipRecordedAt: a.datetime(),
      
      // Calendar
      modelCalendarEventId: a.string(),
      professionalCalendarEventId: a.string(),
      
      adminNotes: a.string(),
    })
    .authorization((allow) => [
      // Note: Custom authorization needed - models/professionals access via their profile IDs
      // For now, allow Admin group and public read (will be restricted via custom logic)
      allow.group('Admin'),
      // TODO: Add custom authorization resolver to check modelId/professionalId against user's profile
    ]),

  // ============ CONVERSATION ============
  // Chat conversations between users and admin
  Conversation: a
    .model({
      // Participants
      participant1Id: a.string().required(), // User ID (model, professional, or partner)
      participant1Type: a.enum(['model', 'professional', 'partner']),
      participant2Id: a.string().required(), // Always 'admin' or admin userId
      participant2Type: a.enum(['admin']),
      
      // Status
      status: a.enum(['active', 'archived', 'resolved']),
      
      // Last message info (for quick preview)
      lastMessageAt: a.datetime(),
      lastMessagePreview: a.string(),
      lastMessageSenderId: a.string(),
      
      // Unread tracking
      unreadCount: a.integer().default(0),
      unreadBy: a.string().array(), // User IDs who have unread messages
      
      // Metadata
      subject: a.string(), // Optional conversation subject
      tags: a.string().array(), // For categorization (e.g., 'billing', 'technical', 'booking')
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
      
      adminNotes: a.string(), // Internal admin notes
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('participant1Id'), // User can see their own conversations
      allow.group('Admin'), // Admin can see all conversations
    ]),

  // ============ MESSAGE ============
  // Individual messages in conversations
  Message: a
    .model({
      conversationId: a.string().required(),
      
      // Sender info
      senderId: a.string().required(),
      senderType: a.enum(['model', 'professional', 'partner', 'admin']),
      senderName: a.string(), // Cached name for quick display
      
      // Content
      content: a.string().required(),
      messageType: a.enum(['text', 'image', 'file', 'system', 'faq_suggestion']),
      
      // Attachments (S3 keys)
      attachments: a.string().array(),
      
      // Status
      read: a.boolean().default(false),
      readAt: a.datetime(),
      
      // FAQ/Auto-response
      isAutoResponse: a.boolean().default(false), // True if from FAQ bot
      faqMatch: a.string(), // Which FAQ was matched (if applicable)
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('senderId'), // Sender can see their messages
      allow.group('Admin'), // Admin can see all messages
      // Note: Conversation participants can see messages via conversationId
    ]),

  // ============ PRODUCT ============
  // Wear Care merch products
  Product: a
    .model({
      name: a.string().required(),
      description: a.string(),
      basePrice: a.float().required(), // e.g., 24.01
      roundUpAmount: a.float().required(), // e.g., 0.99
      totalPrice: a.float().required(), // basePrice + roundUpAmount
      
      // Product details
      category: a.string(), // 'apparel', 'accessories', 'other'
      size: a.string().array(), // ['XS', 'S', 'M', 'L', 'XL']
      color: a.string().array(), // ['Black', 'White', 'Green']
      imageUrls: a.string().array(), // S3 keys for product images
      
      // Inventory (optional for MVP)
      inStock: a.boolean().default(true),
      stockQuantity: a.integer(),
      
      // Donation info
      donationPercent: a.float().default(10.0), // 10% of base price goes to mental health
      donationAmount: a.float(), // Calculated: basePrice * (donationPercent / 100)
      
      // Status
      isActive: a.boolean().default(true),
      
      // Admin
      adminNotes: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey(), // Public can view products
      allow.group('Admin'), // Admin can manage
    ]),

  // ============ ORDER ============
  // Customer orders from Wear Care shop
  Order: a
    .model({
      userId: a.string(), // Optional - can be guest checkout
      customerEmail: a.string().required(),
      customerName: a.string().required(),
      customerPhone: a.string(),
      
      // Shipping
      shippingAddress: a.json().required(), // { street, city, state, zip, country }
      
      // Pricing
      subtotal: a.float().required(), // Sum of all items
      shippingCost: a.float().default(0),
      totalAmount: a.float().required(), // subtotal + shipping
      
      // Donation tracking
      totalDonation: a.float().required(), // Sum of all donations (10% + round-ups)
      donationFromPercent: a.float(), // 10% of base prices
      donationFromRoundUp: a.float(), // Sum of round-ups
      
      // Stripe
      stripePaymentIntentId: a.string(),
      stripeCustomerId: a.string(),
      stripeChargeId: a.string(),
      
      // Status
      status: a.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
      
      // Fulfillment
      trackingNumber: a.string(),
      shippedAt: a.datetime(),
      deliveredAt: a.datetime(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.owner(), // Customers can see their orders
      allow.group('Admin'), // Admin can see all orders
    ]),

  // ============ ORDER ITEM ============
  // Individual items in an order
  OrderItem: a
    .model({
      orderId: a.string().required(),
      productId: a.string().required(),
      
      // Product snapshot (in case product changes)
      productName: a.string().required(),
      productImageUrl: a.string(),
      basePrice: a.float().required(),
      roundUpAmount: a.float().required(),
      totalPrice: a.float().required(), // basePrice + roundUpAmount
      
      // Variants
      size: a.string(),
      color: a.string(),
      quantity: a.integer().required().default(1),
      
      // Donation for this item
      donationAmount: a.float().required(), // (basePrice * 0.10) + roundUpAmount
    })
    .authorization((allow) => [
      allow.group('Admin'), // Admin only for now
    ]),

  // ============ DONATION ============
  // Track donations from Wear Care (for Impact Metrics)
  Donation: a
    .model({
      orderId: a.string(), // Link to order if from merch
      source: a.enum(['wear_care', 'round_up', 'direct']), // Where donation came from
      
      // Amount
      amount: a.float().required(),
      
      // Allocation
      allocation: a.string().default('mental_health'), // 'mental_health', 'self_care', 'general'
      
      // Metadata
      donorEmail: a.string(), // Optional - if they want to be anonymous, leave blank
      donorName: a.string(), // Optional
      
      // Status
      status: a.enum(['pending', 'allocated', 'distributed']),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      allocatedAt: a.datetime(),
      distributedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'), // Admin only
    ]),

  // ============ BEAUTY MAINTENANCE ROUTINE ============
  // Model's beauty maintenance schedule
  BeautyMaintenanceRoutine: a
    .model({
      modelId: a.string().required(),
      
      // Service frequencies (in weeks)
      hairColorFrequency: a.integer(), // e.g., 8 weeks
      haircutFrequency: a.integer(), // e.g., 6 weeks
      eyelashFrequency: a.integer(), // e.g., 3 weeks
      blowoutFrequency: a.integer(), // e.g., 2 weeks
      treatmentFrequency: a.integer(), // e.g., 4 weeks
      nailFrequency: a.integer(), // e.g., 2 weeks
      browFrequency: a.integer(), // e.g., 4 weeks
      
      // Custom services (JSON: { serviceName: frequencyInWeeks })
      customServices: a.json(),
      
      // Last service dates (for tracking when due)
      lastHairColor: a.date(),
      lastHaircut: a.date(),
      lastEyelash: a.date(),
      lastBlowout: a.date(),
      lastTreatment: a.date(),
      lastNail: a.date(),
      lastBrow: a.date(),
      
      // Notes
      notes: a.string(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('modelId'),
      allow.group('Admin'),
    ]),

  // ============ INSPIRATION PHOTO ============
  // Model's inspiration photos (Pinterest-style board)
  InspirationPhoto: a
    .model({
      modelId: a.string().required(),
      
      // Photo
      photoUrl: a.string().required(), // S3 key
      
      // Category
      category: a.enum(['haircut', 'color', 'lashes', 'nails', 'overall', 'celebrity', 'other']),
      
      // Metadata
      title: a.string(), // Optional title/description
      source: a.string(), // Where it came from (Pinterest, Instagram, uploaded, etc.)
      isOnDeck: a.boolean().default(false), // Marked as "on-deck" (want next)
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('modelId'),
      allow.group('Admin'),
    ]),

  // ============ DAILY QUESTION ============
  // Daily educational questions for Learn & Earn
  DailyQuestion: a
    .model({
      // Question content
      question: a.string().required(),
      questionType: a.enum(['multiple_choice', 'true_false', 'preference']),
      
      // Options (for multiple choice)
      options: a.json(), // [{ value: 'A', text: 'Answer A' }, ...]
      correctAnswer: a.string(), // For educational questions
      
      // Category
      category: a.string().required(), // 'hair_color', 'hair_texture', 'hair_cut', 'product', 'routine', 'style', 'tools', 'celebrity'
      topic: a.string(), // More specific topic
      
      // Educational content
      explanation: a.string(), // Why this answer is correct (educational)
      xpReward: a.integer().default(50), // XP points for answering
      
      // Scheduling
      scheduledDate: a.date(), // Which date this question should appear
      isActive: a.boolean().default(true),
      
      // Admin
      adminNotes: a.string(),
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.publicApiKey(), // Models can view active questions
      allow.group('Admin'), // Admin can manage
    ]),

  // ============ QUESTION ANSWER ============
  // Model's answers to daily questions
  QuestionAnswer: a
    .model({
      modelId: a.string().required(),
      questionId: a.string().required(),
      
      // Answer
      answer: a.string().required(), // The answer they selected
      isCorrect: a.boolean(), // For educational questions
      
      // XP tracking
      xpEarned: a.integer().default(0),
      
      // Timestamps
      answeredAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('modelId'),
      allow.group('Admin'),
    ]),

  // ============ MODEL TO PRO CHAT ============
  // Chat conversations between models and professionals (1 hour before appointment)
  ModelToProChat: a
    .model({
      bookingId: a.string().required(), // Link to booking
      modelId: a.string().required(),
      professionalId: a.string().required(),
      
      // Chat window
      chatOpensAt: a.datetime().required(), // 1 hour before appointment
      chatClosesAt: a.datetime().required(), // 1 hour after appointment
      isActive: a.boolean().default(false), // True when chat window is open
      
      // Auto-sent profile info
      profileInfoSent: a.boolean().default(false),
      profileInfoSentAt: a.datetime(),
      
      // Status
      status: a.enum(['pending', 'active', 'closed']),
      
      // Last message info
      lastMessageAt: a.datetime(),
      lastMessagePreview: a.string(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('modelId'),
      allow.ownerDefinedIn('professionalId'),
      allow.group('Admin'),
    ]),

  // ============ CHAT MESSAGE (Model to Pro) ============
  // Messages in model-pro chats
  ModelToProMessage: a
    .model({
      chatId: a.string().required(), // Link to ModelToProChat
      
      // Sender
      senderId: a.string().required(),
      senderType: a.enum(['model', 'professional']),
      senderName: a.string(),
      
      // Content
      content: a.string().required(),
      messageType: a.enum(['text', 'quick_prompt', 'system']),
      quickPromptType: a.string(), // 'omw', '5_mins_out', 'just_got_off_subway', 'running_late', etc.
      
      // Status
      read: a.boolean().default(false),
      readAt: a.datetime(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('senderId'),
      allow.group('Admin'),
    ]),

  // ============ PROSPECT / LEAD (CRM) ============
  // Sales prospects for outreach, events, city expansion
  Prospect: a
    .model({
      // Basic Info
      firstName: a.string().required(),
      lastName: a.string(),
      email: a.string(),
      phone: a.string(),
      company: a.string(), // Salon name, event organizer, etc.
      title: a.string(), // Job title
      
      // Type & Context
      prospectType: a.enum(['professional', 'salon', 'event', 'city_expansion', 'partner', 'other']),
      source: a.string(), // 'referral', 'cold_outreach', 'event', 'website', 'social_media', etc.
      
      // Location (for city expansion)
      city: a.string(),
      state: a.string(),
      zipCode: a.string(),
      country: a.string().default('USA'),
      
      // Event Info (if event prospecting)
      eventName: a.string(),
      eventDate: a.date(),
      eventLocation: a.string(),
      eventType: a.string(), // 'trade_show', 'conference', 'expo', 'networking', etc.
      
      // Pipeline Stage
      stage: a.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'nurture']),
      priority: a.enum(['low', 'medium', 'high', 'urgent']),
      
      // Outreach Tracking
      lastContactedAt: a.datetime(),
      nextFollowUpAt: a.datetime(),
      contactCount: a.integer().default(0),
      emailOpened: a.boolean().default(false),
      emailClicked: a.boolean().default(false),
      responded: a.boolean().default(false),
      
      // Notes & Context
      notes: a.string(),
      tags: a.string().array(), // ['event_2024', 'la_launch', 'high_value', etc.]
      interestAreas: a.string().array(), // What they're interested in
      
      // Value & Potential
      estimatedValue: a.float(), // Potential revenue/value
      probability: a.integer(), // 0-100% chance of closing
      actualRevenue: a.float().default(0), // Actual revenue generated
      lifetimeValue: a.float().default(0), // Total lifetime value
      
      // Relationship Tracking
      relationshipStrength: a.enum(['cold', 'warm', 'hot', 'partner', 'advocate']),
      lastInteractionDate: a.datetime(),
      interactionCount: a.integer().default(0),
      meetingCount: a.integer().default(0),
      emailExchangeCount: a.integer().default(0),
      
      // Revenue Attribution
      revenueAttributed: a.float().default(0), // Revenue attributed to this prospect
      dealsClosed: a.integer().default(0), // Number of deals closed
      averageDealSize: a.float().default(0), // Average deal size
      
      // Owner & Assignment
      assignedTo: a.string(), // Admin userId
      createdBy: a.string(), // Admin userId who created
      
      // Status
      status: a.enum(['active', 'inactive', 'archived']),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'), // Only admins can manage prospects
    ]),

  // ============ OUTREACH CAMPAIGN ============
  // Email/SMS campaigns for prospecting
  OutreachCampaign: a
    .model({
      name: a.string().required(),
      description: a.string(),
      
      // Campaign Type
      campaignType: a.enum(['email', 'sms', 'linkedin', 'event', 'city_launch', 'general']),
      targetAudience: a.string(), // 'professionals', 'salons', 'event_organizers', 'city_launch_la', etc.
      
      // Content
      subject: a.string(), // Email subject
      message: a.string().required(), // Email/SMS body
      templateId: a.string(), // Reference to email template
      
      // Scheduling
      scheduledAt: a.datetime(),
      sentAt: a.datetime(),
      status: a.enum(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled']),
      
      // Targeting
      prospectIds: a.string().array(), // Which prospects to target
      filters: a.json(), // { city: 'LA', prospectType: 'professional', stage: 'new' }
      
      // Metrics
      totalSent: a.integer().default(0),
      totalOpened: a.integer().default(0),
      totalClicked: a.integer().default(0),
      totalReplied: a.integer().default(0),
      totalConverted: a.integer().default(0),
      
      // Owner
      createdBy: a.string(), // Admin userId
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),

  // ============ OUTREACH ACTIVITY ============
  // Individual outreach actions (emails sent, calls made, etc.)
  OutreachActivity: a
    .model({
      prospectId: a.string().required(),
      campaignId: a.string(), // If part of a campaign
      
      // Activity Type
      activityType: a.enum(['email', 'sms', 'call', 'linkedin', 'meeting', 'note', 'task']),
      
      // Content
      subject: a.string(), // For emails
      message: a.string(), // Email/SMS body or call notes
      direction: a.enum(['outbound', 'inbound']),
      
      // Status
      status: a.enum(['sent', 'delivered', 'opened', 'clicked', 'replied', 'completed', 'failed']),
      
      // Response tracking
      responded: a.boolean().default(false),
      responseMessage: a.string(),
      
      // Follow-up
      requiresFollowUp: a.boolean().default(false),
      followUpDate: a.datetime(),
      
      // Owner
      performedBy: a.string(), // Admin userId
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),

  // ============ CITY EXPANSION ============
  // Track city expansion efforts
  CityExpansion: a
    .model({
      city: a.string().required(),
      state: a.string().required(),
      country: a.string().default('USA'),
      
      // Status
      status: a.enum(['researching', 'outreach', 'partners_found', 'launching', 'launched', 'on_hold']),
      priority: a.enum(['low', 'medium', 'high', 'urgent']),
      
      // Goals & Metrics
      targetProfessionals: a.integer(), // Goal: # of professionals to onboard
      targetModels: a.integer(), // Goal: # of models to onboard
      currentProfessionals: a.integer().default(0),
      currentModels: a.integer().default(0),
      
      // Timeline
      targetLaunchDate: a.date(),
      actualLaunchDate: a.date(),
      
      // Outreach
      prospectsIdentified: a.integer().default(0),
      prospectsContacted: a.integer().default(0),
      prospectsConverted: a.integer().default(0),
      
      // Notes
      notes: a.string(),
      marketResearch: a.json(), // Market data, competition, etc.
      
      // Owner
      assignedTo: a.string(), // Admin userId
      createdBy: a.string(),
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),

  // ============ BUSINESS TRIP / EVENT ============
  // Track business trips, conferences, trade shows
  BusinessTrip: a
    .model({
      // Basic Info
      name: a.string().required(), // "Anaheim Beauty Expo 2024"
      tripType: a.enum(['conference', 'trade_show', 'expo', 'networking', 'city_visit', 'other']),
      
      // Location
      city: a.string().required(),
      state: a.string(),
      country: a.string().default('USA'),
      venue: a.string(), // "Anaheim Convention Center"
      address: a.string(),
      
      // Dates
      startDate: a.date().required(),
      endDate: a.date().required(),
      
      // Status
      status: a.enum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled']),
      
      // Goals & Objectives
      primaryGoal: a.string(), // "Meet 20 beauty professionals, find 5 salon partners"
      objectives: a.string().array(), // ["Connect with LA salons", "Find event sponsors", "Recruit models"]
      targetContacts: a.integer(), // Goal: # of contacts to make
      targetProspects: a.integer(), // Goal: # of prospects to convert
      
      // Progress Tracking
      contactsMade: a.integer().default(0),
      prospectsMet: a.integer().default(0),
      businessCardsCollected: a.integer().default(0),
      meetingsScheduled: a.integer().default(0),
      
      // Schedule & Itinerary
      itinerary: a.json(), // [{ date: "2024-01-15", time: "9:00 AM", event: "Opening Keynote", location: "Hall A" }]
      importantDates: a.json(), // [{ date: "2024-01-16", description: "Networking dinner" }]
      
      // People to Meet
      prospectIds: a.string().array(), // Linked prospects from CRM
      mustMeet: a.string().array(), // ["Sarah from LA Salon", "John from Beauty Magazine"]
      
      // Logistics
      flightInfo: a.json(), // { airline: "Delta", flightNumber: "DL123", departure: "...", arrival: "..." }
      hotelInfo: a.json(), // { name: "Hilton Anaheim", address: "...", checkIn: "...", checkOut: "..." }
      transportation: a.json(), // { rentalCar: true, uberBudget: 200 }
      budget: a.float(), // Total trip budget
      expenses: a.json(), // [{ category: "flight", amount: 500, date: "..." }]
      
      // Notes & Research
      prepNotes: a.string(), // Pre-trip preparation notes
      dailyNotes: a.json(), // [{ date: "2024-01-15", notes: "Met 5 professionals, great connections" }]
      postTripNotes: a.string(), // Post-trip summary and learnings
      
      // Follow-ups
      followUpsScheduled: a.integer().default(0),
      followUpsCompleted: a.integer().default(0),
      nextFollowUpDate: a.datetime(),
      
      // Owner
      createdBy: a.string(), // Admin userId
      assignedTo: a.string(), // Admin userId
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),

  // ============ TRIP CONTACT ============
  // Contacts made during a trip
  TripContact: a
    .model({
      tripId: a.string().required(),
      prospectId: a.string(), // If linked to existing prospect
      
      // Contact Info
      firstName: a.string().required(),
      lastName: a.string(),
      email: a.string(),
      phone: a.string(),
      company: a.string(),
      title: a.string(),
      linkedin: a.string(),
      
      // Meeting Details
      meetingDate: a.date(),
      meetingTime: a.string(),
      meetingLocation: a.string(), // "Booth 123", "Networking Lounge"
      meetingNotes: a.string(),
      
      // Business Card Info
      businessCardCollected: a.boolean().default(false),
      businessCardPhotoUrl: a.string(), // S3 key for photo of business card
      
      // Interest & Next Steps
      interestLevel: a.enum(['high', 'medium', 'low', 'not_interested']),
      nextSteps: a.string(), // "Send follow-up email", "Schedule call", "Add to CRM"
      followUpDate: a.datetime(),
      followUpCompleted: a.boolean().default(false),
      
      // Tags
      tags: a.string().array(), // ["potential_partner", "model_recruiter", "event_organizer"]
      
      // Owner
      createdBy: a.string(), // Admin userId
      
      // Timestamps
      createdAt: a.datetime(), // Set in app when creating
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('Admin'),
    ]),
})
  .authorization((allow) => [
    allow.resource(notificationsFunction), // SES/SNS pipeline can create in-app Notification records
    allow.resource(stripePaymentFunction), // Stripe webhook can create Booking + update Match on payment success
    allow.resource(bookingRemindersFunction), // Scheduled job queries bookings + sends reminders
    allow.resource(matchExpirationFunction), // Scheduled job expires old sent matches
    allow.resource(modelPaymentRemindersFunction), // Scheduled job sends payment reminders to models
    allow.resource(chatActivationFunction), // Scheduled job activates model-pro chats before appointments
    allow.resource(photoAnalysisFunction), // S3 trigger updates ModelProfile with Rekognition analysis
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Use Cognito for authenticated users
    defaultAuthorizationMode: 'userPool',
    // Required for Product + DailyQuestion which use allow.publicApiKey()
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
