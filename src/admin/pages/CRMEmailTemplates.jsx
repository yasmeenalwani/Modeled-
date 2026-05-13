import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Pre-built email templates
const EMAIL_TEMPLATES = {
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

const styles = {
  container: {
    padding: '2rem',
    background: '#0d0d14',
    color: '#fff',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  templateCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  templateName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  templatePreview: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '0.5rem',
  },
  editor: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    minHeight: '300px',
    fontFamily: 'monospace',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #e94560, #c73650)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};

export default function CRMEmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(EMAIL_TEMPLATES[selectedTemplate].subject);
      setBody(EMAIL_TEMPLATES[selectedTemplate].body);
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
  };

  const handleSave = () => {
    // TODO: Save template to database
    alert('Template saved! (Database integration coming soon)');
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Email Templates</h2>
      
      <div style={styles.templateGrid}>
        {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
          <div
            key={key}
            style={{
              ...styles.templateCard,
              ...(selectedTemplate === key ? { borderColor: '#e94560' } : {}),
            }}
            onClick={() => handleSelectTemplate(key)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            <div style={styles.templateName}>{template.name}</div>
            <div style={styles.templatePreview}>
              {template.subject}
            </div>
            <div style={{ ...styles.templatePreview, marginTop: '0.5rem', fontSize: '0.75rem' }}>
              {template.body.substring(0, 100)}...
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div style={styles.editor}>
          <h3 style={{ marginBottom: '1rem' }}>Edit Template: {EMAIL_TEMPLATES[selectedTemplate].name}</h3>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject</label>
          <input
            style={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Body</label>
          <textarea
            style={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            Variables: {'{{firstName}}'} {'{{lastName}}'} {'{{company}}'} {'{{city}}'} {'{{eventName}}'} {'{{eventDate}}'} {'{{senderName}}'}
          </div>
          <button style={styles.saveBtn} onClick={handleSave}>
            Save Template
          </button>
        </div>
      )}
    </div>
  );
}

