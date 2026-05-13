export const trainingCategories = [
  {
    id: 'blowouts',
    name: 'Blowouts & Styling',
    icon: '',
    color: '#e94560',
    completed: 0,
    total: 0,
    certified: false,
    modules: [
      { id: 1, name: 'Weeks 1-4: Prep + Tools + Sectioning', type: 'in_person', hours: 13, completed: 0, status: 'in_progress', signoffStatus: 'pending' },
      { id: 2, name: 'Weeks 5-8: Speed + Control', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 3, name: 'Weeks 9-16: Live Model Reps', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 4, name: 'Weeks 17-24: Consistency + Finishing', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
    ],
  },
  {
    id: 'haircuts',
    name: 'Haircuts',
    icon: '',
    color: '#667eea',
    completed: 0,
    total: 0,
    certified: false,
    modules: [
      { id: 1, name: 'Weeks 1-4: Core Cutting Shapes', type: 'in_person', hours: 13, completed: 0, status: 'in_progress', signoffStatus: 'pending' },
      { id: 2, name: 'Weeks 5-8: Sectioning + Control', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 3, name: 'Weeks 9-16: Live Model Reps', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 4, name: 'Weeks 17-24: Consistency + Finishing', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    icon: '',
    color: '#4caf50',
    completed: 0,
    total: 0,
    certified: false,
    modules: [
      { id: 1, name: 'Weeks 1-4: Formulation + Consultations', type: 'in_person', hours: 13, completed: 0, status: 'in_progress', signoffStatus: 'pending' },
      { id: 2, name: 'Weeks 5-8: Application + Timing', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 3, name: 'Weeks 9-16: Live Model Reps', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
      { id: 4, name: 'Weeks 17-24: Consistency + Finishing', type: 'in_person', hours: 13, completed: 0, status: 'locked', signoffStatus: 'pending' },
    ],
  },
];

export const practiceFocusTargets = [
  { id: 'blowouts', label: 'Blowouts', weeklyTarget: 2, months: 6 },
  { id: 'haircuts', label: 'Cuts', weeklyTarget: 2, months: 6 },
  { id: 'color', label: 'Color', weeklyTarget: 2, months: 6 },
];

export function getTrainingSummary(categories = trainingCategories) {
  const totalCompleted = categories.reduce((sum, c) => sum + (c.completed || 0), 0);
  const totalHours = categories.reduce((sum, c) => sum + (c.total || 0), 0);
  const videoCredits = 0;
  const handsOnHours = totalCompleted;
  const trainingProgress = categories.reduce((acc, c) => {
    acc[c.id] = {
      completed: c.completed || 0,
      total: c.total || 0,
      certified: !!c.certified,
      nextStep: c.certified ? 'Maintain certification' : 'Complete remaining modules',
    };
    return acc;
  }, {});
  const learningScore = totalHours > 0 ? Math.round((totalCompleted / totalHours) * 100) : 0;

  return {
    totalCompleted,
    totalHours,
    videoCredits,
    handsOnHours,
    trainingProgress,
    learningScore,
  };
}

export function mapServiceToFocus(serviceType = '') {
  const normalized = serviceType.toLowerCase();
  if (normalized.includes('blow')) return 'blowouts';
  if (normalized.includes('cut')) return 'haircuts';
  if (normalized.includes('color') || normalized.includes('highlight')) return 'color';
  return 'blowouts';
}
