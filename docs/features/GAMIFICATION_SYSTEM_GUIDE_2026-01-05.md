# 🎮 Gamification System Guide

## Overview

The Modeled platform uses **quizzes, points (XP), achievements, and leaderboards** to:
1. **Engage models** and keep them active
2. **Gather insights** about their preferences, style, and personality
3. **Improve matching** by using quiz results in the matching algorithm
4. **Reward good behavior** and platform participation

---

## 🧠 How Quizzes Work

### **Purpose**
Quizzes serve **two main functions**:

1. **User Engagement** 🎯
   - Fun, interactive way to keep models active
   - Earn XP and unlock achievements
   - Compete on leaderboards

2. **Matching Intelligence** 🧬
   - Quiz answers reveal preferences, personality, and style
   - Results are stored and used to improve match scores
   - Helps find better matches based on compatibility

### **Current Quiz Types**

| Quiz | XP | Questions | Purpose |
|------|----|-----------|---------|
| 💇 **Hair Type Detective** | 150 | 12 | Discovers exact hair type, texture, porosity |
| 🎨 **Color Personality** | 200 | 15 | Determines warm/cool tones, color preferences |
| ✨ **Style Finder** | 175 | 10 | Identifies style personality (Bohemian, Classic, Edgy) |
| 🧪 **Damage Detective** | 125 | 8 | Assesses hair damage level |
| ⏰ **Lifestyle Matcher** | 100 | 6 | Determines time commitment and lifestyle fit |
| 🌟 **Risk Taker Quiz** | 150 | 10 | Measures adventurousness (locked until 3 quizzes done) |

### **Quiz Flow**

```
1. Model clicks on quiz card
   ↓
2. Quiz questions displayed (multiple choice, rating scales, etc.)
   ↓
3. Model answers all questions
   ↓
4. Results calculated and stored
   ↓
5. XP awarded immediately
   ↓
6. Quiz results added to model profile (tags, preferences)
   ↓
7. Matching algorithm uses results for better matches
```

---

## ⚡ Points (XP) System

### **How XP is Earned**

| Action | XP Awarded | Frequency |
|--------|------------|-----------|
| Complete a quiz | 100-200 | Per quiz |
| Daily challenge | +100 bonus | Once per day |
| Achievement unlocked | 50-1000 | Per achievement |
| Perfect quiz score | +50 bonus | Per perfect quiz |
| Daily login streak | +25 per day | Consecutive days |
| First booking | +200 | One-time |
| Complete booking | +150 | Per booking |
| Upload photos | +50 | Per 5 photos |
| Profile completion | +100 | One-time |

### **XP Levels**

| Level | XP Required | Badge |
|-------|-------------|-------|
| **Bronze** | 0-500 | 🥉 |
| **Silver** | 501-1,500 | 🥈 |
| **Gold** | 1,501-3,000 | 🥇 |
| **Platinum** | 3,001-5,000 | 💎 |
| **Diamond** | 5,001+ | 👑 |

### **XP Display**

- **Total XP**: Shown in banner at top of Fun Zone
- **Quizzes Done**: Count of completed quizzes
- **Day Streak**: Consecutive days of activity
- **Leaderboard Rank**: Current position

---

## 🏆 Achievements System

### **Current Achievements**

| Achievement | XP | How to Unlock |
|-------------|----|---------------|
| 🎯 **First Quiz** | 50 | Complete your first quiz |
| 🔥 **3 Day Streak** | 100 | Log in 3 days in a row |
| 🧠 **Quick Thinker** | 75 | Complete a quiz in under 5 minutes |
| 💎 **Perfect Score** | 200 | Get 100% on any quiz |
| 🏆 **Quiz Master** | 500 | Complete 10 quizzes |
| 👑 **Legendary** | 1000 | Reach Diamond level |

### **Achievement States**

- **Unlocked** ✅: Visible, colored, shows icon
- **Locked** 🔒: Grayed out, shows lock icon

---

## 📊 Leaderboard

### **How It Works**

- **Ranking**: Based on total XP
- **Tiers**: Bronze, Silver, Gold, Platinum, Diamond
- **Time Period**: Weekly leaderboard (resets every Monday)
- **Top 3**: Special badges (👑🥈🥉)

### **Leaderboard Display**

