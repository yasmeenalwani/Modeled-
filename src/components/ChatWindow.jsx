import React, { useState, useEffect, useRef } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { 
  getOrCreateConversation, 
  getMessages, 
  sendMessage,
  markMessagesAsRead,
} from '../utils/chatApi';
import { 
  CHAT_CHANNELS, 
  isChannelAvailable,
} from '../utils/chatTiming';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    background: 'rgba(139, 30, 63, 0.15)',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  timingBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  timingBadgeAvailable: {
    background: 'rgba(76, 175, 80, 0.15)',
    color: '#4caf50',
  },
  timingBadgePending: {
    background: 'rgba(255, 193, 7, 0.15)',
    color: '#ffc107',
  },
  timingBadgeOverdue: {
    background: 'rgba(248, 81, 73, 0.15)',
    color: '#f85149',
  },
  channelSelector: {
    marginBottom: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  channelSelectorLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  channelButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  channelButton: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  channelButtonActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    display: 'flex',
    gap: '0.75rem',
    maxWidth: '80%',
  },
  messageOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    flexShrink: 0,
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  messageBubble: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  messageBubbleOwn: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    color: '#FFFEF9', // Ivory
    borderBottomRightRadius: '4px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageBubbleOther: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#4A2A1A', // Darker rich espresso brown
    borderBottomLeftRadius: '4px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageBubbleAuto: {
    background: 'rgba(139, 30, 63, 0.15)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageInfo: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    padding: '0 0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageTime: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inputContainer: {
    padding: '1rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
  },
  inputForm: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Darker rich espresso brown
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  faqBadge: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.2rem 0.5rem',
    background: 'rgba(139, 30, 63, 0.15)',
    color: '#8B1E3F', // Cherry
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ChatWindow({ 
  userType = 'model', 
  channelId = 'with_modeled',
  appointmentDateTime = null,
  showChannelSelector = true,
  quickReplies = [],
}) {
  const { user } = useAuthenticator();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(channelId);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const currentChannel = Object.values(CHAT_CHANNELS).find(ch => ch.id === selectedChannel) ||
                         CHAT_CHANNELS.WITH_MODELED;

  const userId = user?.userId || user?.username || 'user-123';
  const userName = user?.signInDetails?.loginId || 'User';

  useEffect(() => {
    loadConversation();
  }, [userId, userType]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      subscribeToMessages();
      markAsRead();
    }
  }, [conversation]);
  
  
  const getAvailableChannelsForUser = () => {
    const available = [];

    if (userType === 'model') {
      available.push(CHAT_CHANNELS.WITH_MODELED);
      if (isChannelAvailable(CHAT_CHANNELS.PRO_X_MODEL.id, appointmentDateTime)) {
        available.push(CHAT_CHANNELS.PRO_X_MODEL);
      }
      available.push(CHAT_CHANNELS.SUPPORT_EMAIL);
    }

    if (userType === 'professional') {
      if (isChannelAvailable(CHAT_CHANNELS.PRO_X_MODEL.id, appointmentDateTime)) {
        available.push(CHAT_CHANNELS.PRO_X_MODEL);
      }
      available.push(CHAT_CHANNELS.SUPPORT_EMAIL);
    }

    return available;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      // Include channel ID in conversation creation
      const conv = await getOrCreateConversation(userId, userType, selectedChannel);
      setConversation(conv);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedChannel) {
      loadConversation();
    }
  }, [selectedChannel]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      const { messages: loadedMessages } = await getMessages(conversation.id);
      setMessages(loadedMessages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = async () => {
    if (!conversation || subscribed) return;
    
    try {
      // Subscribe to new messages using AppSync subscriptions
      const subscription = client.models.Message.observeQuery({
        filter: { conversationId: { eq: conversation.id } },
      }).subscribe({
        next: ({ items }) => {
          setMessages(items);
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
      });
      
      setSubscribed(true);
      
      // Cleanup on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!conversation) return;
    try {
      await markMessagesAsRead(conversation.id, userId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !conversation || sending) return;
    
    const content = messageText.trim();
    setMessageText('');
    setSending(true);
    
    try {
      await sendMessage({
        conversationId: conversation.id,
        senderId: userId,
        senderType: userType,
        senderName: userName,
        content,
      });
      
      // Reload messages to get the new one
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(content); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = async (reply) => {
    if (!reply || !conversation || sending) return;
    setMessageText('');
    setSending(true);
    try {
      await sendMessage({
        conversationId: conversation.id,
        senderId: userId,
        senderType: userType,
        senderName: userName,
        content: reply,
      });
      await loadMessages();
    } catch (error) {
      console.error('Error sending quick reply:', error);
      alert('Failed to send quick reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div>Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Channel Selector */}
      {showChannelSelector && (
        <div style={styles.channelSelector}>
          <div style={styles.channelSelectorLabel}>Select Chat Channel:</div>
          <div style={styles.channelButtons}>
            {getAvailableChannelsForUser().map(channel => {
              const isAvailable = isChannelAvailable(channel.id, appointmentDateTime);
              const isSelected = selectedChannel === channel.id;
              
              return (
                <button
                  key={channel.id}
                  style={{
                    ...styles.channelButton,
                    ...(isSelected ? styles.channelButtonActive : {}),
                    ...(!isAvailable ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                  }}
                  onClick={() => isAvailable && setSelectedChannel(channel.id)}
                  disabled={!isAvailable}
                  title={channel.description}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    ({channel.responseTimeLabel})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            {currentChannel.icon} {currentChannel.label}
          </div>
          <div style={styles.headerSubtitle}>
            {currentChannel.description}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Start a conversation
            </div>
            <div style={{ fontSize: '0.9rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              Ask us anything! We're here to help.
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === userId;
            const isAuto = message.isAutoResponse;
            
            return (
              <div
                key={message.id}
                style={{
                  ...styles.message,
                  ...(isOwn ? styles.messageOwn : styles.messageOther),
                }}
              >
                <div style={{
                  ...styles.messageAvatar,
                  background: isOwn 
                    ? 'linear-gradient(135deg, #8B1E3F, #A85A5A)' // Cherry gradient
                    : isAuto
                    ? 'rgba(139, 30, 63, 0.2)'
                    : 'rgba(139, 30, 63, 0.1)',
                  color: isOwn ? '#FFFEF9' : isAuto ? '#8B1E3F' : '#4A2A1A',
                }}>
                  {isOwn ? 'You' : isAuto ? 'MM' : 'MM'}
                </div>
                <div style={styles.messageContent}>
                  {!isOwn && (
                    <div style={styles.messageInfo}>
                      {message.senderName || 'Modeled Management'}
                      {isAuto && <span style={styles.faqBadge}>Auto</span>}
                    </div>
                  )}
                  <div style={{
                    ...styles.messageBubble,
                    ...(isOwn ? styles.messageBubbleOwn : 
                        isAuto ? styles.messageBubbleAuto : 
                        styles.messageBubbleOther),
                  }}>
                    {message.content}
                  </div>
                  <div style={styles.messageTime}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                style={{
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(139, 30, 63, 0.08)',
                  border: '1px solid rgba(139, 30, 63, 0.2)',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  cursor: isChannelAvailable(selectedChannel, appointmentDateTime) ? 'pointer' : 'not-allowed',
                  color: '#4A2A1A',
                  fontFamily: '"Alike", "Georgia", serif',
                  opacity: isChannelAvailable(selectedChannel, appointmentDateTime) ? 1 : 0.5,
                }}
                disabled={!isChannelAvailable(selectedChannel, appointmentDateTime)}
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <textarea
            style={styles.textarea}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              isChannelAvailable(selectedChannel, appointmentDateTime)
                ? 'Type your message...'
                : 'Chat opens 1 hour before and after the appointment'
            }
            disabled={!isChannelAvailable(selectedChannel, appointmentDateTime)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your message..."
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            style={{
              ...styles.sendButton,
              ...(sending || !messageText.trim() ? styles.sendButtonDisabled : {}),
            }}
            disabled={sending || !messageText.trim()}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

