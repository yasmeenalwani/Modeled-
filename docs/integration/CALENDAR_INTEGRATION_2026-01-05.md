# Calendar Integration Guide 📅

## Current Status

**No calendar is currently connected.** The system has placeholder fields in the database (`modelCalendarEventId`, `professionalCalendarEventId`) but no actual integration.

---

## ✅ What's Now Available

### **Universal iCal File Generation**
- Works with **any calendar app** (Google, Outlook, Apple, etc.)
- Users download a `.ics` file
- Can be imported into any calendar

### **Quick Add Links**
- **Google Calendar**: Opens Google Calendar with pre-filled event
- **Outlook Calendar**: Opens Outlook with pre-filled event
- **Apple Calendar**: Downloads iCal file (works on macOS/iOS)

---

## 🎯 How It Works

### For Users (Models & Professionals)

When a booking is confirmed, they can:

1. **Click "Add to Calendar" button**
2. **Choose their calendar**:
   - Google Calendar (opens in new tab)
   - Outlook Calendar (opens in new tab)
   - Download .ics file (works with any calendar)

The event includes:
- Service type
- Date & time
- Location
- Description
- 24-hour reminder

---

## 💻 Usage

### In Booking Confirmation Email

Add to your email template:

```html
<a href="[GOOGLE_CALENDAR_URL]">Add to Google Calendar</a>
<a href="[OUTLOOK_CALENDAR_URL]">Add to Outlook</a>
<a href="[ICAL_DOWNLOAD_URL]">Download .ics file</a>
```

### In React Components

```javascript
import AddToCalendar from '../components/AddToCalendar';

<AddToCalendar 
  booking={booking} 
  userType="model" 
/>
```

### Programmatically

```javascript
import { 
  downloadICalFile, 
  generateGoogleCalendarUrl,
  createCalendarEventFromBooking 
} from '../utils/calendar';

// Create event from booking
const event = createCalendarEventFromBooking(booking, 'model');

// Download iCal file
downloadICalFile(event, 'appointment.ics');

// Get Google Calendar URL
const googleUrl = generateGoogleCalendarUrl(event);
```

---

## 🔄 Future: Full Calendar Sync

For **two-way sync** (automatic event creation), you'll need:

### Option 1: Google Calendar API
- Requires OAuth setup
- Users grant permission
- Events created automatically
- Updates sync both ways

### Option 2: Microsoft Graph API (Outlook)
- Requires OAuth setup
- Users grant permission
- Events created automatically
- Updates sync both ways

### Option 3: Calendly/Cal.com Integration
- Third-party service
- Handles OAuth for you
- Built-in booking system
- More expensive

---

## 📋 Current Implementation

### What Works Now ✅
- ✅ iCal file generation (universal)
- ✅ Google Calendar quick-add links
- ✅ Outlook Calendar quick-add links
- ✅ Apple Calendar support (via iCal)
- ✅ Event details (title, description, location, time)
- ✅ 24-hour reminder included

### What's Not Connected Yet ⏳
- ⏳ Automatic event creation (requires OAuth)
- ⏳ Two-way sync (requires API integration)
- ⏳ Calendar event updates when booking changes
- ⏳ Calendar event deletion when booking cancelled

---

## 🚀 Next Steps (If You Want Full Sync)

### For Google Calendar:
1. Set up Google Cloud Project
2. Enable Calendar API
3. Set up OAuth 2.0
4. Store user tokens securely
5. Create events via API

### For Outlook:
1. Set up Azure App Registration
2. Enable Microsoft Graph API
3. Set up OAuth 2.0
4. Store user tokens securely
5. Create events via API

**Estimated Time**: 4-8 hours per calendar provider

---

## 💰 Cost

### Current Solution (iCal Files)
- **Free** - No API costs
- **No OAuth setup needed**
- **Works with all calendars**

### Full API Integration
- **Google Calendar API**: Free (generous limits)
- **Microsoft Graph API**: Free (generous limits)
- **OAuth setup**: Free
- **Storage for tokens**: Minimal DynamoDB cost

---

## ✅ Recommendation

**Start with iCal files** (current implementation):
- ✅ Works immediately
- ✅ No setup required
- ✅ Works with all calendars
- ✅ Users can add events manually

**Add full sync later** if needed:
- When you have more users
- When automatic sync becomes critical
- When you have time for OAuth setup

---

## 📚 Resources

- [iCal Specification](https://icalendar.org/)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [RFC 5545 (iCalendar)](https://tools.ietf.org/html/rfc5545)

---

**Current Status**: ✅ iCal file generation ready to use!

**Next**: Add `<AddToCalendar />` component to booking confirmation pages.

