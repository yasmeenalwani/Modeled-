// ============================================
// MOCK PROFESSIONALS WITH ONBOARDING & TRAINING DATA
// ============================================

import { PROFESSIONAL_STATUS, ONBOARDING_STEPS, TRAINING_CATEGORIES } from './training';

export const mockProfessionals = [
  {
    id: 'pro-1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.m@luxestudio.com',
    phone: '(555) 111-2222',
    salon: 'Luxe Studio',
    role: 'PROFESSIONAL',
    status: PROFESSIONAL_STATUS.ACTIVE,
    joinedDate: '2024-06-15',
    
    // Profile
    profilePhoto: null,
    bio: 'Passionate colorist with 5 years of experience specializing in balayage and dimensional color.',
    instagram: '@sarahm_hair',
    portfolio: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    
    // Verification
    idVerified: true,
    licenseVerified: true,
    backgroundCheckCleared: true,
    documentsComplete: true,
    
    // Onboarding Progress (all complete)
    onboardingProgress: {
      profile: { completed: true, completedAt: '2024-06-16', tasksComplete: 5, totalTasks: 5 },
      verification: { completed: true, completedAt: '2024-06-18', tasksComplete: 5, totalTasks: 5 },
      documents: { completed: true, completedAt: '2024-06-19', tasksComplete: 5, totalTasks: 5 },
      training: { completed: true, completedAt: '2024-06-22', tasksComplete: 5, totalTasks: 5 },
      assessment: { completed: true, completedAt: '2024-06-23', tasksComplete: 5, totalTasks: 5 },
      approval: { completed: true, completedAt: '2024-06-25', tasksComplete: 4, totalTasks: 4 },
    },
    onboardingComplete: true,
    onboardingCompletedAt: '2024-06-25',
    
    // Training Progress
    trainingProgress: {
      blowouts: { hoursCompleted: 250, modulesCompleted: 10, totalModules: 10, certified: true, certifiedAt: '2024-08-15' },
      haircuts: { hoursCompleted: 180, modulesCompleted: 7, totalModules: 10, certified: false },
      color: { hoursCompleted: 300, modulesCompleted: 10, totalModules: 10, certified: true, certifiedAt: '2024-09-20' },
    },
    totalTrainingHours: 730,
    specializations: ['color', 'blowouts'],
    
    // Stats
    totalBookings: 45,
    avgRating: 4.9,
    modelRequestsSubmitted: 28,
  },
  {
    id: 'pro-2',
    firstName: 'Mike',
    lastName: 'Thompson',
    email: 'mike.t@cutcollective.com',
    phone: '(555) 222-3333',
    salon: 'The Cut Collective',
    role: 'PROFESSIONAL',
    status: PROFESSIONAL_STATUS.IN_TRAINING,
    joinedDate: '2024-10-01',
    
    profilePhoto: null,
    bio: 'Aspiring stylist focused on precision cutting and men\'s grooming.',
    instagram: '@mike_cuts',
    portfolio: ['photo1.jpg', 'photo2.jpg'],
    
    idVerified: true,
    licenseVerified: true,
    backgroundCheckCleared: true,
    documentsComplete: true,
    
    onboardingProgress: {
      profile: { completed: true, completedAt: '2024-10-02', tasksComplete: 5, totalTasks: 5 },
      verification: { completed: true, completedAt: '2024-10-05', tasksComplete: 5, totalTasks: 5 },
      documents: { completed: true, completedAt: '2024-10-06', tasksComplete: 5, totalTasks: 5 },
      training: { completed: true, completedAt: '2024-10-10', tasksComplete: 5, totalTasks: 5 },
      assessment: { completed: true, completedAt: '2024-10-12', tasksComplete: 5, totalTasks: 5 },
      approval: { completed: true, completedAt: '2024-10-15', tasksComplete: 4, totalTasks: 4 },
    },
    onboardingComplete: true,
    onboardingCompletedAt: '2024-10-15',
    
    trainingProgress: {
      blowouts: { hoursCompleted: 120, modulesCompleted: 5, totalModules: 10, certified: false },
      haircuts: { hoursCompleted: 200, modulesCompleted: 8, totalModules: 10, certified: false },
      color: { hoursCompleted: 45, modulesCompleted: 2, totalModules: 10, certified: false },
    },
    totalTrainingHours: 365,
    specializations: ['haircuts'],
    
    totalBookings: 12,
    avgRating: 4.6,
    modelRequestsSubmitted: 8,
  },
  {
    id: 'pro-3',
    firstName: 'Lisa',
    lastName: 'Kim',
    email: 'lisa.k@colortheory.com',
    phone: '(555) 333-4444',
    salon: 'Color Theory',
    role: 'PROFESSIONAL',
    status: PROFESSIONAL_STATUS.ACTIVE,
    joinedDate: '2024-04-10',
    
    profilePhoto: null,
    bio: 'Color specialist with expertise in vivid colors and corrective work.',
    instagram: '@lisakim_color',
    portfolio: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'],
    
    idVerified: true,
    licenseVerified: true,
    backgroundCheckCleared: true,
    documentsComplete: true,
    
    onboardingProgress: {
      profile: { completed: true, completedAt: '2024-04-11', tasksComplete: 5, totalTasks: 5 },
      verification: { completed: true, completedAt: '2024-04-14', tasksComplete: 5, totalTasks: 5 },
      documents: { completed: true, completedAt: '2024-04-15', tasksComplete: 5, totalTasks: 5 },
      training: { completed: true, completedAt: '2024-04-18', tasksComplete: 5, totalTasks: 5 },
      assessment: { completed: true, completedAt: '2024-04-20', tasksComplete: 5, totalTasks: 5 },
      approval: { completed: true, completedAt: '2024-04-22', tasksComplete: 4, totalTasks: 4 },
    },
    onboardingComplete: true,
    onboardingCompletedAt: '2024-04-22',
    
    trainingProgress: {
      blowouts: { hoursCompleted: 250, modulesCompleted: 10, totalModules: 10, certified: true, certifiedAt: '2024-06-01' },
      haircuts: { hoursCompleted: 250, modulesCompleted: 10, totalModules: 10, certified: true, certifiedAt: '2024-07-15' },
      color: { hoursCompleted: 300, modulesCompleted: 10, totalModules: 10, certified: true, certifiedAt: '2024-09-01' },
    },
    totalTrainingHours: 800,
    specializations: ['color', 'haircuts', 'blowouts'],
    
    totalBookings: 78,
    avgRating: 5.0,
    modelRequestsSubmitted: 52,
  },
  {
    id: 'pro-4',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.w@modernmane.com',
    phone: '(555) 444-5555',
    salon: 'Modern Mane',
    role: 'APPRENTICE',
    status: PROFESSIONAL_STATUS.IN_ONBOARDING,
    joinedDate: '2024-11-20',
    
    profilePhoto: null,
    bio: 'Recent cosmetology graduate eager to build skills.',
    instagram: '@james_styles',
    portfolio: ['photo1.jpg'],
    
    idVerified: true,
    licenseVerified: false, // Still pending
    backgroundCheckCleared: false, // In progress
    documentsComplete: false,
    
    onboardingProgress: {
      profile: { completed: true, completedAt: '2024-11-21', tasksComplete: 5, totalTasks: 5 },
      verification: { completed: false, tasksComplete: 2, totalTasks: 5 },
      documents: { completed: false, tasksComplete: 1, totalTasks: 5 },
      training: { completed: false, tasksComplete: 0, totalTasks: 5 },
      assessment: { completed: false, tasksComplete: 0, totalTasks: 5 },
      approval: { completed: false, tasksComplete: 0, totalTasks: 4 },
    },
    onboardingComplete: false,
    
    trainingProgress: {
      blowouts: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
      haircuts: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
      color: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
    },
    totalTrainingHours: 0,
    specializations: [],
    
    totalBookings: 0,
    avgRating: null,
    modelRequestsSubmitted: 0,
  },
  {
    id: 'pro-5',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.c@glowup.com',
    phone: '(555) 555-6666',
    salon: 'Glow Up Studio',
    role: 'PROFESSIONAL',
    status: PROFESSIONAL_STATUS.PENDING_VERIFICATION,
    joinedDate: '2024-12-01',
    
    profilePhoto: null,
    bio: 'Makeup artist transitioning into hair styling.',
    instagram: '@emily_glowup',
    portfolio: [],
    
    idVerified: false,
    licenseVerified: false,
    backgroundCheckCleared: false,
    documentsComplete: false,
    
    onboardingProgress: {
      profile: { completed: false, tasksComplete: 3, totalTasks: 5 },
      verification: { completed: false, tasksComplete: 0, totalTasks: 5 },
      documents: { completed: false, tasksComplete: 0, totalTasks: 5 },
      training: { completed: false, tasksComplete: 0, totalTasks: 5 },
      assessment: { completed: false, tasksComplete: 0, totalTasks: 5 },
      approval: { completed: false, tasksComplete: 0, totalTasks: 4 },
    },
    onboardingComplete: false,
    
    trainingProgress: {
      blowouts: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
      haircuts: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
      color: { hoursCompleted: 0, modulesCompleted: 0, totalModules: 10, certified: false },
    },
    totalTrainingHours: 0,
    specializations: [],
    
    totalBookings: 0,
    avgRating: null,
    modelRequestsSubmitted: 0,
  },
  {
    id: 'pro-6',
    firstName: 'David',
    lastName: 'Park',
    email: 'david.p@hairlab.com',
    phone: '(555) 666-7777',
    salon: 'The Hair Lab',
    role: 'PROFESSIONAL',
    status: PROFESSIONAL_STATUS.IN_TRAINING,
    joinedDate: '2024-09-15',
    
    profilePhoto: null,
    bio: 'Extension specialist and treatment expert.',
    instagram: '@david_hairlab',
    portfolio: ['photo1.jpg', 'photo2.jpg'],
    
    idVerified: true,
    licenseVerified: true,
    backgroundCheckCleared: true,
    documentsComplete: true,
    
    onboardingProgress: {
      profile: { completed: true, completedAt: '2024-09-16', tasksComplete: 5, totalTasks: 5 },
      verification: { completed: true, completedAt: '2024-09-20', tasksComplete: 5, totalTasks: 5 },
      documents: { completed: true, completedAt: '2024-09-22', tasksComplete: 5, totalTasks: 5 },
      training: { completed: true, completedAt: '2024-09-25', tasksComplete: 5, totalTasks: 5 },
      assessment: { completed: true, completedAt: '2024-09-28', tasksComplete: 5, totalTasks: 5 },
      approval: { completed: true, completedAt: '2024-10-01', tasksComplete: 4, totalTasks: 4 },
    },
    onboardingComplete: true,
    onboardingCompletedAt: '2024-10-01',
    
    trainingProgress: {
      blowouts: { hoursCompleted: 200, modulesCompleted: 8, totalModules: 10, certified: false },
      haircuts: { hoursCompleted: 100, modulesCompleted: 4, totalModules: 10, certified: false },
      color: { hoursCompleted: 150, modulesCompleted: 5, totalModules: 10, certified: false },
    },
    totalTrainingHours: 450,
    specializations: ['blowouts'],
    
    totalBookings: 22,
    avgRating: 4.7,
    modelRequestsSubmitted: 15,
  },
];

// Helper functions
export const getProfessionalById = (id) => mockProfessionals.find(p => p.id === id);

export const getProfessionalsByStatus = (status) => 
  mockProfessionals.filter(p => p.status === status);

export const getOnboardingProgress = (professional) => {
  const steps = Object.values(professional.onboardingProgress);
  const completed = steps.filter(s => s.completed).length;
  return Math.round((completed / steps.length) * 100);
};

export const getTrainingProgress = (professional) => {
  return Math.round((professional.totalTrainingHours / 800) * 100);
};

export const getProfessionalsNeedingAttention = () => {
  return mockProfessionals.filter(p => 
    p.status === PROFESSIONAL_STATUS.PENDING_VERIFICATION ||
    p.status === PROFESSIONAL_STATUS.IN_ONBOARDING ||
    !p.licenseVerified ||
    !p.backgroundCheckCleared
  );
};

