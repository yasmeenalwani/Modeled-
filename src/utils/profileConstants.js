/**
 * Profile Constants
 * All options, enums, and configuration for the Professional Profile page
 */

export const PRONOUNS_OPTIONS = [
  'she/her',
  'they/them',
  'he/him',
  'prefer not to say'
];

export const WORK_MODES = [
  { value: 'salon_employee', label: 'Salon Employee' },
  { value: 'booth_renter', label: 'Booth Renter' },
  { value: 'independent', label: 'Independent / On-location' },
];

export const WORK_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const HAIR_SPECIALTIES = [
  'Blonding',
  'Lived-in Color',
  'Reds',
  'Gray Coverage',
  'Short Cuts',
  'Curly/Textured',
  'Extensions',
  'Styling Only',
];

export const LANES = [
  'Glam',
  'Clean Girl',
  'Editorial',
  'Alt',
  'Retro',
  'Bridal',
  "Men's",
];

export const SERVICES = [
  'Haircuts',
  'Color',
  'Blowouts',
  'Extensions',
  'Styling',
  'Treatments',
];

export const SERVICE_COMFORT_LEVELS = [
  { value: 'love', label: 'Love', color: '#4caf50' },
  { value: 'ok', label: 'OK', color: '#ffc107' },
  { value: 'prefer_less', label: 'Prefer Less', color: '#ff9800' },
  { value: 'not_available', label: 'Not Available', color: '#f44336' },
];

export const NOT_AVAILABLE_OPTIONS = [
  'Kids Cuts',
  'Color Corrections',
  'Late Night Sessions',
  'Travel',
  'Minors',
];

export const DOCUMENT_TYPES = [
  'License',
  'Insurance',
  'Brand Certification',
  'Other',
];

export const TIERS = {
  APPRENTICE: 'apprentice',
  JUNIOR: 'junior',
  SENIOR: 'senior',
};

export const CERTIFICATION_UNLOCKS = {
  blowouts: {
    certified: [
      'Access to blowout campaigns',
      'Styling-only request matching',
      'Junior tier eligibility',
    ],
  },
  color: {
    certified: [
      'Access to color campaigns',
      'Advanced color request matching',
      'Senior tier eligibility (with other certs)',
    ],
  },
  haircuts: {
    certified: [
      'Access to cut campaigns',
      'Precision cut request matching',
      'Senior tier eligibility (with other certs)',
    ],
  },
};

export const BIO_CHARACTER_LIMIT = 250;
export const PORTFOLIO_TARGET_MIN = 9;
export const PORTFOLIO_TARGET_MAX = 12;

export const PHOTO_REQUIREMENTS = {
  maxSize: 15 * 1024 * 1024, // 15MB - onboarding/model/pro profile photos
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minDimensions: { width: 800, height: 800 },
  aspectRatio: 'square', // 1:1
};

export const DOCUMENT_EXPIRY_WARNING_DAYS = 30;

