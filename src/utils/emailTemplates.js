/**
 * Email Template Utilities
 * 
 * Functions for managing and personalizing email templates
 */

// Template variables that can be replaced
const TEMPLATE_VARIABLES = {
  firstName: '{{firstName}}',
  lastName: '{{lastName}}',
  company: '{{company}}',
  city: '{{city}}',
  state: '{{state}}',
  eventName: '{{eventName}}',
  eventDate: '{{eventDate}}',
  senderName: '{{senderName}}',
  senderEmail: '{{senderEmail}}',
  month: '{{month}}',
  year: '{{year}}',
};

/**
 * Personalize email template with prospect data
 * @param {string} template - Email template with variables
 * @param {object} data - Prospect/contact data
 * @returns {string} Personalized email
 */
export function personalizeTemplate(template, data) {
  let personalized = template;
  
  // Replace all variables
  Object.entries(TEMPLATE_VARIABLES).forEach(([key, variable]) => {
    const value = data[key] || '';
    personalized = personalized.replace(new RegExp(variable, 'g'), value);
  });
  
  // Replace date variables
  if (data.eventDate) {
    const date = new Date(data.eventDate);
    personalized = personalized.replace(/{{eventDate}}/g, date.toLocaleDateString());
  }
  
  const now = new Date();
  personalized = personalized.replace(/{{month}}/g, now.toLocaleDateString('en-US', { month: 'long' }));
  personalized = personalized.replace(/{{year}}/g, now.getFullYear().toString());
  
  // Default sender name if not provided
  if (!personalized.includes('{{senderName}}')) {
    personalized = personalized.replace(/{{senderName}}/g, 'The Modeled Team');
  }
  
  return personalized;
}

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  const templates = {
    professional_cold: {
      name: 'Professional Cold Outreach',
      subject: 'Join Modeled - Connect with Aspiring Models',
      body: `Hi {{firstName}},

I hope this email finds you well! I'm reaching out from Modeled, a platform connecting emerging beauty professionals with aspiring models.

We're building a community of talented stylists and colorists in {{city}}, and I thought you might be interested in joining.

**What Modeled offers:**
- Access to models for training and portfolio building
- Continued education opportunities
- A supportive community of professionals
- Flexible scheduling

Would you be open to a quick 15-minute call to learn more?

Best,
{{senderName}}
Modeled Team`,
    },
    salon_partnership: {
      name: 'Salon Partnership',
      subject: 'Partnership Opportunity - Modeled',
      body: `Hi {{firstName}},

I'm reaching out from Modeled about a potential partnership opportunity with {{company}}.

We're looking to partner with forward-thinking salons in {{city}} to provide:
- Model access for your team's training
- Marketing opportunities
- Community events
- Brand visibility

I'd love to discuss how we can work together. Are you available for a call this week?

Best,
{{senderName}}
Modeled Team`,
    },
    event_outreach: {
      name: 'Event Outreach',
      subject: 'Modeled at {{eventName}}',
      body: `Hi {{firstName}},

I noticed {{eventName}} is coming up on {{eventDate}}, and I'd love to connect!

Modeled is a platform connecting beauty professionals with aspiring models. We're interested in:
- Exhibiting at your event
- Sponsoring a session
- Connecting with attendees

Would you be open to discussing opportunities?

Best,
{{senderName}}
Modeled Team`,
    },
    city_launch: {
      name: 'City Launch Announcement',
      subject: 'Modeled is Coming to {{city}}!',
      body: `Hi {{firstName}},

Exciting news! Modeled is launching in {{city}} this {{month}}.

We're looking for talented professionals to join our community. As an early member, you'll get:
- Priority access to models
- Featured profile
- Launch event invitation
- Special perks

Interested in being part of our launch? Let's chat!

Best,
{{senderName}}
Modeled Team`,
    },
    follow_up: {
      name: 'Follow-up',
      subject: 'Following up - Modeled',
      body: `Hi {{firstName}},

Just following up on my previous email about Modeled.

I wanted to make sure you saw my message about joining our community of beauty professionals in {{city}}.

Would you be open to a quick call? I'm happy to answer any questions.

Best,
{{senderName}}
Modeled Team`,
    },
  };
  
  return templates[templateId] || null;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return [
    'professional_cold',
    'salon_partnership',
    'event_outreach',
    'city_launch',
    'follow_up',
  ];
}

