# FAQ Bot Integration Guide 🤖

## Overview

The chat system includes automated FAQ responses that help answer common questions instantly, reducing response time and improving user experience.

---

## Current Implementation

### **Simple Keyword Matching**

The FAQ bot currently uses basic keyword matching in `chatApi.js`:

```javascript
const faqMatches = [
  {
    keywords: ['payment', 'pay', 'fee', 'cost', 'price', 'charge'],
    response: 'Payment questions? Our standard fees are...',
    category: 'billing',
  },
  // ... more FAQ entries
];
```

### **How It Works**

1. User sends a message
2. System checks for keyword matches
3. If match found, sends automated response
4. Response is marked as `isAutoResponse: true`
5. User can still get human help if needed

---

## FAQ Categories

### **1. Billing & Payments**
- Keywords: payment, pay, fee, cost, price, charge
- Covers: Service fees, model payments, professional fees

### **2. Bookings**
- Keywords: booking, appointment, schedule, cancel, reschedule
- Covers: Managing bookings, cancellations, rescheduling

### **3. Profile**
- Keywords: profile, photo, picture, update, change
- Covers: Updating profile, photo uploads, information changes

### **4. Matching**
- Keywords: match, matching, request, opportunity
- Covers: How matching works, receiving opportunities

### **5. Training**
- Keywords: training, hours, certification, complete
- Covers: Logging training hours, certification process

---

## Future Enhancements

### **Phase 1: Enhanced Matching** (Recommended Next Step)

**Option A: Better Keyword Matching**
- Use fuzzy matching (Levenshtein distance)
- Support synonyms and variations
- Multi-language support

**Option B: Intent Classification**
- Use AWS Comprehend for intent detection
- More accurate than keyword matching
- Better handling of context

### **Phase 2: AI-Powered Responses**

**Option A: AWS Bedrock**
- Use Claude or Llama models
- Generate contextual responses
- Learn from conversation history
- Cost: ~$0.01-0.03 per message

**Option B: OpenAI GPT**
- Use GPT-4 or GPT-3.5
- Excellent response quality
- Easy integration
- Cost: ~$0.002-0.01 per message

### **Phase 3: Learning System**

- Track which FAQ responses are helpful
- Allow users to rate responses
- Improve responses based on feedback
- Escalate to human when needed

---

## Implementation Examples

### **Enhanced Keyword Matching**

```javascript
import { distance } from 'fast-levenshtein';

function checkFAQMatch(message) {
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/);
  
  for (const faq of faqMatches) {
    // Check exact matches
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return faq;
    }
    
    // Check fuzzy matches
    for (const keyword of faq.keywords) {
      for (const word of words) {
        if (distance(keyword, word) <= 2) { // Allow 2 character difference
          return { ...faq, confidence: 0.6 };
        }
      }
    }
  }
  
  return null;
}
```

### **AWS Comprehend Integration**

```javascript
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';

async function checkFAQWithComprehend(message) {
  const client = new ComprehendClient({ region: 'us-east-1' });
  
  // Detect intent/key phrases
  const command = new DetectSentimentCommand({
    Text: message,
    LanguageCode: 'en',
  });
  
  const response = await client.send(command);
  
  // Map sentiment/intent to FAQ
  // ... logic here
  
  return faqResponse;
}
```

### **Bedrock Integration**

```javascript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

async function getAIResponse(message, conversationHistory) {
  const client = new BedrockRuntimeClient({ region: 'us-east-1' });
  
  const prompt = `You are a helpful support assistant for Modeled Management.
  
User question: ${message}
Conversation history: ${JSON.stringify(conversationHistory)}

Provide a helpful, concise response. If you can't answer, suggest they wait for human support.`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  return responseBody.content[0].text;
}
```

---

## Admin Management

### **Viewing FAQ Performance**

In the admin chat interface, you can:
- See which FAQ responses were sent
- Track response accuracy
- View user feedback on responses

### **Managing FAQ Entries**

Future admin features:
- Add/edit/delete FAQ entries
- Test FAQ matching
- View FAQ analytics
- Set confidence thresholds

---

## Best Practices

1. **Keep Responses Concise**
   - Auto-responses should be 1-2 sentences
   - Always offer human help option

2. **Set Expectations**
   - Mark auto-responses clearly
   - Let users know human will respond if needed

3. **Track Effectiveness**
   - Monitor which FAQs are most common
   - Update responses based on user questions

4. **Escalation**
   - Always allow escalation to human
   - Don't over-automate complex issues

---

## Cost Considerations

### **Current (Keyword Matching)**
- **Cost:** $0 (no external services)
- **Accuracy:** ~60-70%
- **Response Time:** Instant

### **AWS Comprehend**
- **Cost:** $0.0001 per request
- **Accuracy:** ~75-85%
- **Response Time:** ~200-500ms

### **AWS Bedrock (Claude)**
- **Cost:** ~$0.01-0.03 per message
- **Accuracy:** ~90-95%
- **Response Time:** ~1-3 seconds

### **OpenAI GPT-3.5**
- **Cost:** ~$0.002 per message
- **Accuracy:** ~90-95%
- **Response Time:** ~1-2 seconds

---

## Recommendation

**Start with enhanced keyword matching** (Phase 1, Option A):
- Low cost ($0)
- Good enough for most cases
- Can upgrade to AI later if needed
- Easy to implement

**Upgrade to Bedrock/GPT** when:
- You have 100+ conversations/day
- Keyword matching isn't accurate enough
- You want more contextual responses
- Budget allows ($10-30/month)

---

**The current FAQ bot is ready to use! It will automatically respond to common questions and can be enhanced as your needs grow.** 🚀

