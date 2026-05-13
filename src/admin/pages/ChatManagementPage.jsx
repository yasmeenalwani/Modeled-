import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { 
  getAdminConversations, 
  getMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  resolveConversation,
} from '../../utils/chatApi';

const client = generateClient();
import { mockModels } from '../../matching/mockModels';
import { mockProfessionals } from '../data/mockProfessionals';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '2rem',
    height: 'calc(100vh - 100px)',
  },
  
  // Sidebar (Conversation List)
  sidebar: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  filterBtn: {
    flex: 1,
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: 'rgba(102,126,234,0.2)',
    borderColor: '#667eea',
    color: '#fff',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto',
  },
  conversationItem: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  conversationItemActive: {
    background: 'rgba(102,126,234,0.1)',
    borderLeft: '3px solid #667eea',
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  conversationUser: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  conversationType: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    background: 'rgba(102,126,234,0.2)',
    color: '#667eea',
  },
  conversationPreview: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  conversationMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  unreadBadge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  
  // Main Chat Area
  chatArea: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '1rem 1.5rem',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  chatUserAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  chatUserDetails: {},
  chatUserName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  chatUserType: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  chatActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnResolve: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    border: '1px solid rgba(76,175,80,0.3)',
  },
  btnArchive: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  messagesArea: {
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
  messageAdmin: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageUser: {
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
  messageBubbleAdmin: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  messageBubbleUser: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.9)',
    borderBottomLeftRadius: '4px',
  },
  messageBubbleAuto: {
    background: 'rgba(255,193,7,0.2)',
    border: '1px solid rgba(255,193,7,0.3)',
    color: '#ffc107',
  },
  messageTime: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.3)',
    padding: '0 0.5rem',
  },
  inputArea: {
    padding: '1rem 1.5rem',
    background: 'rgba(0,0,0,0.2)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  inputForm: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

export default function ChatManagementPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'active', 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, [filter, searchQuery]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      markAsRead();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getAdminConversations({
        status: filter === 'all' ? null : filter,
        search: searchQuery || null,
      });
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const { messages: loadedMessages } = await getMessages(selectedConversation.id);
      setMessages(loadedMessages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      // Subscribe to new messages
      const subscription = client.models.Message.observeQuery({
        filter: { conversationId: { eq: selectedConversation.id } },
      }).subscribe({
        next: ({ items }) => {
          setMessages(items);
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
      });
      
      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const markAsRead = async () => {
    if (!selectedConversation) return;
    try {
      await markMessagesAsRead(selectedConversation.id, 'admin');
      await loadConversations(); // Refresh to update unread counts
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation || sending) return;
    
    const content = messageText.trim();
    setMessageText('');
    setSending(true);
    
    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        senderId: 'admin',
        senderType: 'admin',
        senderName: 'Modeled Management',
        content,
      });
      
      await loadMessages();
      await loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(content);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedConversation) return;
    if (!confirm('Mark this conversation as resolved?')) return;
    
    try {
      await resolveConversation(selectedConversation.id);
      await loadConversations();
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error resolving conversation:', error);
    }
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    if (!confirm('Archive this conversation?')) return;
    
    try {
      await archiveConversation(selectedConversation.id);
      await loadConversations();
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const getUserInfo = (conversation) => {
    const userId = conversation.participant1Id;
    const userType = conversation.participant1Type;
    
    if (userType === 'model') {
      const model = mockModels.find(m => m.id.toString() === userId || m.userId === userId);
      return {
        name: model ? `${model.firstName} ${model.lastName}` : 'Model',
        email: model?.email || '',
        avatar: model?.firstName?.charAt(0) || 'M',
      };
    } else if (userType === 'professional') {
      const pro = mockProfessionals.find(p => p.id.toString() === userId || p.userId === userId);
      return {
        name: pro ? `${pro.firstName} ${pro.lastName}` : 'Professional',
        email: pro?.email || '',
        avatar: pro?.firstName?.charAt(0) || 'P',
      };
    } else if (userType === 'partner') {
      // Partner data - using placeholder for now
      return {
        name: 'Partner',
        email: '',
        avatar: 'P',
      };
    }
    
    return { name: 'User', email: '', avatar: 'U' };
  };

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    if (filter === 'unread') {
      filtered = filtered.filter(c => (c.unreadCount || 0) > 0);
    }
    
    return filtered;
  }, [conversations, filter]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const userInfo = selectedConversation ? getUserInfo(selectedConversation) : null;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div style={styles.container}>
      {/* Sidebar - Conversation List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>
            Conversations {totalUnread > 0 && (
              <span style={{ 
                marginLeft: '0.5rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                background: 'rgba(233,69,96,0.2)',
                color: '#e94560',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                {totalUnread} unread
              </span>
            )}
          </div>
          
          <div style={styles.filters}>
            <button
              style={{
                ...styles.filterBtn,
                ...(filter === 'all' ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              style={{
                ...styles.filterBtn,
                ...(filter === 'unread' ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button
              style={{
                ...styles.filterBtn,
                ...(filter === 'active' ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
          </div>
          
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={styles.conversationList}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              Loading...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const user = getUserInfo(conv);
              const isSelected = selectedConversation?.id === conv.id;
              
              return (
                <div
                  key={conv.id}
                  style={{
                    ...styles.conversationItem,
                    ...(isSelected ? styles.conversationItemActive : {}),
                  }}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div style={styles.conversationHeader}>
                    <div style={styles.conversationUser}>{user.name}</div>
                    <span style={styles.conversationType}>
                      {conv.participant1Type}
                    </span>
                  </div>
                  <div style={styles.conversationPreview}>
                    {conv.lastMessagePreview || 'No messages yet'}
                  </div>
                  <div style={styles.conversationMeta}>
                    <span>{formatTime(conv.lastMessageAt || conv.createdAt)}</span>
                    {conv.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div style={styles.chatArea}>
        {!selectedConversation ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Select a conversation
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
              Choose a conversation from the list to start chatting
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatUserInfo}>
                <div style={styles.chatUserAvatar}>{userInfo.avatar}</div>
                <div style={styles.chatUserDetails}>
                  <div style={styles.chatUserName}>{userInfo.name}</div>
                  <div style={styles.chatUserType}>
                    {selectedConversation.participant1Type} • {userInfo.email}
                  </div>
                </div>
              </div>
              <div style={styles.chatActions}>
                <button
                  style={{ ...styles.actionBtn, ...styles.btnResolve }}
                  onClick={handleResolve}
                >
                  ✓ Resolve
                </button>
                <button
                  style={{ ...styles.actionBtn, ...styles.btnArchive }}
                  onClick={handleArchive}
                >
                  Archive
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div style={styles.messagesArea}>
              {messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👋</div>
                  <div>No messages yet. Start the conversation!</div>
                </div>
              ) : (
                messages.map((message) => {
                  const isAdmin = message.senderType === 'admin';
                  const isAuto = message.isAutoResponse;
                  
                  return (
                    <div
                      key={message.id}
                      style={{
                        ...styles.message,
                        ...(isAdmin ? styles.messageAdmin : styles.messageUser),
                      }}
                    >
                      <div style={{
                        ...styles.messageAvatar,
                        background: isAdmin
                          ? 'linear-gradient(135deg, #667eea, #764ba2)'
                          : isAuto
                          ? 'rgba(255,193,7,0.3)'
                          : 'rgba(255,255,255,0.1)',
                        color: isAdmin ? '#fff' : isAuto ? '#ffc107' : 'rgba(255,255,255,0.9)',
                      }}>
                        {isAdmin ? 'MM' : isAuto ? '🤖' : userInfo.avatar}
                      </div>
                      <div style={styles.messageContent}>
                        <div style={{
                          ...styles.messageBubble,
                          ...(isAdmin ? styles.messageBubbleAdmin : 
                              isAuto ? styles.messageBubbleAuto : 
                              styles.messageBubbleUser),
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
            </div>
            
            {/* Input */}
            <div style={styles.inputArea}>
              <form onSubmit={handleSend} style={styles.inputForm}>
                <textarea
                  style={styles.textarea}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Type your response..."
                  rows={1}
                  disabled={sending}
                />
                <button
                  type="submit"
                  style={{
                    ...styles.sendButton,
                    ...(sending || !messageText.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                  }}
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

