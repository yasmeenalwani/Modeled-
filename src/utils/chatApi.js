// ============================================
// CHAT API UTILITIES - AppSync GraphQL
// ============================================

import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';

const client = generateClient();

/**
 * Get or create a conversation with admin
 * @param {string} userId - Current user's ID
 * @param {string} userType - 'model', 'professional', or 'partner'
 * @param {string} channelId - Optional channel ID (e.g., 'pre_booking', 'with_modeled')
 * @returns {Promise<object>} Conversation object
 */
export async function getOrCreateConversation(userId, userType, channelId = 'with_modeled') {
  try {
    // First, try to find existing active conversation for this channel
    const { data: existing } = await client.models.Conversation.list({
      filter: {
        participant1Id: { eq: userId },
        participant1Type: { eq: userType },
        status: { eq: 'active' },
      },
      limit: 100, // Get more to filter by channel
    });

    // Filter by channelId if provided (stored in subject or metadata)
    const channelConversation = existing?.find(conv => 
      conv.subject === channelId || 
      conv.metadata?.channelId === channelId ||
      (!channelId && !conv.subject && !conv.metadata?.channelId) // Default channel
    );

    if (channelConversation) {
      return channelConversation;
    }

    // Create new conversation with channel info
    const { data: newConversation } = await client.models.Conversation.create({
      participant1Id: userId,
      participant1Type: userType,
      participant2Id: 'admin', // Admin user ID
      participant2Type: 'admin',
      status: 'active',
      unreadCount: 0,
      unreadBy: [],
      subject: channelId, // Store channel ID in subject field
      metadata: { channelId }, // Also store in metadata if available
    });

    return newConversation;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations for admin
 * @param {object} filters - Optional filters { status, userType, search }
 * @returns {Promise<Array>}
 */
export async function getAdminConversations(filters = {}) {
  try {
    let conversations = [];
    
    // Get all conversations (admin can see all)
    const { data } = await client.models.Conversation.list({
      limit: 100,
    });
    
    conversations = data || [];
    
    // Apply filters
    if (filters.status) {
      conversations = conversations.filter(c => c.status === filters.status);
    }
    
    if (filters.userType) {
      conversations = conversations.filter(c => c.participant1Type === filters.userType);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      conversations = conversations.filter(c => 
        c.lastMessagePreview?.toLowerCase().includes(searchLower) ||
        c.subject?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by last message time (newest first)
    conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
      return timeB - timeA;
    });
    
    return conversations;
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 * @param {string} conversationId
 * @param {number} limit - Number of messages to fetch
 * @param {string} nextToken - Pagination token
 * @returns {Promise<{messages: Array, nextToken: string}>}
 */
export async function getMessages(conversationId, limit = 50, nextToken = null) {
  try {
    // In real implementation, you'd query by conversationId
    // For now, using list and filtering
    const { data: allMessages } = await client.models.Message.list({
      limit: limit * 2, // Fetch more to filter
    });
    
    // Filter by conversationId
    let messages = (allMessages || []).filter(m => m.conversationId === conversationId);
    
    // Sort by createdAt (oldest first for chat view)
    messages.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
    
    // Take last N messages
    messages = messages.slice(-limit);
    
    return {
      messages,
      nextToken: null, // Simplified for now
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Send a message
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} senderType
 * @param {string} senderName
 * @param {string} content
 * @param {Array} attachments - Optional S3 keys
 * @returns {Promise<object>} Created message
 */
export async function sendMessage({
  conversationId,
  senderId,
  senderType,
  senderName,
  content,
  attachments = [],
  messageType = 'text',
}) {
  try {
    // Check for FAQ match (simple keyword matching for now)
    const faqResponse = await checkFAQMatch(content);
    
    // Create message
    const { data: message } = await client.models.Message.create({
      conversationId,
      senderId,
      senderType,
      senderName,
      content,
      messageType,
      attachments,
      isAutoResponse: false,
      read: false,
    });
    
    // Update conversation
    await client.models.Conversation.update({
      id: conversationId,
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: content.substring(0, 100),
      lastMessageSenderId: senderId,
      updatedAt: new Date().toISOString(),
    });
    
    // If FAQ match found, send auto-response
    if (faqResponse) {
      await sendAutoResponse(conversationId, faqResponse, senderId);
    }
    
    // Send notification to admin (if user sent message)
    if (senderType !== 'admin') {
      await createNotification({
        userId: 'admin',
        userType: 'admin',
        type: 'new_message',
        title: 'New Message 💬',
        message: `${senderName} sent a message: ${content.substring(0, 50)}...`,
        link: `/admin/chat/${conversationId}`,
        actionText: 'View Chat',
        relatedEntityId: conversationId,
        data: { conversationId, senderId, senderType },
      });
    }
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Check if message matches FAQ and return response
 * @param {string} message
 * @returns {Promise<object|null>} FAQ response or null
 */
async function checkFAQMatch(message) {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword matching (can be enhanced with AI later)
  const faqMatches = [
    {
      keywords: ['payment', 'pay', 'fee', 'cost', 'price', 'charge'],
      response: 'Payment questions? Our standard fees are: Model fee (varies by service), Professional fee (17% of service price). All payments are processed securely through our platform. Need more details?',
      category: 'billing',
    },
    {
      keywords: ['booking', 'appointment', 'schedule', 'cancel', 'reschedule'],
      response: 'Booking help: You can view and manage your bookings in your portal calendar. To cancel or reschedule, contact us at least 24 hours in advance. Need immediate help?',
      category: 'booking',
    },
    {
      keywords: ['profile', 'photo', 'picture', 'update', 'change'],
      response: 'Profile updates: You can update your photos and profile information in your portal under "My Profile". Photos are reviewed within 24-48 hours.',
      category: 'profile',
    },
    {
      keywords: ['match', 'matching', 'request', 'opportunity'],
      response: 'Matching process: Our algorithm matches you based on your profile, availability, and service preferences. You\'ll receive notifications when matches are found!',
      category: 'matching',
    },
    {
      keywords: ['training', 'hours', 'certification', 'complete'],
      response: 'Training hours: Complete your session, upload photos, and submit feedback to log training hours. Hours are tracked automatically in your training portal.',
      category: 'training',
    },
  ];
  
  for (const faq of faqMatches) {
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        content: faq.response,
        category: faq.category,
        confidence: 0.7, // Simple matching = lower confidence
      };
    }
  }
  
  return null;
}

/**
 * Send automated FAQ response
 * @param {string} conversationId
 * @param {object} faqResponse
 * @param {string} originalSenderId
 */
async function sendAutoResponse(conversationId, faqResponse, originalSenderId) {
  try {
    // Create auto-response message
    await client.models.Message.create({
      conversationId,
      senderId: 'admin',
      senderType: 'admin',
      senderName: 'Modeled Management',
      content: `💡 ${faqResponse.content}\n\n_This is an automated response. If you need more help, I'll respond shortly!_`,
      messageType: 'faq_suggestion',
      isAutoResponse: true,
      faqMatch: faqResponse.category,
      read: false,
    });
    
    // Update conversation
    await client.models.Conversation.update({
      id: conversationId,
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: faqResponse.content.substring(0, 100),
      lastMessageSenderId: 'admin',
      updatedAt: new Date().toISOString(),
    });
    
    // Notify user of response
    await createNotification({
      userId: originalSenderId,
      userType: 'model', // Will need to determine from conversation
      type: 'message_received',
      title: 'Response from Modeled Management 💬',
      message: 'We\'ve sent you a response. Check your messages!',
      link: `/model-portal/chat`,
      actionText: 'View Message',
      relatedEntityId: conversationId,
    });
  } catch (error) {
    console.error('Error sending auto-response:', error);
    // Don't throw - auto-response failure shouldn't break message sending
  }
}

/**
 * Mark messages as read
 * @param {string} conversationId
 * @param {string} userId
 */
export async function markMessagesAsRead(conversationId, userId) {
  try {
    // Get unread messages
    const { data: messages } = await client.models.Message.list({
      filter: {
        conversationId: { eq: conversationId },
        read: { eq: false },
        senderId: { ne: userId }, // Not sent by this user
      },
    });
    
    // Mark as read
    for (const message of messages || []) {
      await client.models.Message.update({
        id: message.id,
        read: true,
        readAt: new Date().toISOString(),
      });
    }
    
    // Update conversation unread count
    const { data: conversation } = await client.models.Conversation.get({ id: conversationId });
    if (conversation) {
      await client.models.Conversation.update({
        id: conversationId,
        unreadCount: 0,
        unreadBy: (conversation.unreadBy || []).filter(id => id !== userId),
      });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Get unread count for a user
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  try {
    const { data: conversations } = await client.models.Conversation.list({
      filter: {
        participant1Id: { eq: userId },
        status: { eq: 'active' },
      },
    });
    
    const totalUnread = (conversations || []).reduce((sum, conv) => {
      return sum + (conv.unreadCount || 0);
    }, 0);
    
    return totalUnread;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Archive a conversation
 * @param {string} conversationId
 */
export async function archiveConversation(conversationId) {
  try {
    await client.models.Conversation.update({
      id: conversationId,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
}

/**
 * Resolve a conversation
 * @param {string} conversationId
 */
export async function resolveConversation(conversationId) {
  try {
    await client.models.Conversation.update({
      id: conversationId,
      status: 'resolved',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resolving conversation:', error);
    throw error;
  }
}

