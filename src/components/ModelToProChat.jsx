import React, { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { CHAT_CHANNELS, formatResponseStatus, getResponseTimeMessage } from '../utils/chatTiming';

const client = generateClient();

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  message: {
    display: 'flex',
    gap: '0.5rem',
    maxWidth: '80%',
  },
  messageOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  messageOwnBubble: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  messageOtherBubble: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#4A2A1A',
  },
  quickPrompts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
  },
  quickButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inputContainer: {
    padding: '1rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  closedMessage: {
    padding: '2rem',
    textAlign: 'center',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  timingIndicator: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 193, 7, 0.15)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#ffc107',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
  },
  timingIndicatorActive: {
    background: 'rgba(76, 175, 80, 0.15)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    color: '#4caf50',
  },
  headerInfo: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const QUICK_PROMPTS = [
  { text: 'OMW', value: 'omw', message: 'On my way!' },
  { text: '5 Mins Out', value: '5_mins_out', message: 'Be there in 5 minutes!' },
  { text: 'Just got off Subway', value: 'just_got_off_subway', message: 'Just got off the subway, almost there!' },
  { text: 'Running Late', value: 'running_late', message: 'Running a bit late, sorry!' },
];

export default function ModelToProChat({ booking, modelProfile }) {
  const { user } = useAuthenticator();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [timingInfo, setTimingInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const userId = user?.userId || user?.username;

  useEffect(() => {
    if (booking) {
      checkChatWindow();
      loadChat();
    }
  }, [booking]);

  useEffect(() => {
    if (chat && isActive) {
      loadMessages();
      sendProfileInfo();
    }
  }, [chat, isActive]);
  
  useEffect(() => {
    updateTimingInfo();
    const interval = setInterval(updateTimingInfo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [booking, isActive]);
  
  const updateTimingInfo = () => {
    if (!booking?.appointmentDate || !booking?.appointmentTime) return;
    
    const appointmentDateTime = `${booking.appointmentDate}T${booking.appointmentTime}`;
    const status = formatResponseStatus('pro_x_model', null, appointmentDateTime);
    
    setTimingInfo({
      status,
      message: getResponseTimeMessage('pro_x_model', appointmentDateTime),
      channel: CHAT_CHANNELS.PRO_X_MODEL,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkChatWindow = () => {
    if (!booking?.appointmentDate || !booking?.appointmentTime) return;
    
    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
    const oneHourBefore = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
    const now = new Date();
    
    setIsActive(now >= oneHourBefore && now <= oneHourAfter);
  };

  const loadChat = async () => {
    if (!booking) return;
    
    try {
      const { data } = await client.models.ModelToProChat.list({
        filter: { bookingId: { eq: booking.id } },
      });
      
      if (data && data.length > 0) {
        setChat(data[0]);
      } else {
        // Create chat if it doesn't exist
        const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
        const chatOpensAt = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
        const chatClosesAt = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        const { data: newChat } = await client.models.ModelToProChat.create({
          bookingId: booking.id,
          modelId: booking.modelId,
          professionalId: booking.professionalId,
          chatOpensAt: chatOpensAt.toISOString(),
          chatClosesAt: chatClosesAt.toISOString(),
          isActive: isActive,
          status: isActive ? 'active' : 'pending',
        });
        
        setChat(newChat);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendProfileInfo = async () => {
    if (!chat || chat.profileInfoSent) return;
    
    try {
      const profileSummary = `Hi! Here's a quick intro to ${modelProfile?.firstName || 'me'}:
- ${modelProfile?.somethingFun || 'Loves beauty and trying new looks'}
- ${modelProfile?.whatYouCareAbout || 'Passionate about self-care'}
- Favorite service: ${modelProfile?.favoriteService || 'Open to anything!'}`;

      await client.models.ModelToProMessage.create({
        chatId: chat.id,
        senderId: 'system',
        senderType: 'model',
        senderName: 'System',
        content: profileSummary,
        messageType: 'system',
      });

      await client.models.ModelToProChat.update({
        id: chat.id,
        profileInfoSent: true,
        profileInfoSentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending profile info:', error);
    }
  };

  const loadMessages = async () => {
    if (!chat) return;
    
    try {
      const { data } = await client.models.ModelToProMessage.list({
        filter: { chatId: { eq: chat.id } },
      });
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleQuickPrompt = async (prompt) => {
    const promptData = QUICK_PROMPTS.find(p => p.value === prompt);
    if (!promptData || !chat) return;
    
    await sendMessage(promptData.message, 'quick_prompt', prompt);
  };

  const sendMessage = async (content, messageType = 'text', quickPromptType = null) => {
    if (!chat || !content.trim()) return;
    
    try {
      await client.models.ModelToProMessage.create({
        chatId: chat.id,
        senderId: userId,
        senderType: 'model',
        senderName: modelProfile?.firstName || 'Model',
        content,
        messageType,
        quickPromptType,
      });
      
      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(messageText);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isActive) {
    return (
      <div style={styles.container}>
        <div style={styles.closedMessage}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Chat Window Closed
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            {timingInfo?.message || 'Chat opens 1 hour before your appointment'}
          </div>
          {timingInfo?.channel && (
            <div style={{
              ...styles.timingIndicator,
              marginBottom: 0,
            }}>
              <span>{timingInfo.channel.icon}</span>
              <span>Response Time: {timingInfo.channel.responseTimeLabel}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            {CHAT_CHANNELS.PRO_X_MODEL.icon} Chat with {booking?.professionalName || 'Professional'}
          </div>
          {timingInfo && (
            <div style={styles.headerInfo}>
              {timingInfo.channel.responseTimeLabel} response time • Active during appointment window
            </div>
          )}
        </div>
        {timingInfo && (
          <div style={{
            ...styles.timingIndicator,
            ...styles.timingIndicatorActive,
            marginBottom: 0,
          }}>
            <span>{timingInfo.status.icon}</span>
            <span>{timingInfo.status.message}</span>
          </div>
        )}
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg) => {
          const isOwn = msg.senderId === userId;
          return (
            <div key={msg.id} style={{ ...styles.message, ...(isOwn ? styles.messageOwn : {}) }}>
              <div style={{
                ...styles.messageBubble,
                ...(isOwn ? styles.messageOwnBubble : styles.messageOtherBubble),
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.quickPrompts}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.value}
            style={styles.quickButton}
            onClick={() => handleQuickPrompt(prompt.value)}
          >
            {prompt.text}
          </button>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
          placeholder="Type a message..."
        />
        <button style={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

