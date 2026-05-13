// ============================================
// MOCK NOTIFICATIONS DATA
// ============================================
// Notifications created when matches are sent to models

export let mockNotifications = [
  // Notifications will be added here when matches are sent to models
];

// Helper to create a notification for a booking request
export function createBookingRequestNotification(match, request, professional, model) {
  const service = request.serviceType || 'service';
  const date = new Date(request.requestedDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const time = request.requestedTime || '';
  const proName = professional ? `${professional.firstName} ${professional.lastName}` : 'A professional';
  const salonName = professional?.salonName || '';
  
  // Calculate payment (would come from service pricing)
  const payment = request.modelPayment || 25; // Default fallback
  
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: model.userId || `user-${model.id}`,
    userType: 'model',
    type: 'match_opportunity',
    title: 'New Booking Opportunity! 🎯',
    message: `${proName}${salonName ? ` from ${salonName}` : ''} is looking for a model for ${service} on ${date} at ${time}. You'd earn $${payment}.`,
    read: false,
    createdAt: new Date().toISOString(),
    actions: [
      { label: 'View Details', action: 'view', primary: true },
      { label: 'Accept', action: 'accept', primary: true },
      { label: 'Decline', action: 'decline', primary: false },
    ],
    data: {
      matchId: match.id,
      requestId: request.id,
      professionalId: request.professionalId,
      serviceType: service,
      appointmentDate: request.requestedDate,
      appointmentTime: time,
      location: request.location,
      duration: request.duration,
      amount: payment,
      professionalName: proName,
      salonName: salonName,
      matchScore: match.matchScore,
    },
  };
  
  mockNotifications.push(notification);
  return notification;
}

// Get notifications for a user
export function getNotificationsForUser(userId) {
  return mockNotifications.filter(n => n.userId === userId);
}

// Get unread notifications for a user
export function getUnreadNotificationsForUser(userId) {
  return mockNotifications.filter(n => n.userId === userId && !n.read);
}

// Mark notification as read
export function markNotificationAsRead(notificationId) {
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    notification.readAt = new Date().toISOString();
    return notification;
  }
  return null;
}

// Get all notifications
export function getAllNotifications() {
  return mockNotifications;
}

