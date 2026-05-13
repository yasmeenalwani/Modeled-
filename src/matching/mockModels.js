// ============================================
// MOCK MODEL DATA WITH AGENTIC SCORES
// ============================================

export const mockModels = [
  {
    id: 1,
    firstName: 'Seraphina',
    lastName: 'Luna',
    email: 'seraphina.luna@email.com',
    phone: '(555) 123-4567',
    locationZip: '10001',
    
    // Hair Attributes
    hairLength: 'long',
    hairColor: 'blonde',
    hairDensity: 'medium',
    hairTexture: 'wavy',
    hairVolume: true,
    hairCurl: false,
    hairCondition: 'virgin',
    virginHair: true,
    
    // Physical
    eyeColor: 'blue',
    lightEyes: true,
    skinTone: 'fair',
    ageRange: '25-34',
    
    // Safety
    allergies: false,
    
    // Preferences
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    
    // Services (array format for matching)
    services: ['haircut', 'color', 'blowdry', 'gloss', 'highlights'],
    
    // Service preferences (boolean flags - matches ModelProfile schema)
    openToHaircut: true,
    openToColor: true,
    openToStyling: true, // blowdry/styling
    openToMakeup: false,
    openToNails: false,
    openToSkincare: false,
    
    // Availability (Education-style: neighborhoods + 30-min slots)
    availability: {
      monday: { neighborhoods: ['SoHo', 'Tribeca'], slots: ['9:00', '9:30', '10:00', '14:00', '15:00'] },
      tuesday: { neighborhoods: ['Brooklyn'], slots: ['10:00', '11:00', '14:00'] },
      wednesday: { neighborhoods: ['Upper East Side'], slots: ['9:00', '9:30', '10:00', '10:30', '11:00'] },
      friday: { neighborhoods: ['SoHo', 'West Village'], slots: ['9:00', '9:30', '10:00', '14:00', '15:00', '16:00'] },
    },
    somethingFun: 'Always trying new salons and looks',
    whatYouCareAbout: 'Healthy hair, natural-looking color',
    
    // Platform Stats
    totalBookings: 12,
    totalFeedbacks: 10,
    repeatBookings: 4,
    monthsOnPlatform: 8,
    servicesCompleted: ['haircut', 'blowdry', 'highlights', 'color'],
    lastActive: '2024-12-04',
    
    // Agentic Scores
    agenticScores: {
      reliability: 92,
      feedback: 88,
      experience: 75,
      engagement: 85,
      compatibility: 82,
    },
    
    // Status
    status: 'active',
    cardOnFileStatus: 'valid', // Required for matching
    identityVerified: true,
    profileCompleteness: 95,
    photoCount: 6,

    // Demo imagery for Model Focus / profile cards
    // These use generic hair-model stock photos purely for demo purposes.
    headshotUrl:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
    photoUrls: [
      'https://images.pexels.com/photos/461973/pexels-photo-461973.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1570230/pexels-photo-1570230.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1570230/pexels-photo-1570230.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
  },
  {
    id: 2,
    firstName: 'Sophia',
    lastName: 'Lee',
    email: 'sophia.l@email.com',
    phone: '(555) 234-5678',
    locationZip: '10002',
    
    hairLength: 'medium',
    hairColor: 'black',
    hairDensity: 'thick',
    hairTexture: 'straight',
    hairVolume: false,
    hairCurl: false,
    hairCondition: 'color_treated',
    virginHair: false,
    
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'medium',
    ageRange: '18-24',
    
    allergies: false,
    openToChange: false,
    experience: false,
    events: false,
    features: true,
    content: true,
    
    services: ['blowdry', 'gloss'],
    
    availability: {
      saturday: ['10am', '11am', '12pm', '1pm', '2pm'],
      sunday: ['11am', '12pm', '1pm'],
    },
    
    totalBookings: 2,
    totalFeedbacks: 2,
    repeatBookings: 0,
    monthsOnPlatform: 2,
    servicesCompleted: ['blowdry'],
    lastActive: '2024-12-03',
    
    agenticScores: {
      reliability: 50, // Not enough data
      feedback: 70,
      experience: 25,
      engagement: 60,
      compatibility: 50,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 70,
    photoCount: 3,
  },
  {
    id: 3,
    firstName: 'Olivia',
    lastName: 'Chen',
    email: 'olivia.c@email.com',
    phone: '(555) 345-6789',
    locationZip: '10003',
    
    hairLength: 'long',
    hairColor: 'dark_brown',
    hairDensity: 'medium',
    hairTexture: 'curly',
    hairVolume: true,
    hairCurl: true,
    hairCondition: 'damaged',
    virginHair: false,
    
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'olive',
    ageRange: '25-34',
    
    allergies: false,
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: false,
    
    services: ['haircut', 'color', 'blowdry', 'keratin'],
    
    availability: {
      monday: ['2pm', '3pm', '4pm'],
      wednesday: ['2pm', '3pm', '4pm'],
      thursday: ['10am', '11am', '2pm', '3pm'],
    },
    
    totalBookings: 8,
    totalFeedbacks: 7,
    repeatBookings: 2,
    monthsOnPlatform: 6,
    servicesCompleted: ['haircut', 'blowdry', 'keratin'],
    lastActive: '2024-12-05',
    
    agenticScores: {
      reliability: 78,
      feedback: 92,
      experience: 60,
      engagement: 88,
      compatibility: 75,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 90,
    photoCount: 5,
  },
  {
    id: 4,
    firstName: 'Ava',
    lastName: 'Martinez',
    email: 'ava.m@email.com',
    phone: '(555) 456-7890',
    locationZip: '10004',
    
    hairLength: 'short',
    hairColor: 'red',
    hairDensity: 'thin',
    hairTexture: 'wavy',
    hairVolume: false,
    hairCurl: false,
    hairCondition: 'healthy',
    virginHair: false,
    
    eyeColor: 'green',
    lightEyes: true,
    skinTone: 'light',
    ageRange: '35-44',
    
    allergies: false,
    openToChange: true,
    experience: true,
    events: false,
    features: false,
    content: false,
    
    services: ['haircut', 'blowdry', 'gloss'],
    
    availability: {
      tuesday: ['9am', '10am', '11am'],
      thursday: ['9am', '10am', '11am'],
      friday: ['9am', '10am'],
    },
    
    totalBookings: 18,
    totalFeedbacks: 15,
    repeatBookings: 6,
    monthsOnPlatform: 14,
    servicesCompleted: ['haircut', 'blowdry', 'gloss', 'color'],
    lastActive: '2024-12-04',
    
    agenticScores: {
      reliability: 95,
      feedback: 94,
      experience: 88,
      engagement: 75,
      compatibility: 90,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 85,
    photoCount: 4,
  },
  {
    id: 5,
    firstName: 'Isabella',
    lastName: 'Brown',
    email: 'isabella.b@email.com',
    phone: '(555) 567-8901',
    locationZip: '10001',
    
    hairLength: 'extra_long',
    hairColor: 'blonde',
    hairDensity: 'thick',
    hairTexture: 'straight',
    hairVolume: true,
    hairCurl: false,
    hairCondition: 'virgin',
    virginHair: true,
    
    eyeColor: 'hazel',
    lightEyes: true,
    skinTone: 'fair',
    ageRange: '18-24',
    
    allergies: false,
    openToChange: true,
    experience: false,
    events: true,
    features: true,
    content: true,
    
    services: ['haircut', 'color', 'blowdry', 'gloss', 'highlights', 'keratin'],
    
    availability: {
      monday: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
      tuesday: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
      wednesday: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
      thursday: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
      friday: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'],
    },
    
    totalBookings: 5,
    totalFeedbacks: 4,
    repeatBookings: 1,
    monthsOnPlatform: 3,
    servicesCompleted: ['blowdry', 'gloss', 'highlights'],
    lastActive: '2024-12-05',
    
    agenticScores: {
      reliability: 85,
      feedback: 90,
      experience: 45,
      engagement: 98, // Very engaged new user
      compatibility: 70,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 100,
    photoCount: 8,
  },
  {
    id: 6,
    firstName: 'Charlotte',
    lastName: 'Davis',
    email: 'charlotte.d@email.com',
    phone: '(555) 678-9012',
    locationZip: '10005',
    
    hairLength: 'long',
    hairColor: 'light_brown',
    hairDensity: 'medium',
    hairTexture: 'curly',
    hairVolume: true,
    hairCurl: true,
    hairCondition: 'color_treated',
    virginHair: false,
    
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'tan',
    ageRange: '25-34',
    
    allergies: true, // HAS ALLERGIES - dealbreaker for some services
    openToChange: false,
    experience: true,
    events: false,
    features: false,
    content: false,
    
    services: ['haircut', 'blowdry'], // Limited services due to allergies
    
    availability: {
      wednesday: ['10am', '11am'],
      saturday: ['9am', '10am', '11am', '12pm'],
    },
    
    totalBookings: 6,
    totalFeedbacks: 5,
    repeatBookings: 1,
    monthsOnPlatform: 5,
    servicesCompleted: ['haircut', 'blowdry'],
    lastActive: '2024-12-01',
    
    agenticScores: {
      reliability: 72,
      feedback: 80,
      experience: 52,
      engagement: 55,
      compatibility: 65,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 75,
    photoCount: 3,
  },
  {
    id: 7,
    firstName: 'Mia',
    lastName: 'Wilson',
    email: 'mia.w@email.com',
    phone: '(555) 789-0123',
    locationZip: '10002',
    
    hairLength: 'medium',
    hairColor: 'blonde',
    hairDensity: 'medium',
    hairTexture: 'wavy',
    hairVolume: false,
    hairCurl: false,
    hairCondition: 'healthy',
    virginHair: false,
    
    eyeColor: 'blue',
    lightEyes: true,
    skinTone: 'light',
    ageRange: '18-24',
    
    allergies: false,
    openToChange: true,
    experience: false,
    events: true,
    features: true,
    content: true,
    
    services: ['haircut', 'color', 'blowdry', 'gloss', 'highlights'],
    
    availability: {
      monday: ['10am', '11am', '2pm', '3pm'],
      tuesday: ['10am', '11am', '2pm', '3pm'],
      friday: ['9am', '10am', '11am'],
      saturday: ['10am', '11am', '12pm', '1pm'],
    },
    
    totalBookings: 3,
    totalFeedbacks: 3,
    repeatBookings: 0,
    monthsOnPlatform: 2,
    servicesCompleted: ['blowdry', 'gloss'],
    lastActive: '2024-12-04',
    
    agenticScores: {
      reliability: 88,
      feedback: 95,
      experience: 35,
      engagement: 80,
      compatibility: 60,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 88,
    photoCount: 5,
  },
  {
    id: 8,
    firstName: 'Harper',
    lastName: 'Taylor',
    email: 'harper.t@email.com',
    phone: '(555) 890-1234',
    locationZip: '10001',
    
    hairLength: 'long',
    hairColor: 'dark_brown',
    hairDensity: 'thick',
    hairTexture: 'coily',
    hairVolume: true,
    hairCurl: true,
    hairCondition: 'healthy',
    virginHair: true,
    
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'brown',
    ageRange: '25-34',
    
    allergies: false,
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    
    services: ['haircut', 'blowdry', 'keratin'],
    
    availability: {
      monday: ['9am', '10am', '11am'],
      wednesday: ['9am', '10am', '11am', '2pm', '3pm'],
      friday: ['2pm', '3pm', '4pm'],
    },
    
    totalBookings: 22,
    totalFeedbacks: 20,
    repeatBookings: 8,
    monthsOnPlatform: 18,
    servicesCompleted: ['haircut', 'blowdry', 'keratin', 'gloss'],
    lastActive: '2024-12-05',
    
    agenticScores: {
      reliability: 98,
      feedback: 96,
      experience: 92,
      engagement: 90,
      compatibility: 95,
    },
    
    status: 'active',
    cardOnFileStatus: 'valid',
    profileCompleteness: 100,
    photoCount: 10,
  },
];

// Get model by ID
export const getModelById = (id) => mockModels.find(m => m.id === id);

// Get models by status
export const getModelsByStatus = (status) => mockModels.filter(m => m.status === status);

// Get top performers (by agentic score average)
export const getTopPerformers = (limit = 5) => {
  return [...mockModels]
    .map(m => ({
      ...m,
      avgAgenticScore: Math.round(
        Object.values(m.agenticScores).reduce((a, b) => a + b, 0) / 5
      ),
    }))
    .sort((a, b) => b.avgAgenticScore - a.avgAgenticScore)
    .slice(0, limit);
};