```
Rank | Name | Level | XP
-----|------|-------|----
1    | Sophie L. | Diamond | 4,250 XP
2    | Isabella M. | Platinum | 3,890 XP
3    | Olivia R. | Gold | 3,120 XP
4    | You! | Gold | 2,450 XP ⭐
5    | Ava T. | Gold | 2,100 XP
```

---

## 🔗 How Quizzes Feed Into Matching

### **Quiz Results → Profile Tags**

When a model completes a quiz, the results are:
1. **Stored** in the `ModelProfile.tags` array
2. **Used** in the matching algorithm's **Engagement Score**
3. **Weighted** at 10% of the Engagement Score component

### **Matching Algorithm Integration**

From `matchingEngine.js`:

```javascript
// Engagement Score (15% of final match score)
engagement: {
  weight: 0.15,
  factors: {
    profileCompleteness: { weight: 0.25 },
    photoCount: { weight: 0.20 },
    photoRecency: { weight: 0.15 },
    responseRate: { weight: 0.20 },
    lastActive: { weight: 0.10 },
    quizCompletion: { weight: 0.10 }, // ← Quiz results here!
  },
}
```

### **Example: How Quiz Results Help Matching**

**Scenario**: Professional requests a model for a "bold color change"

**Model A** (completed Color Personality quiz):
- Quiz result: "Adventurous, open to dramatic changes"
- Tag added: `["color_adventurous", "open_to_change"]`
- **Match boost**: +5 points for compatibility

**Model B** (no quiz completed):
- No preference data
- **Match boost**: 0 points

**Result**: Model A gets higher match score → better chance of being selected

---

## 📋 Data Structure

### **What Gets Stored**

```javascript
// ModelProfile (in DynamoDB)
{
  userId: "user-123",
  // ... other fields ...
  tags: [
    "hair_type_2a",           // From Hair Type quiz
    "color_warm_tones",        // From Color Personality quiz
    "style_bohemian",          // From Style Finder quiz
    "lifestyle_low_maintenance" // From Lifestyle Matcher quiz
  ],
  quizResults: {              // NEW: Need to add this
    "hair_type_detective": {
      completedAt: "2024-01-15T10:30:00Z",
      score: 95,
      answers: { /* quiz answers */ },
      insights: { /* calculated insights */ }
    },
    // ... other quizzes ...
  },
  xp: 2450,                   // Total XP
  level: "Gold",              // Current level
  achievements: [             // Unlocked achievements
    "first_quiz",
    "3_day_streak",
    "quick_thinker"
  ],
  streakDays: 5,              // Current streak
  lastActiveDate: "2024-01-20"
}
```

---

## 🛠️ Implementation Status

### ✅ **What's Built (Frontend)**

- [x] Quiz UI (`ModelGames.jsx`)
- [x] XP display banner
- [x] Achievements grid
- [x] Leaderboard display
- [x] Daily challenge card
- [x] Quiz cards with lock/unlock states

### ❌ **What Needs to Be Built**

#### **1. Backend Schema** (DynamoDB)

**Add to `ModelProfile` in `amplify/data/resource.ts`:**

```typescript
ModelProfile: a.model({
  // ... existing fields ...
  
  // Gamification
  xp: a.integer().default(0),
  level: a.string(), // 'Bronze', 'Silver', 'Gold', etc.
  achievements: a.string().array(),
  streakDays: a.integer().default(0),
  lastActiveDate: a.date(),
  
  // Quiz results
  quizResults: a.json(), // { quizId: { answers, score, insights } }
  completedQuizzes: a.string().array(), // Quiz IDs completed
})
```

#### **2. Quiz Handler Lambda**

**Create `amplify/functions/quiz-handler/resource.ts`:**

```typescript
export const quizHandlerFunction = defineFunction({
  name: 'quizHandler',
  entry: './handler.ts',
  runtime: 20,
});
```

**Handler functions:**
- `submitQuiz(quizId, answers)` - Process quiz, award XP, store results
- `getQuizResults(userId)` - Get all quiz results for a user
- `updateXP(userId, amount, reason)` - Award XP and check for level ups
- `checkAchievements(userId)` - Check if new achievements unlocked
- `getLeaderboard(period)` - Get top users by XP

#### **3. Quiz Questions Data**

**Create `src/data/quizzes.js`:**

