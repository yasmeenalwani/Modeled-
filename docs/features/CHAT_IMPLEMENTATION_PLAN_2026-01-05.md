# Chat Implementation Plan - AWS AppSync 💬

## Quick Start Implementation

This document outlines the step-by-step plan to implement chat using AWS AppSync.

---

## 📐 Architecture

```
User Portal (Model/Pro/Partner)
    ↓
React Chat Component
    ↓
AppSync GraphQL API
    ↓
DynamoDB (Messages + Conversations)
    ↓
Real-time Subscriptions
    ↓
Admin Portal (Yasmeen)
```

---

## 🗄️ Database Schema

### **Conversation Model**
- Links a user (model/pro/professional) to admin
- Tracks conversation status, unread counts
- Stores last message preview for quick view

### **Message Model**
- Individual messages in conversations
- Links to conversation via `conversationId`
- Stores content, sender info, read status
- Supports attachments (S3 keys)

---

## 💰 Cost Breakdown

### **Monthly Costs (100 active users, 1,000 messages/day):**

| Service | Usage | Cost |
|---------|-------|------|
| AppSync Subscriptions | 2,400 connection-hours | $0.19 |
| AppSync Queries | 30,000 requests | $0.12 |
| DynamoDB Storage | 1GB messages | $0.25 |
| DynamoDB Reads | 30,000 reads | $0.12 |
| DynamoDB Writes | 30,000 writes | $0.30 |
| **Total** | | **~$1/month** |

**Even at 10x scale (1,000 users, 10,000 messages/day): ~$5-10/month**

---

## 🎨 User Experience

### **User Portal (Model/Pro/Partner):**
- Chat icon in navigation
- Opens chat window (sidebar or modal)
- Shows conversation with admin
- Real-time message delivery
- Typing indicator
- Unread badge

### **Admin Portal:**
- Chat section in admin nav
- Conversation list (all users)
- Filter by: user type, unread, date
- Search conversations
- Message view with user context
- Mark as resolved/archived
- Unread count badge

---

## 🔐 Security & Permissions

### **Authorization Rules:**
- Users can only see their own conversations
- Admin can see all conversations
- Messages are encrypted in transit (HTTPS/WSS)
- Messages stored encrypted in DynamoDB
- No PII in message content (optional)

### **Rate Limiting:**
- Max 50 messages per minute per user
- Prevent spam/abuse
- Implement in Lambda resolver

---

## 📱 Features Roadmap

### **Phase 1: MVP** (Week 1-2)
- ✅ Send/receive messages
- ✅ Real-time delivery
- ✅ Message history
- ✅ Unread counts
- ✅ Basic admin interface

### **Phase 2: Enhanced** (Week 3-4)
- ✅ Typing indicators
- ✅ Read receipts
- ✅ File attachments (images)
- ✅ Search messages
- ✅ Conversation archiving

### **Phase 3: Advanced** (Week 5-6)
- ✅ Quick reply templates
- ✅ Conversation assignment
- ✅ Internal admin notes
- ✅ Email notifications
- ✅ Analytics dashboard

---

## 🛠️ Technical Implementation

### **1. GraphQL Schema Updates**

Add to `amplify/data/resource.ts`:

```typescript
Conversation: a.model({
  participant1Id: a.string().required(),
  participant1Type: a.enum(['model', 'professional', 'partner']).required(),
  participant2Id: a.string().required(), // Always admin
  participant2Type: a.enum(['admin']).required(),
  
  status: a.enum(['active', 'archived', 'resolved']).default('active'),
  lastMessageAt: a.datetime(),
  lastMessagePreview: a.string(),
  unreadCount: a.integer().default(0),
  unreadBy: a.string().array(),
  
  createdAt: a.datetime().default(new Date()),
  updatedAt: a.datetime(),
})
.authorization((allow) => [
  allow.owner('participant1Id'),
  allow.group('Admin'),
]),

Message: a.model({
  conversationId: a.string().required(),
  senderId: a.string().required(),
  senderType: a.enum(['model', 'professional', 'partner', 'admin']).required(),
  
  content: a.string().required(),
  messageType: a.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: a.string().array(),
  
  read: a.boolean().default(false),
  readAt: a.datetime(),
  
  createdAt: a.datetime().default(new Date()),
})
.authorization((allow) => [
  allow.owner('senderId'),
  allow.group('Admin'),
]),
```

### **2. Real-Time Subscriptions**

```typescript
// Subscribe to new messages
subscription OnMessageCreated($conversationId: ID!) {
  onMessageCreated(conversationId: $conversationId) {
    id
    content
    senderId
    senderType
    createdAt
  }
}

// Subscribe to conversation updates
subscription OnConversationUpdated($userId: ID!) {
  onConversationUpdated(userId: $userId) {
    id
    lastMessageAt
    lastMessagePreview
    unreadCount
  }
}
```

### **3. React Components**

- `ChatWindow.jsx` - Main chat interface
- `ConversationList.jsx` - List of conversations (admin)
- `MessageList.jsx` - Messages in conversation
- `MessageInput.jsx` - Message composer
- `ChatBadge.jsx` - Unread count indicator

---

## 📊 Admin Management Features

### **Conversation Dashboard:**
- Total conversations
- Active conversations
- Unread messages
- Average response time
- Conversations by user type

### **Conversation List:**
- Sort by: newest, unread, user type
- Filter by: status, user type, date
- Search by: user name, message content
- Quick actions: resolve, archive, assign

### **Message View:**
- Full conversation history
- User profile sidebar
- Quick reply templates
- Mark as read/resolved
- Internal notes (admin-only)

---

## 🔄 Migration Path (If Needed Later)

### **AppSync → Stream.io:**
1. Export all messages from DynamoDB
2. Import to Stream.io via API
3. Update frontend to use Stream SDK
4. Keep AppSync for other data

### **Benefits of Migration:**
- Better admin dashboard
- Built-in team features
- More chat features out of box
- Better mobile support

### **Cost of Migration:**
- Development time: 1-2 weeks
- Monthly cost: $99+ vs $5
- But better features and UX

---

## ✅ Recommendation

**Start with AppSync** for:
- Lowest cost ($1-5/month)
- Full integration
- Full control
- Easy to build

**Consider Stream.io later** if:
- You need better admin tools
- Budget allows $99+/month
- You want faster feature development

---

**Ready to implement? Let me know and I'll build it!** 🚀

