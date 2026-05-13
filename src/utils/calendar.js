/**
 * Calendar Integration Utilities
 * 
 * Functions to create calendar events and sync with external calendars
 */

/**
 * Generate iCal file content (universal - works with any calendar)
 * 
 * @param {Object} event
 * @param {string} event.title - Event title
 * @param {string} event.description - Event description
 * @param {Date} event.start - Start date/time
 * @param {Date} event.end - End date/time
 * @param {string} event.location - Location
 * @param {string} event.organizerEmail - Organizer email
 * @param {string} event.attendeeEmail - Attendee email
 * @returns {string} iCal file content
 */
export function generateICalFile(event) {
  const {
    title = 'Appointment',
    description = '',
    start,
    end,
    location = '',
    organizerEmail = 'noreply@modeledmanagement.com',
    attendeeEmail = '',
  } = event;

  // Format dates for iCal (YYYYMMDDTHHMMSSZ)
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(start);
  const endDate = formatDate(end);
  const now = formatDate(new Date());
  const uid = `${now}-${Math.random().toString(36).substr(2, 9)}@modeledmanagement.com`;

  // Escape text for iCal format
  const escape = (text) => {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Modeled Management//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    `ORGANIZER;CN=Modeled Management:MAILTO:${organizerEmail}`,
  ];

  if (attendeeEmail) {
    ical.push(`ATTENDEE;CN=${escape(attendeeEmail)};RSVP=TRUE:MAILTO:${attendeeEmail}`);
  }

  ical.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Appointment tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return ical.join('\r\n');
}

/**
 * Download iCal file
 */
export function downloadICalFile(event, filename = 'appointment.ics') {
  const icalContent = generateICalFile(event);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 * 
 * @param {Object} event
 * @returns {string} Google Calendar URL
 */
export function generateGoogleCalendarUrl(event) {
  const {
    title = 'Appointment',
    description = '',
    start,
    end,
    location = '',
  } = event;

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details: description,
    location: location,
    sf: 'true',
    output: 'xml',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(event) {
  const {
    title = 'Appointment',
    description = '',
    start,
    end,
    location = '',
  } = event;

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    location: location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL (macOS/iOS)
 */
export function generateAppleCalendarUrl(event) {
  const {
    title = 'Appointment',
    description = '',
    start,
    end,
    location = '',
  } = event;

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = generateICalFile(event);
  const encoded = encodeURIComponent(icalContent);
  
  return `data:text/calendar;charset=utf-8,${encoded}`;
}

/**
 * Create calendar event from booking
 */
export function createCalendarEventFromBooking(booking, userType = 'model') {
  const appointmentDate = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
  const duration = booking.duration || 60; // Default 60 minutes
  const endDate = new Date(appointmentDate.getTime() + duration * 60000);

  return {
    title: `${booking.serviceType || 'Service'} - Modeled Management`,
    description: `Service: ${booking.serviceType}\n${booking.serviceDescription || ''}\n\nBooking ID: ${booking.id}`,
    start: appointmentDate,
    end: endDate,
    location: booking.location || '',
    organizerEmail: 'noreply@modeledmanagement.com',
    attendeeEmail: userType === 'model' ? booking.modelEmail : booking.professionalEmail,
  };
}

