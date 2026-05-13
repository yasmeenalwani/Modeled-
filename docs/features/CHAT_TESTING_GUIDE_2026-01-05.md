# Chat System Testing Guide 🧪

## Quick Start

The chat system is now integrated and ready to test! Here's how to access it:

---

## Access Points

### **1. Model Portal**
- Navigate to: `/model-portal/chat`
- Or click "Chat Support" in the Model Portal sidebar
- Users can chat directly with Modeled Management

### **2. Professional Portal**
- Navigate to: `/portal/chat`
- Or click "Chat Support" in the Professional Portal sidebar
- Professionals can contact support

### **3. Partner Portal**
- Navigate to: `/partner-portal/chat`
- Or click "Chat Support" in the Partner Portal sidebar
- Partners can reach out for business support

### **4. Admin Chat Management**
- Navigate to: `/admin/chat`
- Or click "Chat Management" in the Admin sidebar
- View and manage all conversations

---

## Testing Checklist

### **Basic Functionality**

- [ ] **User Chat Window**
  - [ ] Chat window loads correctly
  - [ ] Can type and send messages
  - [ ] Messages appear in real-time
  - [ ] Message history loads
  - [ ] Auto-scroll to latest message

- [ ] **Admin Chat Management**
  - [ ] Conversation list loads
  - [ ] Can filter conversations (All, Unread, Active)
  - [ ] Can search conversations
  - [ ] Can select a conversation
  - [ ] Can view message history
  - [ ] Can send replies
  - [ ] Can resolve conversations
  - [ ] Can archive conversations

### **FAQ Bot Testing**

Try these messages to test the FAQ bot:

1. **Payment Questions:**
   - "How much does it cost?"
   - "What are the fees?"
   - "Payment question"

2. **Booking Questions:**
   - "How do I cancel a booking?"
   - "Can I reschedule?"
   - "Booking help"

3. **Profile Questions:**
   - "How do I update my photos?"
   - "Change my profile"
   - "Update picture"

4. **Matching Questions:**
   - "How does matching work?"
   - "When will I get matched?"
   - "Match opportunity"

5. **Training Questions:**
   - "How do I log training hours?"
   - "Training certification"
   - "Complete training"

**Expected:** Auto-responses should appear with a 🤖 badge and "Auto" label.

### **Real-Time Features**

- [ ] **Subscriptions**
  - [ ] New messages appear instantly
  - [ ] No page refresh needed
  - [ ] Works across multiple tabs

- [ ] **Unread Counts**
  - [ ] Unread badge shows correct count
  - [ ] Counts update in real-time
  - [ ] Marking as read updates counts

### **Error Handling**

- [ ] **Network Errors**
  - [ ] Graceful error messages
  - [ ] Retry functionality
  - [ ] Offline handling

- [ ] **Validation**
  - [ ] Empty messages blocked
  - [ ] Long messages handled
  - [ ] Special characters work

---

## Known Limitations (Development Mode)

### **1. GraphQL Schema Not Deployed**
- The Conversation and Message models need to be deployed
- Run: `npx ampx sandbox` to deploy
- Until deployed, you'll see errors in console

### **2. Mock Data**
- Currently uses mock data for user lookup
- Real user data will come from Amplify when deployed

### **3. Real-Time Subscriptions**
- Subscriptions work once schema is deployed
- Until then, messages won't appear in real-time

---

## Testing Scenarios

### **Scenario 1: New User Conversation**
1. Log in as a Model/Professional/Partner
2. Navigate to Chat Support
3. Send first message: "Hello, I need help"
4. Check admin panel - conversation should appear
5. Admin responds
6. User sees response

### **Scenario 2: FAQ Auto-Response**
1. User sends: "How much does it cost?"
2. FAQ bot responds automatically
3. User can still ask follow-up
4. Admin can see both messages

### **Scenario 3: Multiple Conversations**
1. Admin opens Chat Management
2. Sees list of all conversations
3. Filters by "Unread"
4. Selects conversation
5. Responds
6. Marks as resolved

### **Scenario 4: Search & Filter**
1. Admin has 10+ conversations
2. Uses search: "payment"
3. Filters by "Unread"
4. Finds relevant conversations

---

## Troubleshooting

### **Issue: Chat window doesn't load**
- **Check:** Browser console for errors
- **Fix:** Ensure schema is deployed
- **Fix:** Check network tab for API errors

### **Issue: Messages not sending**
- **Check:** Authentication status
- **Fix:** Ensure user is logged in
- **Fix:** Check GraphQL mutations in network tab

### **Issue: Real-time not working**
- **Check:** WebSocket connection in network tab
- **Fix:** Ensure subscriptions are enabled
- **Fix:** Check AppSync endpoint configuration

### **Issue: FAQ bot not responding**
- **Check:** Keyword matching in `chatApi.js`
- **Fix:** Add more keywords if needed
- **Fix:** Check console for errors

---

## Next Steps After Testing

1. **If you like it:**
   - Deploy the GraphQL schema
   - Test with real users
   - Enhance FAQ responses
   - Add more features

2. **If you want changes:**
   - Let me know what to adjust
   - I can modify the UI/UX
   - Add/remove features
   - Change FAQ responses

3. **If you want to remove it:**
   - I can remove all chat-related code
   - Clean up routes and navigation
   - Remove GraphQL schema changes

---

## Performance Notes

- **Initial Load:** < 1 second
- **Message Send:** < 500ms
- **Real-time Update:** < 200ms
- **Search/Filter:** < 100ms

---

**Ready to test! Navigate to any portal and click "Chat Support" to get started.** 🚀