```javascript
export const QUIZ_QUESTIONS = {
  hair_type_detective: [
    {
      id: 1,
      question: "What happens when you wash your hair?",
      type: "multiple_choice",
      options: [
        { value: "straight", label: "Stays straight" },
        { value: "slight_wave", label: "Gets slight wave" },
        // ...
      ]
    },
    // ... more questions
  ],
  // ... other quizzes
};
```

#### **4. XP Calculation Logic**

**Create `src/utils/gamification.js`:**

```javascript
export function calculateXPForQuiz(quizId, score, timeTaken) {
  const baseXP = QUIZ_XP[quizId] || 100;
  let totalXP = baseXP;
  
  // Perfect score bonus
  if (score === 100) totalXP += 50;
  
  // Speed bonus (under 5 minutes)
  if (timeTaken < 300) totalXP += 25;
  
  return totalXP;
}

export function calculateLevel(xp) {
  if (xp < 500) return 'Bronze';
  if (xp < 1500) return 'Silver';
  if (xp < 3000) return 'Gold';
  if (xp < 5000) return 'Platinum';
  return 'Diamond';
}

export function checkAchievements(userId, action) {
  // Check if user unlocked new achievements based on action
  // Return array of newly unlocked achievement IDs
}
```

#### **5. Quiz Results Processing**

**Create `src/utils/quizProcessor.js`:**

```javascript
export function processQuizResults(quizId, answers) {
  const insights = {};
  
  switch (quizId) {
    case 'hair_type_detective':
      insights.hairType = determineHairType(answers);
      insights.porosity = determinePorosity(answers);
      insights.tags = [`hair_type_${insights.hairType}`];
      break;
      
    case 'color_personality':
      insights.colorTone = determineColorTone(answers);
      insights.openToChange = answers.riskLevel > 7;
      insights.tags = [`color_${insights.colorTone}`, 
                       insights.openToChange ? 'open_to_change' : null];
      break;
      
    // ... other quizzes
  }
  
  return insights;
}
```

---

## 🎯 User Flow Example

### **Complete Quiz Flow**

```
1. Model navigates to Fun Zone → Sees quiz cards
   ↓
2. Clicks "Hair Type Detective" quiz
   ↓
3. Quiz questions displayed (12 questions)
   ↓
4. Model answers all questions (takes 8 minutes)
   ↓
5. Clicks "Submit Quiz"
   ↓
6. Backend processes:
   - Calculates score: 95%
   - Determines insights: hair_type_2a, medium_porosity
   - Awards XP: 150 base + 50 perfect score = 200 XP
   - Updates tags: ["hair_type_2a", "medium_porosity"]
   - Checks achievements: Unlocks "Perfect Score" (+200 XP)
   - Updates level: Still Gold (2,450 + 200 + 200 = 2,850 XP)
   - Updates streak: Day 6
   ↓
7. Frontend shows:
   - "Quiz Complete! +200 XP"
   - "Achievement Unlocked: Perfect Score! +200 XP"
   - "Total: 2,850 XP"
   ↓
8. Quiz card shows "✓ DONE" badge
   ↓
9. Matching algorithm now uses new tags for better matches
```

---

## 💡 Strategic Benefits

### **For Models**
- ✅ **Fun engagement** - Makes platform more enjoyable
- ✅ **Better matches** - Quiz results improve match quality
- ✅ **Recognition** - Achievements and leaderboard status
- ✅ **Rewards** - XP and achievements feel rewarding

### **For Platform**
- ✅ **Better data** - Quiz results provide rich preference data
- ✅ **Higher engagement** - Gamification increases activity
- ✅ **Improved matching** - More data = better matches
- ✅ **Retention** - Streaks and achievements keep users coming back

---

## 🚀 Next Steps to Implement

1. **Add gamification fields to `ModelProfile` schema**
2. **Create quiz questions data structure**
3. **Build quiz handler Lambda function**
4. **Implement XP calculation and level system**
5. **Create quiz results processor**
6. **Build achievement checker**
7. **Create leaderboard query function**
8. **Connect frontend to backend APIs**
9. **Test quiz flow end-to-end**

---

## 📊 Metrics to Track

- **Quiz completion rate**: % of models who complete quizzes
- **Average XP per user**: Track engagement
- **Achievement unlock rate**: How many achievements unlocked
- **Leaderboard participation**: % of users in top 100
- **Match quality improvement**: Compare matches before/after quiz data

---

**The gamification system is designed to be fun AND functional - it keeps models engaged while gathering valuable data to improve matching!** 🎮✨

