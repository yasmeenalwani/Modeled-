import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

/**
 * Portal Notifications Component
 * 
 * Displays notifications in the portal for models, professionals, and admins
 * Notifications are stored in DynamoDB and displayed in real-time
 */

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    width: '380px',
    maxHeight: '600px',
    background: 'rgba(26, 26, 46, 0.98)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    zIndex: 1000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    background: '#e94560',
    color: '#fff',
    borderRadius: '12px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  list: {
    overflowY: 'auto',
    maxHeight: '500px',
  },
  notification: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  notificationUnread: {
    background: 'rgba(233,69,96,0.1)',
    borderLeft: '3px solid #e94560',
  },
  notificationRead: {
    opacity: 0.7,
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  notificationIcon: {
    fontSize: '1.5rem',
    marginRight: '0.75rem',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  notificationMessage: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.5rem',
  },
  notificationActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    background: '#e94560',
    color: '#fff',
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  empty: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  clearButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default function PortalNotifications({ userId, userType = 'model' }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    if (userId) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: notificationsData } = await client.models.Notification.list({
        filter: { userId: { eq: userId } },
        limit: 20,
      });
      
      // Handle case where data might be undefined
      if (!notificationsData) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      
      // Sort by createdAt descending (most recent first)
      const sorted = [...notificationsData].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      // Convert to format expected by component
      const formattedNotifications = sorted.map(n => ({
        id: n.id,
        type: n.type || 'info',
        title: n.title || 'Notification',
        message: n.message || '',
        timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
        read: n.read || false,
        actions: Array.isArray(n.actions) ? n.actions : [],
        data: n.data || {},
        link: n.data?.link,
      }));
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationAction = async (notification, action) => {
    try {
      // Mark as read when action is taken
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      
      switch (action) {
        case 'view':
          // Navigate to details page
          if (notification.link) {
            window.location.href = notification.link;
          } else if (notification.data?.relatedEntityId) {
            window.location.href = `/model-portal/opportunities/${notification.data.relatedEntityId}`;
          }
          break;
        case 'accept':
          // Navigate to payment page
          if (notification.data?.relatedEntityId) {
            window.location.href = `/model-portal/payment?opportunity=${notification.data.relatedEntityId}`;
          }
          break;
        case 'decline':
          // Already marked as read above
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await client.models.Notification.update({
        id: notificationId,
        read: true,
        readAt: new Date().toISOString(),
      });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update UI even if DB update fails
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = async () => {
    try {
      // Mark all unread notifications as read
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(
        unreadIds.map(id =>
          client.models.Notification.update({
            id,
            read: true,
            readAt: new Date().toISOString(),
          })
        )
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      match_opportunity: '🎯',
      payment_required: '💳',
      booking_confirmed: '🎉',
      booking_reminder: '⏰',
      booking_cancelled: '⚠️',
      booking_completed: '✅',
      payment_processed: '💰',
      profile_approved: '🎉',
      profile_rejected: '⚠️',
      level_up: '🎉',
      achievement: '🏆',
    };
    return icons[type] || null; // null = warm yellow circle
  };

  const warmYellowCircle = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F5C842 0%, #E8B923 100%)',
    flexShrink: 0,
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading && notifications.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Notifications</div>
        {unreadCount > 0 && (
          <div style={styles.badge}>{unreadCount}</div>
        )}
      </div>

      <div style={styles.list}>
        {notifications.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #F5C842 0%, #E8B923 100%)', marginBottom: '0.75rem', flexShrink: 0 }} />
            <div>No notifications</div>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                ...styles.notification,
                ...(notification.read ? styles.notificationRead : styles.notificationUnread),
              }}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div style={styles.notificationHeader}>
                <div style={styles.notificationIcon}>
                  {(() => {
                    const icon = getNotificationIcon(notification.type);
                    return icon ? (
                      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    ) : (
                      <div style={warmYellowCircle} />
                    );
                  })()}
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationTitle}>{notification.title}</div>
                  <div style={styles.notificationMessage}>{notification.message}</div>
                  <div style={styles.notificationTime}>
                    {formatTime(notification.timestamp)}
                  </div>
                  {notification.actions && notification.actions.length > 0 && (
                    <div style={styles.notificationActions}>
                      {notification.actions.map((action, idx) => (
                        <button
                          key={idx}
                          style={{
                            ...styles.actionButton,
                            ...(action.primary ? styles.primaryButton : styles.secondaryButton),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification, action.action);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div style={styles.footer}>
          <button style={styles.clearButton} onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

