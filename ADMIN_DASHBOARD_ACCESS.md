# 🔐 Admin Dashboard Access

## 📍 How to Access

**URL:** `http://localhost:5173/admin` (or your deployed URL + `/admin`)

**Direct Link:**
- Local: http://localhost:5173/admin
- Production: https://your-domain.com/admin

---

## ✅ What You Should See

### **Dashboard Overview:**
- 📊 Stats cards (Models, Professionals, Pending Requests, Bookings)
- 📈 Top performers
- 📋 Recent activity
- 🎯 Quick actions

### **Navigation Menu:**
- **Overview:** Dashboard, Trends, Revenue
- **People:** Models, Professionals, Salons
- **Matching:** Request Queue, Match Engine, Match Approval
- **Bookings:** All Bookings, Calendar, Waitlist
- **Offerings:** Services, Packages
- **Onboarding & Training:** Pro Onboarding, Training
- **Media:** Photos, Videos
- **Analytics:** Various analytics pages
- **System:** Monitoring, Performance, etc.

---

## 🚨 Troubleshooting

### **If Dashboard is Blank/Not Loading:**

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red error messages
   - Tell me what errors you see

2. **Check Network Tab**
   - Press F12 → Network tab
   - Refresh page
   - Look for failed requests (red)
   - Check if API calls are working

3. **Check Authentication**
   - Make sure you're logged in
   - Make sure your user is in "Admin" group in Cognito
   - Try logging out and back in

4. **Check Route**
   - URL should be exactly: `/admin`
   - Not `/admin/` (trailing slash)
   - Not `/admin/dashboard`

---

## 🔧 Quick Fixes

### **If You See "Loading..." Forever:**
- Check if `Dashboard.jsx` has errors
- Check browser console for errors
- Try refreshing the page

### **If You See "Access Denied":**
- Your user needs to be in "Admin" group
- Check Cognito User Pool → Groups → Admin
- Add your user to Admin group

### **If Dashboard Shows But No Data:**
- Check if database queries are working
- Check CloudWatch logs
- Verify Amplify is configured correctly

---

## 📋 Admin Dashboard Features

### **Stats Cards:**
- Total Models (from ModelProfile table)
- Total Professionals (from Professional table)
- Pending Requests (from ModelRequest table)
- Total Bookings (from Booking table)

### **Top Performers:**
- Models with most bookings
- Professionals with most requests
- Calculated from real database data

### **Quick Actions:**
- View pending requests
- Run matching engine
- Approve matches
- View bookings

---

## 🎯 Direct Links to Key Pages

- **Dashboard:** `/admin`
- **Request Queue:** `/admin/requests`
- **Match Engine:** `/admin/matching`
- **Match Approval:** `/admin/match-approval`
- **Models:** `/admin/models`
- **Professionals:** `/admin/professionals`
- **Bookings:** `/admin/bookings`
- **Calendar:** `/admin/calendar`

---

## 💡 Pro Tips

1. **Bookmark:** Save `/admin` as a bookmark
2. **Shortcut:** Type `/admin` in address bar after your domain
3. **Navigation:** Use the sidebar menu to navigate between pages

---

**If you still can't access it, tell me:**
- What URL you're trying
- What you see (blank page? error? loading?)
- Any error messages in console (F12)

I'll help you fix it! 🚀

