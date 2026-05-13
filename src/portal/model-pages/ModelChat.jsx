import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  getMockConversations,
  getMockMessages,
  sendMockMessage,
  shouldUseMockData,
} from '../../utils/mockDataService';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const MOCK_MODEL_ID = 'mock-model-1';
const MOCK_MODEL_NAME = 'Seraphina L.';

const MODEL_QUICK_REPLIES = [
  "I'll be on time!",
  'Running a few minutes late',
  'I have arrived',
  'Quick question about the look',
  'Thank you for the session!',
  'Can we reschedule?',
];

const SESSION_CONTEXT = {
  'conv-pro-model-1': {
    service: 'Haircut',
    proName: 'Sarah M.',
    salon: 'Luxe Studio',
    date: 'Tomorrow',
    time: '10:00 AM',
    location: '123 Beauty St, New York',
    status: 'confirmed',
    modelFee: '$40',
    matchScore: 94,
  },
};

// ─── ConversationItem ─────────────────────────────────────────────────────────
function ConversationItem({ conv, messages, selected, onClick, currentUserId }) {
  const lastMsg = messages.length ? messages[messages.length - 1] : null;
  const unread = conv.unreadCount?.[currentUserId] || 0;

  const isProModel = conv.type === 'pro_model';
  const name = isProModel ? 'Sarah M. (Pro)' : 'Modeled Support';
  const preview = lastMsg ? lastMsg.text : 'No messages yet';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '1rem',
        background: selected ? 'rgba(139, 30, 63, 0.08)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(74, 42, 26, 0.08)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: isProModel
            ? 'linear-gradient(135deg, #4A2A1A, #8B5E3C)'
            : 'linear-gradient(135deg, #8B1E3F, #A83255)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: '700',
          fontSize: '1.1rem',
          fontFamily: '"Alike", serif',
        }}>
          {isProModel ? 'S' : 'M'}
        </div>
        {isProModel && (
          <span style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 10, height: 10, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #FFFEF9',
          }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem',
        }}>
          <span style={{
            fontSize: '0.9rem', fontWeight: unread ? '700' : '600',
            color: '#4A2A1A', fontFamily: '"Alike", serif',
          }}>{name}</span>
          <span style={{ fontSize: '0.72rem', color: '#9B7B6A' }}>
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <div style={{
          fontSize: '0.82rem', color: unread ? '#4A2A1A' : '#7A5A4A',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontWeight: unread ? '600' : '400',
        }}>{preview.slice(0, 55)}{preview.length > 55 ? '…' : ''}</div>
      </div>

      {unread > 0 && (
        <span style={{
          background: '#8B1E3F', color: '#fff', fontSize: '0.7rem', fontWeight: '700',
          padding: '2px 7px', borderRadius: '999px', flexShrink: 0,
        }}>{unread}</span>
      )}
    </button>
  );
}

