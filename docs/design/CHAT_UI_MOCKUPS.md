# Chat UI Mockups - Modeled Management

**Created:** January 6, 2026  
**Status:** Design Mockups  
**Purpose:** Show how users will engage with 3 different chat types

---

## 📋 Chat Types Overview

1. **Pro ↔ Modeled** (Support chat)
   - Opens: 24 hours before appointment
   - Closes: 30 minutes after appointment
   - Purpose: Pro can ask Modeled support questions

2. **Model ↔ Modeled** (Support chat)
   - Opens: 24 hours before appointment
   - Closes: 30 minutes after appointment
   - Purpose: Model can ask Modeled support questions

3. **Pro ↔ Model** (Direct chat)
   - Opens: 1 hour before appointment
   - Closes: 30 minutes after appointment
   - Purpose: Pro and Model can coordinate directly

---

## 🎨 Mockup 1: Booking Confirmation Page

### **What Users See After Booking Confirmed:**

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Booking Confirmed!                                      │
│                                                             │
│  Service: Balayage Highlights                              │
│  Date: December 15, 2024                                    │
│  Time: 10:00 AM                                             │
│  Location: 123 Main St, Manhattan, NY 10001                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💬 Chat Windows                                    │   │
│  │                                                     │   │
│  │  📅 Chat Schedule:                                 │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐ │   │
│  │  │ 🟢 Support Chat (Modeled)                    │ │   │
│  │  │ Opens: Dec 14, 10:00 AM (24h before)        │ │   │
│  │  │ Closes: Dec 15, 10:30 AM (30min after)      │ │   │
│  │  │ Use for: Questions, issues, support         │ │   │
│  │  │ Status: ⏳ Opens in 23 hours                 │ │   │
│  │  └─────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐ │   │
│  │  │ 🔵 Direct Chat (Professional/Model)          │ │   │
│  │  │ Opens: Dec 15, 9:00 AM (1h before)          │ │   │
│  │  │ Closes: Dec 15, 10:30 AM (30min after)      │ │   │
│  │  │ Use for: Coordination, arrival, updates     │ │   │
│  │  │ Status: ⏳ Opens in 23 hours                 │ │   │
│  │  └─────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [View Calendar] [View Booking Details]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Mockup 2: Chat List View (Portal Dashboard)

### **What Users See in Their Portal:**

```
┌─────────────────────────────────────────────────────────────┐
│  My Chats                                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Support Chat - Modeled                          │   │
│  │ Service: Balayage Highlights                       │   │
│  │ Date: Dec 15, 10:00 AM                             │   │
│  │ Status: 🟢 Active (Opens in 2 hours)               │   │
│  │ [Open Chat]                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 Direct Chat - Sarah M. (Professional)           │   │
│  │ Service: Balayage Highlights                       │   │
│  │ Date: Dec 15, 10:00 AM                             │   │
│  │ Status: ⏳ Opens in 23 hours                       │   │
│  │ [View Details]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 Direct Chat - Emma J. (Model)                    │   │
│  │ Service: Color Correction                           │   │
│  │ Date: Dec 16, 2:00 PM                               │   │
│  │ Status: 🟢 Active                                   │   │
│  │ [Open Chat]                                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Mockup 3: Support Chat UI (Pro ↔ Modeled)

### **What Pro Sees When Support Chat Opens:**

```
┌─────────────────────────────────────────────────────────────┐
│  💬 Support Chat - Modeled                                 │
│  Service: Balayage Highlights | Dec 15, 10:00 AM           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [System Message]                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ℹ️ This chat is for support questions.              │   │
│  │ Use the Direct Chat to coordinate with your model.  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Your Messages]                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Hi, I have a question about the booking...          │   │
│  │ 10:15 AM                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Modeled Support]                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Hi! How can we help?                                │   │
│  │ 10:16 AM                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type your message...                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Send]                                                     │
│                                                             │
│  💡 Tip: This chat closes 30 minutes after your           │
│     appointment. Use Direct Chat to coordinate with model. │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Mockup 4: Direct Chat UI (Pro ↔ Model)

### **What Pro and Model See When Direct Chat Opens:**

