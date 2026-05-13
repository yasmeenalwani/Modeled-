// ============================================
// MODELED MANAGEMENT - TRAINING PROGRAM
// ============================================

export const TRAINING_CATEGORIES = {
  blowouts: {
    id: 'blowouts',
    name: 'Blowouts & Styling',
    icon: '💨',
    color: '#e94560',
    totalHours: 250,
    objectives: [
      'Speed and efficiency',
      'Finish quality',
      'Client communication',
      'Product control',
    ],
    modules: [
      { id: 'blow-101', name: 'Blowout Fundamentals', hours: 20, type: 'video' },
      { id: 'blow-102', name: 'Round Brush Techniques', hours: 30, type: 'video' },
      { id: 'blow-103', name: 'Smoothing & Shine', hours: 25, type: 'hands-on' },
      { id: 'blow-104', name: 'Volume & Body', hours: 30, type: 'hands-on' },
      { id: 'blow-105', name: 'Curly to Straight', hours: 35, type: 'hands-on' },
      { id: 'blow-106', name: 'Product Knowledge', hours: 15, type: 'quiz' },
      { id: 'blow-107', name: 'Speed Training', hours: 40, type: 'hands-on' },
      { id: 'blow-108', name: 'Client Consultation', hours: 20, type: 'video' },
      { id: 'blow-109', name: 'Styling Finishing', hours: 25, type: 'hands-on' },
      { id: 'blow-110', name: 'Final Assessment', hours: 10, type: 'assessment' },
    ],
  },
  haircuts: {
    id: 'haircuts',
    name: 'Haircuts',
    icon: '✂️',
    color: '#667eea',
    totalHours: 250,
    objectives: [
      'Precision fundamentals',
      'Sectioning mastery',
      'Scissor/razor control',
      'Trend adaptations',
    ],
    modules: [
      { id: 'cut-101', name: 'Cutting Fundamentals', hours: 25, type: 'video' },
      { id: 'cut-102', name: 'Sectioning & Mapping', hours: 20, type: 'video' },
      { id: 'cut-103', name: 'Scissor Techniques', hours: 35, type: 'hands-on' },
      { id: 'cut-104', name: 'Razor Cutting', hours: 30, type: 'hands-on' },
      { id: 'cut-105', name: 'Layering Techniques', hours: 30, type: 'hands-on' },
      { id: 'cut-106', name: 'Bob & Lob Cuts', hours: 25, type: 'hands-on' },
      { id: 'cut-107', name: 'Textured Cuts', hours: 25, type: 'hands-on' },
      { id: 'cut-108', name: 'Men\'s Cutting Basics', hours: 20, type: 'hands-on' },
      { id: 'cut-109', name: 'Trend Adaptations', hours: 25, type: 'video' },
      { id: 'cut-110', name: 'Final Assessment', hours: 15, type: 'assessment' },
    ],
  },
  color: {
    id: 'color',
    name: 'Color',
    icon: '🎨',
    color: '#4caf50',
    totalHours: 300,
    objectives: [
      'Consultation expertise',
      'Formulation mastery',
      'Application precision',
      'Timing & corrective basics',
    ],
    modules: [
      { id: 'color-101', name: 'Color Theory', hours: 30, type: 'video' },
      { id: 'color-102', name: 'Consultation & Analysis', hours: 25, type: 'video' },
      { id: 'color-103', name: 'Product & Formulation', hours: 35, type: 'quiz' },
      { id: 'color-104', name: 'Root Touch-Up', hours: 30, type: 'hands-on' },
      { id: 'color-105', name: 'Global Color', hours: 35, type: 'hands-on' },
      { id: 'color-106', name: 'Highlights - Foils', hours: 40, type: 'hands-on' },
      { id: 'color-107', name: 'Highlights - Balayage', hours: 40, type: 'hands-on' },
      { id: 'color-108', name: 'Toning & Glazing', hours: 25, type: 'hands-on' },
      { id: 'color-109', name: 'Color Correction Basics', hours: 25, type: 'hands-on' },
      { id: 'color-110', name: 'Final Assessment', hours: 15, type: 'assessment' },
    ],
  },
};

export const TOTAL_TRAINING_HOURS = 800;

