# Partner Portal - Consolidation & Page Build Plans

## 📋 TABLE OF CONTENTS
1. [Consolidation Strategy](#consolidation-strategy)
2. [Service Menu Page](#service-menu-page)
3. [Compliance Page](#compliance-page)
4. [Training Progress Page](#training-progress-page)
5. [Bookings Page](#bookings-page)
6. [Invoices Page](#invoices-page)
7. [Marketing Assets Page](#marketing-assets-page)

---

## 🔄 CONSOLIDATION STRATEGY

### Current Structure (15 navigation items)
- **Overview**: Dashboard
- **Business**: Salon Profile, Service Menu, Compliance
- **Team**: Team Roster, Training Progress
- **Operations**: Calendar, Bookings
- **Growth**: Campaigns, Model Conversions
- **Financial**: Financials, Invoices
- **Support**: Chat Support, Marketing Assets

### Proposed Consolidated Structure (10 navigation items)

#### 1. **Dashboard** (unchanged)
- Main overview page

#### 2. **Salon Profile** (unchanged)
- Business info, settings, branding

#### 3. **Service Menu** (NEW - build out)
- Manage services, pricing, availability

#### 4. **My Team** (CONSOLIDATED: Roster + Training)
- **Tab 1: Team Roster**
  - Team member list with roles, status, contact info
  - Add/remove team members
  - Quick stats (total members, active, on leave)
- **Tab 2: Training Progress**
  - Training dashboard for all team members
  - Progress tracking, certifications, completion rates
  - Filter by member, training type, status
  - Quick actions: Assign training, view certificates

#### 5. **My Schedule** (CONSOLIDATED: Calendar + Bookings)
- **Tab 1: Calendar View**
  - Month/week/day views
  - Color-coded by status (pending, confirmed, completed)
  - Filter by professional, service type, status
  - Quick add booking button
- **Tab 2: Bookings List**
  - All bookings in chronological list
  - Filter/search by model, pro, service, date range, status
  - Bulk actions (confirm, cancel, reschedule)
  - Status badges and quick actions
- **Tab 3: Pending Actions**
  - Urgent items requiring attention
  - Booking requests, cancellations, changes
  - Quick approve/reject buttons

#### 6. **Campaigns** (unchanged)
- Marketing campaigns management

#### 7. **Model Conversions** (unchanged)
- Conversion tracking and analytics

#### 8. **Financials** (CONSOLIDATED: Financials + Invoices)
- **Tab 1: Overview**
  - Revenue dashboard, trends, projections
  - Key metrics (MTD revenue, pending payments, etc.)
- **Tab 2: Invoices**
  - Invoice list with filters (status, date range, amount)
  - Create new invoice
  - View/download invoices
  - Payment tracking
  - Export options

#### 9. **Compliance** (NEW - build out)
- Licenses, insurance, certifications
- Expiration tracking, renewal reminders

#### 10. **Support** (CONSOLIDATED: Chat + Marketing Assets)
- **Tab 1: Chat Support**
  - Communication with Modeled team
- **Tab 2: Marketing Assets**
  - Logos, templates, brand materials
  - Download library

---

## 📝 PAGE SPECIFICATIONS

### 1. SERVICE MENU PAGE

#### Purpose
Manage salon services, pricing, availability, and service categories.

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ Header: "Service Menu" + Add Service Btn│
├─────────────────────────────────────────┤
│ Stats Row: Total Services, Active, etc.  │
├─────────────────────────────────────────┤
│ Filters: Category, Status, Search        │
├─────────────────────────────────────────┤
│ Service List/Grid                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Service  │ │ Service  │ │ Service  ││
│ │ Card     │ │ Card     │ │ Card     ││
│ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Service Cards**
   - Service name, category, duration, price
   - Status badge (Active/Inactive)
   - Quick actions: Edit, Duplicate, Archive
   - Service description preview

2. **Add/Edit Service Modal**
   - Service name
   - Category (Haircut, Color, Styling, Treatment, etc.)
   - Description
   - Duration (minutes)
   - Base price
   - Model discount % (if applicable)
   - Active/Inactive toggle
   - Service image upload (optional)

3. **Filters & Search**
   - Search by name
   - Filter by category
   - Filter by status (Active/Inactive)
   - Sort by: Name, Price, Duration, Created Date

4. **Bulk Actions**
   - Activate/Deactivate multiple services
   - Export service list
   - Duplicate service

5. **Stats Dashboard**
   - Total services
   - Active services
   - Average price
   - Most popular service

#### Data Model
```javascript
{
  id: string,
  name: string,
  category: string,
  description: string,
  duration: number, // minutes
  basePrice: number,
  modelDiscount: number, // percentage
  isActive: boolean,
  imageUrl?: string,
  createdAt: date,
  updatedAt: date
}
```

#### Integration Points
- Links to Bookings (services appear in booking flow)
- Links to Financials (revenue by service)
- Links to Campaigns (can feature services in campaigns)

---

### 2. COMPLIANCE PAGE

#### Purpose
Track licenses, insurance, certifications, and compliance documents with expiration alerts.

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ Header: "Compliance" + Add Document Btn │
├─────────────────────────────────────────┤
│ Alert Banner: Expiring Soon Items       │
├─────────────────────────────────────────┤
│ Stats: Total Docs, Expiring, Expired   │
├─────────────────────────────────────────┤
│ Document Categories Tabs               │
│ [All] [Licenses] [Insurance] [Certs]   │
├─────────────────────────────────────────┤
│ Document List                           │
│ ┌─────────────────────────────────────┐│
│ │ Document Card                        ││
│ │ Name, Type, Exp Date, Status Badge  ││
│ │ View | Edit | Renew                 ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Document Cards**
   - Document name/type
   - Issue date, expiration date
   - Status badge (Valid, Expiring Soon, Expired)
   - Days until expiration countdown
   - Uploaded file preview/download
   - Quick actions: View, Edit, Renew, Delete

2. **Add/Edit Document Modal**
   - Document type (License, Insurance, Certification, Other)
   - Document name
   - Issuing organization
   - Issue date
   - Expiration date
   - File upload (PDF, image)
   - Notes/description
   - Auto-renewal toggle (if applicable)

3. **Alert System**
   - Banner for documents expiring in <30 days
   - Color-coded status (green: valid, yellow: expiring, red: expired)
   - Email reminder settings

4. **Filters & Search**
   - Filter by type
   - Filter by status
   - Search by name/organization
   - Sort by expiration date

5. **Stats Dashboard**
   - Total documents
   - Expiring soon count
   - Expired count
   - Compliance score (%)

#### Data Model
```javascript
{
  id: string,
  type: 'license' | 'insurance' | 'certification' | 'other',
  name: string,
  issuingOrganization: string,
  issueDate: date,
  expirationDate: date,
  fileUrl: string,
  notes?: string,
  autoRenewal: boolean,
  reminderDays: number, // days before expiration to remind
  status: 'valid' | 'expiring' | 'expired',
  createdAt: date,
  updatedAt: date
}
```

#### Integration Points
- Links to Salon Profile (compliance status shown)
- Admin can view partner compliance status
- Auto-alerts to salon owner and Modeled admin

---

### 3. TRAINING PROGRESS PAGE

#### Purpose
Track team training progress, certifications, and completion rates. (Part of consolidated "My Team" page)

#### Layout Structure (Tab 2 of "My Team")
```
┌─────────────────────────────────────────┐
│ Tab Navigation: [Roster] [Training]     │
├─────────────────────────────────────────┤
│ Training Overview Stats                  │
│ Total Hours | Avg Completion | Certs    │
├─────────────────────────────────────────┤
│ Filters: Member, Training Type, Status  │
├─────────────────────────────────────────┤
│ Training Modules List                    │
│ ┌─────────────────────────────────────┐│
│ │ Module Card                          ││
│ │ Name, Hours, Progress Bar, Status   ││
│ │ Team Members: [Avatars]              ││
│ │ View Details | Assign               ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Training Module Cards**
   - Module name and description
   - Total hours required
   - Completion rate (team average)
   - Status badges (Available, In Progress, Completed)
   - Assigned team members (avatars)
   - Quick actions: View Details, Assign to Team

2. **Module Detail View**
   - Module overview
   - Team member progress list
   - Individual progress bars
   - Completion dates
   - Certificates issued

3. **Assign Training Modal**
   - Select training module
   - Select team members (multi-select)
   - Set deadline (optional)
   - Add notes

4. **Filters & Search**
   - Filter by team member
   - Filter by training type (Haircut, Color, Styling, etc.)
   - Filter by status (Not Started, In Progress, Completed)
   - Search by module name

5. **Stats Dashboard**
   - Total training hours completed
   - Average completion rate
   - Certifications earned
   - Team members certified

#### Data Model
```javascript
{
  id: string,
  moduleName: string,
  description: string,
  category: string,
  hoursRequired: number,
  teamMembers: [{
    memberId: string,
    memberName: string,
    progress: number, // percentage
    hoursCompleted: number,
    completedAt?: date,
    certificateUrl?: string
  }],
  status: 'available' | 'in-progress' | 'completed',
  createdAt: date
}
```

#### Integration Points
- Links to Team Roster (training status on member cards)
- Links to Dashboard (training progress widget)
- Admin can view all partner training progress

---

### 4. BOOKINGS PAGE

#### Purpose
View and manage all salon bookings. (Part of consolidated "My Schedule" page)

#### Layout Structure (Tab 2 of "My Schedule")
```
┌─────────────────────────────────────────┐
│ Tab Navigation: [Calendar] [List] [Pending]│
├─────────────────────────────────────────┤
│ Quick Stats: Today, This Week, Pending  │
├─────────────────────────────────────────┤
│ Filters: Date Range, Status, Pro, Model│
│ Search Bar                              │
├─────────────────────────────────────────┤
│ Bookings List                           │
│ ┌─────────────────────────────────────┐│
│ │ Booking Card                         ││
│ │ Date | Time | Service | Model | Pro ││
│ │ Status Badge | Quick Actions         ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Booking Cards**
   - Date and time
   - Service name
   - Model name (with avatar)
   - Professional name (with avatar)
   - Status badge (Pending, Confirmed, Completed, Cancelled)
   - Quick actions: Confirm, Cancel, Reschedule, View Details

2. **Booking Detail Modal**
   - Full booking information
   - Model contact info
   - Professional assigned
   - Service details and pricing
   - Notes/requests
   - History (status changes, cancellations)
   - Actions: Confirm, Cancel, Reschedule, Edit

3. **Bulk Actions**
   - Select multiple bookings
   - Bulk confirm
   - Bulk cancel
   - Export list

4. **Filters & Search**
   - Date range picker
   - Filter by status
   - Filter by professional
   - Filter by service type
   - Search by model name

5. **Quick Stats**
   - Bookings today
   - Bookings this week
   - Pending confirmations
   - Cancellation rate

#### Data Model
```javascript
{
  id: string,
  date: date,
  time: string,
  serviceId: string,
  serviceName: string,
  modelId: string,
  modelName: string,
  professionalId: string,
  professionalName: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string,
  price: number,
  modelDiscount: number,
  finalPrice: number,
  createdAt: date,
  updatedAt: date
}
```

#### Integration Points
- Links to Calendar (same data, different view)
- Links to Financials (booking revenue)
- Links to Model Conversions (track model journey)

---

### 5. INVOICES PAGE

#### Purpose
Manage invoices, payments, and billing. (Part of consolidated "Financials" page)

#### Layout Structure (Tab 2 of "Financials")
```
┌─────────────────────────────────────────┐
│ Tab Navigation: [Overview] [Invoices]    │
├─────────────────────────────────────────┤
│ Stats: Total, Paid, Pending, Overdue    │
├─────────────────────────────────────────┤
│ Filters: Status, Date Range, Amount     │
│ Search Bar                              │
├─────────────────────────────────────────┤
│ Invoice List                             │
│ ┌─────────────────────────────────────┐│
│ │ Invoice Card                         ││
│ │ Invoice # | Date | Amount | Status  ││
│ │ View | Download | Mark Paid         ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Invoice Cards**
   - Invoice number
   - Date issued
   - Amount
   - Status badge (Draft, Sent, Paid, Overdue)
   - Due date
   - Quick actions: View, Download PDF, Mark Paid, Edit

2. **Create Invoice Modal**
   - Invoice number (auto-generated)
   - Date issued
   - Due date
   - Line items (service, quantity, rate, amount)
   - Add line item button
   - Subtotal, tax, total
   - Notes
   - Send to email (optional)

3. **Invoice Detail View**
   - Full invoice details
   - Line items table
   - Payment history
   - Download PDF
   - Mark as paid
   - Send reminder

4. **Filters & Search**
   - Filter by status
   - Date range picker
   - Search by invoice number
   - Sort by: Date, Amount, Status

5. **Stats Dashboard**
   - Total invoices
   - Paid amount
   - Pending amount
   - Overdue amount
   - Average payment time

#### Data Model
```javascript
{
  id: string,
  invoiceNumber: string,
  dateIssued: date,
  dueDate: date,
  lineItems: [{
    description: string,
    quantity: number,
    rate: number,
    amount: number
  }],
  subtotal: number,
  tax: number,
  total: number,
  status: 'draft' | 'sent' | 'paid' | 'overdue',
  notes?: string,
  paidAt?: date,
  paymentMethod?: string,
  createdAt: date,
  updatedAt: date
}
```

#### Integration Points
- Links to Financials Overview (invoice totals)
- Links to Bookings (can generate invoice from booking)
- Export to accounting software (CSV, PDF)

---

### 6. MARKETING ASSETS PAGE

#### Purpose
Access Modeled brand assets, templates, and marketing materials. (Part of consolidated "Support" page)

#### Layout Structure (Tab 2 of "Support")
```
┌─────────────────────────────────────────┐
│ Tab Navigation: [Chat] [Assets]         │
├─────────────────────────────────────────┤
│ Asset Categories                         │
│ [All] [Logos] [Templates] [Photos] [Social]│
├─────────────────────────────────────────┤
│ Asset Grid                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Asset    │ │ Asset    │ │ Asset    ││
│ │ Preview  │ │ Preview  │ │ Preview  ││
│ │ Download │ │ Download │ │ Download ││
│ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
```

#### Key Features
1. **Asset Cards**
   - Asset preview (thumbnail)
   - Asset name
   - Category badge
   - File type and size
   - Download button
   - Preview button (for images)

2. **Asset Categories**
   - Logos (PNG, SVG, color variations)
   - Templates (email, social media, flyers)
   - Photos (stock photos, lifestyle images)
   - Social Media (Instagram, Facebook templates)
   - Brand Guidelines (PDF)

3. **Search & Filter**
   - Search by name
   - Filter by category
   - Filter by file type
   - Sort by: Name, Date Added, File Size

4. **Download Options**
   - Direct download
   - Download all in category (ZIP)
   - Preview before download

5. **Brand Guidelines Section**
   - Color palette
   - Typography
   - Logo usage rules
   - Do's and Don'ts

#### Data Model
```javascript
{
  id: string,
  name: string,
  category: 'logo' | 'template' | 'photo' | 'social' | 'guidelines',
  fileType: string,
  fileSize: number,
  fileUrl: string,
  thumbnailUrl?: string,
  description?: string,
  tags: string[],
  createdAt: date
}
```

#### Integration Points
- Links to Campaigns (use assets in campaigns)
- Links to Salon Profile (upload custom branded assets)
- Admin manages asset library

---

## 🎨 DESIGN CONSISTENCY

### Color Scheme
- Primary: `#58a6ff` (blue - matches partner portal theme)
- Success: `#3fb950` (green)
- Warning: `#d29922` (yellow)
- Error: `#f85149` (red)
- Background: `rgba(22,27,34,0.8)` (dark card)
- Border: `rgba(48,54,61,0.8)` (subtle border)

### Typography
- Headers: `font-weight: 600`
- Body: `font-size: 0.9rem`
- Labels: `font-size: 0.8rem`, `color: rgba(255,255,255,0.5)`

### Components Reused
- Stats cards (from Dashboard)
- Filter buttons (from existing pages)
- Modal components
- Status badges
- Progress bars

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: Consolidation (High Priority)
1. My Team (Roster + Training)
2. My Schedule (Calendar + Bookings)
3. Financials (Overview + Invoices)
4. Support (Chat + Assets)

### Phase 2: New Pages (Medium Priority)
1. Service Menu
2. Compliance
3. Training Progress (as part of My Team)

### Phase 3: Enhancements (Lower Priority)
1. Advanced filtering
2. Export features
3. Bulk actions
4. Analytics dashboards

---

## ✅ READY TO BUILD?

**Consolidation**: 4 consolidated pages
**New Pages**: 6 new pages
**Total Work**: 10 pages/components

Would you like me to:
- Build all at once (full flow and integration)?
- Build page by page (easier to review)?
- Start with consolidation first, then new pages?

Let me know and I'll start building! 🚀