```
┌─────────────────────────────────────────────────────────────┐
│  🔵 Direct Chat - Sarah M. (Professional)                  │
│  Service: Balayage Highlights | Dec 15, 10:00 AM           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [System Message]                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ℹ️ This chat is for coordination.                   │   │
│  │ Use quick prompts for common messages.              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Quick Prompts]                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ On my│ │ 5 min│ │ Just │ │Running│                      │
│  │ way! │ │ out  │ │ got  │ │ late │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                             │
│  [Model Messages]                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ On my way! Should be there in 10 minutes.           │   │
│  │ 9:50 AM                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Your Messages]                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Great! See you soon. I'm at the front desk.         │   │
│  │ 9:51 AM                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type your message...                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Send]                                                     │
│                                                             │
│  ⏰ Chat closes in 1 hour 30 minutes                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Mockup 5: Chat Status Indicators

### **Different States Users See:**

```
┌─────────────────────────────────────────────────────────────┐
│  Chat Status Indicators                                     │
│                                                             │
│  ⏳ Pending (Not Yet Open)                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 Direct Chat - Sarah M.                            │   │
│  │ Opens in 23 hours                                    │   │
│  │ [View Booking Details]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🟢 Active (Open Now)                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Support Chat - Modeled                            │   │
│  │ Active now                                           │   │
│  │ [Open Chat]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔴 Closed (Time Window Passed)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Direct Chat - Emma J.                            │   │
│  │ Closed (30 minutes after appointment)                │   │
│  │ [View Chat History]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Mockup 6: Mobile View (Chat List)

### **Mobile-Friendly Chat List:**

```
┌─────────────────────────────┐
│  💬 My Chats                 │
│                              │
│  ┌─────────────────────────┐ │
│  │ 🟢 Support - Modeled    │ │
│  │ Balayage Highlights     │ │
│  │ Dec 15, 10:00 AM        │ │
│  │ Active now              │ │
│  │ [Open]                  │ │
│  └─────────────────────────┘ │
│                              │
│  ┌─────────────────────────┐ │
│  │ 🔵 Direct - Sarah M.    │ │
│  │ Balayage Highlights     │ │
│  │ Dec 15, 10:00 AM        │ │
│  │ Opens in 23h            │ │
│  │ [View]                  │ │
│  └─────────────────────────┘ │
│                              │
│  ┌─────────────────────────┐ │
│  │ 🔴 Direct - Emma J.    │ │
│  │ Color Correction        │ │
│  │ Dec 14, 2:00 PM         │ │
│  │ Closed                  │ │
│  │ [History]               │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 🎨 Mockup 7: Notification Badge

### **When Chat Opens, Users Get Notification:**

```
┌─────────────────────────────────────────────────────────────┐
│  🔔 Notification                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💬 Support Chat is now open!                        │   │
│  │                                                      │   │
│  │ Your support chat for "Balayage Highlights"         │   │
│  │ is now active. You can ask Modeled any questions.   │   │
│  │                                                      │   │
│  │ [Open Chat]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 Direct Chat is now open!                         │   │
│  │                                                      │   │
│  │ Your direct chat with "Sarah M." is now active.     │   │
│  │ You can coordinate arrival and updates.              │   │
│  │                                                      │   │
│  │ [Open Chat]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Key UI Elements

### **1. Chat Status Badge:**
- 🟢 Green = Active (open now)
- ⏳ Gray = Pending (opens in X hours)
- 🔴 Red = Closed (time window passed)

### **2. Chat Type Icons:**
- 🟢 Green circle = Support Chat (Modeled)
- 🔵 Blue circle = Direct Chat (Pro ↔ Model)

### **3. Quick Prompts (Direct Chat Only):**
- "On my way!"
- "5 mins out"
- "Just got off subway"
- "Running late"

### **4. Time Indicators:**
- "Opens in 23 hours"
- "Active now"
- "Closes in 1 hour 30 minutes"
- "Closed (30 minutes after appointment)"

---

## 🎯 User Experience Flow

### **Before Appointment (24h):**
1. User gets notification: "Support Chat is now open!"
2. User can click to open support chat
3. User sees countdown: "Direct Chat opens in 23 hours"

### **1 Hour Before Appointment:**
1. User gets notification: "Direct Chat is now open!"
2. User can click to open direct chat
3. User sees quick prompts for common messages

### **During Appointment:**
1. Both chats remain active
2. Users can switch between support and direct chat
3. Quick prompts available in direct chat

### **30 Minutes After Appointment:**
1. Both chats close automatically
2. Users see "Chat closed" message
3. Users can view chat history

---

## ✅ Design Decisions

1. **Separate Chat Types:** Clear visual distinction between support and direct chat
2. **Status Indicators:** Always show when chat opens/closes
3. **Quick Prompts:** Make coordination easy with one-tap messages
4. **Notifications:** Alert users when chats open
5. **Mobile-Friendly:** Responsive design for all devices

---

**Status:** Ready for Review  
**Next:** Implement after approval

