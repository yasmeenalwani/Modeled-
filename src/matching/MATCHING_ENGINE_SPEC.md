# 🎯 MODELED MATCHING ENGINE SPECIFICATION

## Overview

The Modeled Matching Engine is a sophisticated, multi-factor scoring system that connects models with professional requests. It combines **attribute matching**, **agentic learning scores**, and **service-specific optimizations** to produce intelligent, fair matches.

---

## 🧮 Score Composition

The final match score (0-100) is composed of:

| Component | Weight | Description |
|-----------|--------|-------------|
| **Attribute Match** | 40% | How well model's physical attributes match the request |
| **Agentic Learning** | 35% | Dynamic scores based on behavior and feedback |
| **Location** | 15% | Distance/logistics convenience |
| **Availability** | 10% | Schedule alignment |

---

## 📋 Match Types

### DIRECT MATCH
Must match exactly or within close range. Used for critical criteria.
- Hair Length ✂️
- Services Available 💇
- Location 📍
- Hair Volume / Curl pattern
- Allergies ⚠️ (dealbreaker)

### INDIRECT MATCH
Similar values can score partially. Allows for flexibility.
- Hair Color 🎨 (blonde ≈ light brown)
- Hair Texture 〰️ (wavy ≈ curly)
- Hair Density

### IF REQUESTED
Only factors in if the professional specifically asks for it.
- Virgin Hair (critical for color)
- Age Range
- Skin Tone
- Eye Color
- Open to Change

### NO MATCH
Not used for matching - profile/identification only.
- Name, Contact, Socials
- Experience, Events, Content preferences
- Photos (viewed manually)

---

## 🧠 Agentic Learning Scores

These scores **evolve over time** based on model behavior. They reward good behavior and help you identify your best models.

### 1. RELIABILITY SCORE (20% of agentic)

Measures consistency and dependability.

| Factor | Weight | What It Tracks |
|--------|--------|----------------|
| Show Up Rate | 35% | Attends scheduled appointments |
| On Time Rate | 25% | Arrives within grace period |
| Cancellation Penalty | 20% | Last-minute cancellations (NEGATIVE) |
| Response Time | 10% | How fast they respond to requests |
| Instruction Following | 10% | Follows pre-appointment prep |

**Special Rules:**
- Requires 3+ bookings before score is reliable
- Decays 5% per month of inactivity
- No-shows cause -20 point penalty

### 2. FEEDBACK SCORE (25% of agentic)

Average ratings from professionals after appointments.

| Factor | Weight | Scale |
|--------|--------|-------|
| Overall Rating | 30% | 1-5 stars |
| Cooperation | 20% | How easy to work with |
| Communication | 15% | Clear and responsive |
| Professionalism | 15% | Demeanor and attitude |
| Photo Quality | 10% | After-photos submitted |
| Would Book Again | 10% | Y/N from professional |

**Special Rules:**
- Recent feedback weighted 70% more than old
- First feedback sets initial score

### 3. EXPERIENCE SCORE (15% of agentic)

Platform tenure and variety.

| Bookings | Score | Label |
|----------|-------|-------|
| 0-2 | 20 | New |
| 3-5 | 40 | Getting Started |
| 6-10 | 60 | Experienced |
| 11-20 | 80 | Veteran |
| 21+ | 100 | Elite |

**Bonus factors:**
- Service variety (+25%)
- Months on platform (+20%)
- Repeat bookings from same pro (+15%)

### 4. ENGAGEMENT SCORE (15% of agentic)

Profile quality and activity.

| Factor | Weight |
|--------|--------|
| Profile Completeness | 25% |
| Photo Count | 20% |
| Photo Recency | 15% |
| Response Rate | 20% |
| Last Active | 10% |
| Quiz Completion | 10% |

### 5. COMPATIBILITY SCORE (25% of agentic)

Dynamic per request - measures historical success.

| Factor | Weight |
|--------|--------|
| Same Service Success Rate | 35% |
| Previously Worked with This Pro | 20% |
| Similar Pro Experience Level Success | 15% |
| Time Slot Preference Match | 15% |
| Location Convenience | 15% |

---

## 💇 Service-Specific Weights

Different services prioritize different attributes!

### ✂️ Haircut
- Hair Length: **1.5x** (critical)
- Hair Texture: **1.3x**
- Hair Density: **1.2x**
- Hair Color: 0.5x (less important)
- Virgin Hair: 0.3x (not relevant)

### 🎨 Color
- Hair Condition: **2.0x** (CRITICAL)
- Virgin Hair: **2.0x** (CRITICAL)
- Allergies: **2.0x** (SAFETY)
- Hair Color: **1.5x**
- Reliability: **1.2x** (long appointments)

### 🌟 Highlights
- Hair Color: **1.8x** (very important)
- Hair Condition: **1.5x**
- Virgin Hair: **1.5x**
- Hair Length: **1.3x**
- Reliability: **1.3x** (long process)

### 💨 Blowdry
- Hair Texture: **1.5x** (key for technique)
- Hair Length: **1.4x**
- Hair Volume: **1.3x**
- Hair Curl: **1.2x**
- Hair Color: 0.3x (doesn't matter)
- Experience requirement: **0.7x** (good for new models)

### ✨ Gloss
- Hair Condition: **1.5x**
- Hair Color: **1.2x**
- Balanced otherwise

### 💎 Keratin
- Hair Texture: **1.8x** (curly/frizzy ideal)
- Hair Curl: **1.5x**
- Hair Condition: **1.5x** (damaged OK)
- Allergies: **2.0x** (formaldehyde)
- Reliability: **1.4x** (very long process)
- Experience: **1.3x** (need patient models)

---

## ⚠️ Dealbreakers

These cause an **automatic 0 score**:

1. **Allergies** - If model has allergies and service involves chemicals
2. **Service Not Offered** - Model hasn't opted into that service type
3. **Blocked** - Model or pro has blocked each other

---

## 📊 Score Interpretation

| Score | Label | Action |
|-------|-------|--------|
| 90-100 | ⭐ Perfect Match | Send first, highlight in queue |
| 75-89 | ✓ Strong Match | High priority, good candidate |
| 50-74 | Potential Match | Review manually, may need tweaks |
| 30-49 | Weak Match | Only if desperate for candidates |
| <30 | Not Recommended | Don't show to professionals |

---

## 🔄 Score Update Events

Scores update automatically based on:

| Event | What Updates |
|-------|--------------|
| Booking Completed | Reliability, Experience, Compatibility |
| Feedback Submitted | Feedback score |
| Cancellation | Reliability (-20 penalty) |
| Profile Update | Engagement |
| Login/Activity | Engagement (last active) |
| Photo Upload | Engagement (photo count) |
| 30 Days Inactive | All scores decay 5% |

---

## 🎛️ Admin Controls (Future)

Yasmeen will be able to:

1. **Adjust weights** per service type
2. **Override scores** for specific models
3. **Set minimum thresholds** per request
4. **Blacklist/whitelist** model-pro combinations
5. **Boost/demote** models in matching
6. **View score history** and trends

---

## 📈 Analytics (Future)

Track matching performance:

- Match-to-booking conversion rate
- Average scores of successful bookings
- Which factors predict success best
- Model score improvement over time
- Service-specific success patterns

---

## 🚀 Implementation Status

- [x] Core matching algorithm
- [x] Agentic score definitions
- [x] Service-specific weights
- [x] Mock data for testing
- [ ] Database integration
- [ ] Real-time score updates
- [ ] Admin weight controls
- [ ] Analytics dashboard
- [ ] A/B testing framework

