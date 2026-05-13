# 2-Week Core MVP Focus

**Goal:** Get platform up and running ASAP for April 1 launch (5–10 stylists + models)

**Principle:** No new features. Only core functional elements needed for: **Sign up → Onboard → Match → Book → Complete**

---

## Week 1: Backend + Data

### 1. Onboarding → Database
- [ ] Model onboarding saves to `ModelProfile` (real create, not TODO)
- [ ] Professional onboarding saves to `Professional`
- [ ] Partner onboarding saves to `Partner` (inquiry form)
- [ ] Verify data in DynamoDB

### 2. Photo Upload + Analysis
- [ ] Photo upload to S3 works
- [ ] S3 keys/URLs stored in profile
- [ ] Photo-analysis Lambda runs (S3 trigger or manual)
- [ ] Auto-tagged attributes written to ModelProfile

### 3. Auth + Redirects
- [ ] Sign-up → onboarding
- [ ] Onboarding complete → portal
- [ ] Login → correct portal by role
- [ ] Protected routes

### 4. Matching → Real Data
- [ ] Replace mock data with real DynamoDB
- [ ] `findMatches()` uses real professionals and models
- [ ] Admin can view/approve matches

---

## Week 2: Portals + Booking

### 5. Model Portal
- [ ] Dashboard loads real data (not mock)
- [ ] Profile loads from DB, edits save
- [ ] Photos display from DB
- [ ] Bookings display (if any)

### 6. Professional Portal
- [ ] Dashboard loads real data
- [ ] Profile loads from DB, edits save
- [ ] Can create requests (or requests display)

### 7. Booking Flow
- [ ] Create booking from approved match
- [ ] Model sees bookings
- [ ] Professional sees bookings
- [ ] Admin manages bookings

### 8. Admin Approval
- [ ] Approve/reject models
- [ ] Approve/reject professionals
- [ ] View requests
- [ ] Approve matches → send booking

---

## Out of Scope (For Later)

- Photo timestamps / freshness badges
- EXIF capture date
- Advanced gamification
- Partner portal (beyond inquiry)
- Real-time chat
- Advanced analytics
- RDS/PostgreSQL analytics (unless critical)

---

## Success Criteria

**Launch-ready when:**
1. Pro can sign up and complete onboarding
2. Model can sign up and complete onboarding (with photos)
3. Admin can approve both
4. Admin can create/approve matches
5. Booking can be created from match
6. Model and Pro can see their bookings

---

## Reference

- Full checklist: [MVP_PRE_DEPLOYMENT_CHECKLIST_2026-01-05.md](MVP_PRE_DEPLOYMENT_CHECKLIST_2026-01-05.md)
- Action plan: [MVP_ACTION_PLAN_2026-01-05.md](MVP_ACTION_PLAN_2026-01-05.md)