// Onboarding steps for professionals
export const ONBOARDING_STEPS = [
  {
    id: 'profile',
    name: 'Profile Setup',
    icon: '👤',
    description: 'Complete your professional profile',
    tasks: [
      { id: 'profile-1', name: 'Basic Information', required: true },
      { id: 'profile-2', name: 'Professional Bio', required: true },
      { id: 'profile-3', name: 'Portfolio Photos', required: true },
      { id: 'profile-4', name: 'Social Links', required: false },
      { id: 'profile-5', name: 'Profile Photo', required: true },
    ],
  },
  {
    id: 'verification',
    name: 'Verification & Compliance',
    icon: '✅',
    description: 'Verify your identity and credentials',
    tasks: [
      { id: 'verify-1', name: 'Government ID Upload', required: true },
      { id: 'verify-2', name: 'Selfie Verification', required: true },
      { id: 'verify-3', name: 'Cosmetology License', required: true },
      { id: 'verify-4', name: 'Additional Certifications', required: false },
      { id: 'verify-5', name: 'Background Check Consent', required: true },
    ],
  },
  {
    id: 'documents',
    name: 'Documents & Agreements',
    icon: '📄',
    description: 'Review and sign required documents',
    tasks: [
      { id: 'docs-1', name: 'Service Agreement', required: true },
      { id: 'docs-2', name: 'NDA / Confidentiality', required: true },
      { id: 'docs-3', name: 'Code of Conduct', required: true },
      { id: 'docs-4', name: 'Payment Terms', required: true },
      { id: 'docs-5', name: 'Insurance Verification', required: false },
    ],
  },
  {
    id: 'training',
    name: 'Initial Training',
    icon: '📚',
    description: 'Complete required orientation modules',
    tasks: [
      { id: 'train-1', name: 'Platform Overview', required: true },
      { id: 'train-2', name: 'Model Interaction Guidelines', required: true },
      { id: 'train-3', name: 'Safety & Hygiene Protocols', required: true },
      { id: 'train-4', name: 'Booking System Tutorial', required: true },
      { id: 'train-5', name: 'Feedback & Rating System', required: true },
    ],
  },
  {
    id: 'assessment',
    name: 'Skills Assessment',
    icon: '🎯',
    description: 'Demonstrate your skills for placement',
    tasks: [
      { id: 'assess-1', name: 'Service Category Selection', required: true },
      { id: 'assess-2', name: 'Experience Level Quiz', required: true },
      { id: 'assess-3', name: 'Specialization Declaration', required: true },
      { id: 'assess-4', name: 'Availability Setup', required: true },
      { id: 'assess-5', name: 'Initial Training Assignment', required: true },
    ],
  },
  {
    id: 'approval',
    name: 'Final Approval',
    icon: '🏆',
    description: 'Admin review and activation',
    tasks: [
      { id: 'approve-1', name: 'Document Verification', required: true },
      { id: 'approve-2', name: 'Background Check Clear', required: true },
      { id: 'approve-3', name: 'Admin Interview (if needed)', required: false },
      { id: 'approve-4', name: 'Account Activation', required: true },
    ],
  },
];

// Professional status types
export const PROFESSIONAL_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',
  IN_ONBOARDING: 'in_onboarding',
  IN_TRAINING: 'in_training',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
};

// Access levels
export const ACCESS_LEVELS = {
  ADMIN: { level: 100, name: 'Admin', color: '#e94560', permissions: ['all'] },
  PROFESSIONAL: { level: 50, name: 'Professional', color: '#667eea', permissions: ['view_own', 'book', 'train'] },
  APPRENTICE: { level: 30, name: 'Apprentice', color: '#ffc107', permissions: ['view_own', 'train'] },
  CLIENT_FACING: { level: 20, name: 'Client-Facing', color: '#4caf50', permissions: ['view_limited'] },
};

// Helper functions
export const getTotalModuleHours = (category) => {
  return TRAINING_CATEGORIES[category].modules.reduce((sum, m) => sum + m.hours, 0);
};

export const getModuleTypeIcon = (type) => {
  const icons = {
    video: '🎬',
    'hands-on': '🤲',
    quiz: '📝',
    assessment: '🎯',
  };
  return icons[type] || '📖';
};

