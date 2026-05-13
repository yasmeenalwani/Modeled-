// ============================================
// CHAT TIMING CONFIGURATION
// Defines response time expectations for different chat channels
// ============================================

export const CHAT_CHANNELS = {
  // 24-hour response time channels
  PRE_BOOKING: {
    id: 'pre_booking',
    label: 'Pre-Booking Support',
    icon: '',
    responseTime: 24, // hours
    responseTimeLabel: '24 hours',
    description: 'Questions about booking, availability, or services',
    available: true,
  },
  WITH_MODELED: {
    id: 'with_modeled',
    label: 'Modeled Management',
    icon: '',
    responseTime: 24, // hours
    responseTimeLabel: '24 hours',
    description: 'General support and assistance from Modeled team',
    available: true,
  },
  WITH_MODEL: {
    id: 'with_model',
    label: 'Model Communication',
    icon: '',
    responseTime: 24, // hours
    responseTimeLabel: '24 hours',
    description: 'Direct communication with models',
    available: true,
  },
  
  // 1-hour response time channel
  PRO_X_MODEL: {
    id: 'pro_x_model',
    label: 'Pro ↔ Model Chat',
    icon: '',
    responseTime: 1, // hour
    responseTimeLabel: '1 hour',
    description: 'Direct chat between professional and model (active 1hr before/after appointment)',
    available: false, // Only active during appointment window
    activeWindow: {
      before: 60, // minutes before appointment
      after: 60, // minutes after appointment
    },
  },
  
  // 24/7 channels
  REGULAR_CONTACT: {
    id: 'regular_contact',
    label: 'Regular Contact',
    icon: '',
    responseTime: 0, // 24/7
    responseTimeLabel: '24/7',
    description: 'Always available for urgent matters',
    available: true,
    is24_7: true,
  },
  SUPPORT_EMAIL: {
    id: 'support_email',
    label: 'hello@modeled.com',
    icon: '',
    responseTime: 0, // 24/7
    responseTimeLabel: '24/7',
    description: 'Email support - always available',
    available: true,
    is24_7: true,
    email: 'hello@modeled.com',
  },
};

// Get chat channel by ID
export const getChatChannel = (channelId) => {
  return Object.values(CHAT_CHANNELS).find(ch => ch.id === channelId);
};

// Check if a chat channel is currently available
export const isChannelAvailable = (channelId, appointmentDateTime = null) => {
  const channel = getChatChannel(channelId);
  if (!channel) return false;
  
  // 24/7 channels are always available
  if (channel.is24_7) return true;
  
  // Regular channels are available if marked as such
  if (channel.available && !channel.activeWindow) return true;
  
  // Pro x Model has specific time window
  if (channel.id === 'pro_x_model' && appointmentDateTime) {
    const appointment = new Date(appointmentDateTime);
    const now = new Date();
    const beforeWindow = new Date(appointment.getTime() - channel.activeWindow.before * 60 * 1000);
    const afterWindow = new Date(appointment.getTime() + channel.activeWindow.after * 60 * 1000);
    
    return now >= beforeWindow && now <= afterWindow;
  }
  
  return channel.available || false;
};

// Get response time message for a channel
export const getResponseTimeMessage = (channelId, appointmentDateTime = null) => {
  const channel = getChatChannel(channelId);
  if (!channel) return 'Response time varies';
  
  if (channel.is24_7) {
    return 'Available 24/7 - We respond immediately';
  }
  
  if (channel.id === 'pro_x_model' && appointmentDateTime) {
    const appointment = new Date(appointmentDateTime);
    const now = new Date();
    const beforeWindow = new Date(appointment.getTime() - channel.activeWindow.before * 60 * 1000);
    const afterWindow = new Date(appointment.getTime() + channel.activeWindow.after * 60 * 1000);
    
    if (now < beforeWindow) {
      const hoursUntil = Math.ceil((beforeWindow - now) / (1000 * 60 * 60));
      return `Chat opens in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
    }
    
    if (now > afterWindow) {
      return 'Chat window has closed';
    }
    
    return `Active now - ${channel.responseTimeLabel} response time`;
  }
  
  return `Expected response: ${channel.responseTimeLabel}`;
};

// Calculate time until response deadline
export const getTimeUntilResponse = (channelId, lastMessageTime) => {
  const channel = getChatChannel(channelId);
  if (!channel || !lastMessageTime || channel.is24_7) return null;
  
  const lastMessage = new Date(lastMessageTime);
  const now = new Date();
  const responseDeadline = new Date(lastMessage.getTime() + channel.responseTime * 60 * 60 * 1000);
  const timeRemaining = responseDeadline - now;
  
  if (timeRemaining <= 0) return { overdue: true, message: 'Response overdue' };
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return { hours, minutes, message: `Response expected within ${hours}h ${minutes}m` };
  }
  
  return { minutes, message: `Response expected within ${minutes}m` };
};

// Format response time status
export const formatResponseStatus = (channelId, lastMessageTime, appointmentDateTime = null) => {
  const channel = getChatChannel(channelId);
  if (!channel) return { status: 'unknown', message: 'Unknown status' };
  
  if (channel.is24_7) {
    return {
      status: 'available',
      message: 'Available 24/7',
      icon: '',
    };
  }
  
  if (channel.id === 'pro_x_model' && appointmentDateTime) {
    const isAvailable = isChannelAvailable(channelId, appointmentDateTime);
    if (!isAvailable) {
      return {
        status: 'pending',
        message: getResponseTimeMessage(channelId, appointmentDateTime),
        icon: '',
      };
    }
  }
  
  if (lastMessageTime) {
    const timeUntil = getTimeUntilResponse(channelId, lastMessageTime);
    if (timeUntil?.overdue) {
      return {
        status: 'overdue',
        message: timeUntil.message,
        icon: '',
      };
    }
    
    if (timeUntil) {
      return {
        status: 'pending',
        message: timeUntil.message,
        icon: '',
      };
    }
  }
  
  return {
    status: 'available',
    message: getResponseTimeMessage(channelId, appointmentDateTime),
    icon: '',
  };
};

// Get all available channels for a user type
export const getAvailableChannels = (userType, appointmentDateTime = null) => {
  const allChannels = Object.values(CHAT_CHANNELS);
  
  return allChannels.filter(channel => {
    // Filter based on user type if needed
    if (channel.id === 'pro_x_model') {
      return isChannelAvailable(channel.id, appointmentDateTime);
    }
    
    return channel.available || channel.is24_7;
  });
};

