import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUnreadNotificationsForUser } from '../admin/data/mockNotifications';

const client = generateClient();

const styles = {
  notificationBell: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F5C842 0%, #E8B923 100%)',
    border: '1px solid rgba(232, 185, 35, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 999,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e94560',
    color: '#fff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '700',
    border: '2px solid rgba(26, 26, 46, 0.95)',
  },
};

export default function NotificationBell({ onClick, userId }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    
    const loadUnreadCount = async () => {
      // Try mock data first
      try {
        const mockNotifications = getUnreadNotificationsForUser(userId);
        if (mockNotifications.length > 0) {
          setUnreadCount(mockNotifications.length);
          return;
        }
      } catch (mockError) {
        console.log('Mock notifications not available, trying database...');
      }
      
      // Fall back to database
      try {
        // Get all notifications for user
        const { data: allNotifications } = await client.models.Notification.list({
          filter: { userId: { eq: userId } },
        });
        // Count unread - handle undefined/null gracefully
        if (!allNotifications) {
          setUnreadCount(0);
          return;
        }
        const unread = allNotifications.filter(n => !(n.read === true));
        setUnreadCount(unread.length);
      } catch (error) {
        console.error('Error loading unread count:', error);
        // Don't show error to user, just set count to 0
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div
      style={styles.notificationBell}
      onClick={onClick}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #F7D054 0%, #E8B923 100%)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #F5C842 0%, #E8B923 100%)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {unreadCount > 0 && (
        <div style={styles.notificationBadge}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
}