// ─── SessionContextCard (model view) ─────────────────────────────────────────
function SessionContextCard({ ctx }) {
  if (!ctx) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,30,63,0.06) 0%, rgba(196,96,122,0.06) 100%)',
      border: '1px solid rgba(139,30,63,0.18)',
      borderRadius: '12px',
      padding: '0.9rem 1.1rem',
      margin: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: '160px' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B1E3F', fontWeight: '700', marginBottom: '0.2rem' }}>
          Your Booking
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", serif' }}>
          {ctx.service} at {ctx.salon}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6A4A3A', marginTop: '0.15rem' }}>
          {ctx.date} · {ctx.time} · {ctx.location}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' }}>
          Confirmed
        </span>
        <span style={{ background: 'rgba(139,30,63,0.1)', color: '#8B1E3F', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' }}>
          Your Fee: {ctx.modelFee}
        </span>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine }) {
  if (msg.isSystem) {
    return (
      <div style={{ textAlign: 'center', margin: '0.75rem 1rem' }}>
        <span style={{
          background: 'rgba(139,30,63,0.07)',
          border: '1px solid rgba(139,30,63,0.15)',
          color: '#6A3A50',
          fontSize: '0.78rem',
          padding: '5px 14px',
          borderRadius: '999px',
          display: 'inline-block',
        }}>
          <span style={{ marginRight: '4px', opacity: 0.7 }}>⚡</span>
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isMine ? 'flex-end' : 'flex-start',
      marginBottom: '0.5rem',
      padding: '0 1rem',
    }}>
      {!isMine && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: msg.senderType === 'support'
            ? 'linear-gradient(135deg, #8B1E3F, #A83255)'
            : 'linear-gradient(135deg, #4A2A1A, #8B5E3C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '0.85rem',
          flexShrink: 0, marginRight: '0.5rem', alignSelf: 'flex-end',
        }}>
          {msg.senderName?.[0] || '?'}
        </div>
      )}
      <div style={{ maxWidth: '70%' }}>
        {!isMine && (
          <div style={{ fontSize: '0.72rem', color: '#9B7B6A', marginBottom: '0.15rem', marginLeft: '2px' }}>
            {msg.senderName}
          </div>
        )}
        <div style={{
          background: isMine
            ? 'linear-gradient(135deg, #8B1E3F, #A83255)'
            : '#fff',
          color: isMine ? '#fff' : '#3A1A0A',
          padding: '0.65rem 0.95rem',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: '0.88rem',
          lineHeight: '1.45',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: isMine ? 'none' : '1px solid rgba(74,42,26,0.1)',
        }}>
          {msg.text}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#B09080', marginTop: '0.2rem', textAlign: isMine ? 'right' : 'left' }}>
          {formatTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ModelChat() {
  const { user } = useAuthenticator();
  const [conversations, setConversations] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState('list');

  const currentUserId = shouldUseMockData() ? MOCK_MODEL_ID : (user?.userId || MOCK_MODEL_ID);
  const currentUserName = MOCK_MODEL_NAME;

  const loadData = useCallback(() => {
    const convs = getMockConversations(currentUserId);
    setConversations(convs);

    const msgs = {};
    convs.forEach(c => {
      msgs[c.id] = getMockMessages(c.id);
    });
    setAllMessages(msgs);

    if (!selectedConvId && convs.length) {
      setSelectedConvId(convs[0].id);
    }
  }, [currentUserId, selectedConvId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedConvId]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const selectedMessages = allMessages[selectedConvId] || [];
  const sessionCtx = SESSION_CONTEXT[selectedConvId] || null;

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !selectedConvId) return;

    const newMsg = sendMockMessage(
      selectedConvId,
      currentUserId,
      currentUserName,
      'model',
      text,
    );
    setAllMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
    }));
    setConversations(prev =>
      prev.map(c => c.id === selectedConvId ? { ...c, lastMessageAt: newMsg.timestamp } : c)
    );
    setInputText('');
    inputRef.current?.focus();

    if (selectedConvId === 'conv-pro-model-1') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          'Thank you Seraphina! See you then.',
          "Great, I'll have everything ready.",
          "Perfect. Looking forward to working with you!",
          "Sounds good! Don't hesitate to reach out if you need directions.",
        ];
        const autoReply = sendMockMessage(
          selectedConvId,
          'mock-pro-1',
          'Sarah M.',
          'professional',
          replies[Math.floor(Math.random() * replies.length)],
        );
        setAllMessages(prev => ({
          ...prev,
          [selectedConvId]: [...(prev[selectedConvId] || []), autoReply],
        }));
      }, 1800);
    } else if (selectedConvId === 'conv-support-model-1') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply = sendMockMessage(
          selectedConvId,
          'modeled-support',
          'Modeled Team',
          'support',
          "Thanks for reaching out! Our team will get back to you shortly. In most cases we respond within a few minutes.",
        );
        setAllMessages(prev => ({
          ...prev,
          [selectedConvId]: [...(prev[selectedConvId] || []), autoReply],
        }));
      }, 2000);
    }
  };

  const handleQuickReply = (text) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getConvDisplayName = (conv) => {
    if (conv.type === 'pro_model') return 'Sarah M. (Pro)';
    return 'Modeled Support';
  };

  return (
    <div style={{
      display: 'flex',
      height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 80px)',
      background: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
      overflow: 'hidden',
    }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        width: isMobile ? '100%' : '300px',
        flexShrink: 0,
        borderRight: isMobile ? 'none' : '1px solid rgba(74,42,26,0.1)',
        display: isMobile && mobileView !== 'list' ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#FDFCF8',
      }}>
        <div style={{
          padding: '1.2rem 1rem 1rem',
          borderBottom: '1px solid rgba(74,42,26,0.1)',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#4A2A1A' }}>
            Messages
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#9B7B6A' }}>
            Model dashboard
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              messages={allMessages[conv.id] || []}
              selected={conv.id === selectedConvId}
              currentUserId={currentUserId}
              onClick={() => {
                setSelectedConvId(conv.id);
                if (isMobile) setMobileView('thread');
              }}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      {selectedConv ? (
        <div style={{
          flex: 1,
          display: isMobile && mobileView !== 'thread' ? 'none' : 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: isMobile ? '100%' : undefined,
        }}>
          {/* Header */}
          <div style={{
            padding: '0.9rem 1.2rem',
            borderBottom: '1px solid rgba(74,42,26,0.1)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: '#FDFCF8',
          }}>
            {/* Mobile back button */}
            {isMobile && (
              <button
                onClick={() => setMobileView('list')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8B1E3F', padding: '4px 6px 4px 0',
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center',
                  fontFamily: '"Alike", serif',
                }}
                aria-label="Back"
              >
                ←
              </button>
            )}
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: selectedConv.type === 'pro_model'
                ? 'linear-gradient(135deg, #4A2A1A, #8B5E3C)'
                : 'linear-gradient(135deg, #8B1E3F, #A83255)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '1rem',
            }}>
              {selectedConv.type === 'pro_model' ? 'S' : 'M'}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#4A2A1A', fontSize: '0.95rem' }}>
                {getConvDisplayName(selectedConv)}
              </div>
              <div style={{ fontSize: '0.75rem', color: selectedConv.type === 'pro_model' ? '#22c55e' : '#9B7B6A' }}>
                {selectedConv.type === 'pro_model' ? 'Active' : 'Typically replies in minutes'}
              </div>
            </div>
          </div>

          {/* Session context */}
          {selectedConv.type === 'pro_model' && <SessionContextCard ctx={sessionCtx} />}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {selectedMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.senderId === currentUserId}
              />
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', margin: '0.25rem 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: selectedConv.type === 'pro_model'
                    ? 'linear-gradient(135deg, #4A2A1A, #8B5E3C)'
                    : 'linear-gradient(135deg, #8B1E3F, #A83255)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '0.85rem',
                }}>
                  {selectedConv.type === 'pro_model' ? 'S' : 'M'}
                </div>
                <div style={{
                  background: '#fff', border: '1px solid rgba(74,42,26,0.1)',
                  borderRadius: '18px 18px 18px 4px', padding: '0.6rem 1rem',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 150, 300].map(d => (
                    <span key={d} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#8B1E3F',
                      opacity: 0.6, animation: `typingDot 1.2s ${d}ms ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {selectedConv.type === 'pro_model' && (
            <div style={{
              padding: '0.5rem 1rem',
              display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
              borderTop: '1px solid rgba(74,42,26,0.06)',
            }}>
              {MODEL_QUICK_REPLIES.map(qr => (
                <button
                  key={qr}
                  onClick={() => handleQuickReply(qr)}
                  style={{
                    background: 'rgba(139,30,63,0.07)',
                    border: '1px solid rgba(139,30,63,0.2)',
                    color: '#8B1E3F', fontSize: '0.76rem', fontWeight: '600',
                    padding: '4px 10px', borderRadius: '999px', cursor: 'pointer',
                    transition: 'all 0.15s', fontFamily: '"Alike", serif',
                  }}
                >{qr}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(74,42,26,0.1)',
            display: 'flex', gap: '0.6rem', alignItems: 'flex-end',
            background: '#FDFCF8',
          }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: '24px',
                border: '1.5px solid rgba(139,30,63,0.25)', fontSize: '0.88rem',
                fontFamily: '"Alike", serif', outline: 'none', resize: 'none',
                lineHeight: '1.45', background: '#fff', color: '#3A1A0A',
                maxHeight: '120px', overflowY: 'auto',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: inputText.trim() ? 'linear-gradient(135deg, #8B1E3F, #A83255)' : 'rgba(139,30,63,0.2)',
                border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#9B7B6A' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#4A2A1A' }}>Select a conversation</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
