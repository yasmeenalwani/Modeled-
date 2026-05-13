/**
 * Calendar Utilities
 * Functions to generate calendar invites for bookings
 */

/**
 * Format date for ICS file (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Parse time string (e.g., "2:00 PM") and return Date object
 */
function parseTimeString(timeString, dateString) {
  const date = new Date(dateString);
  const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  
  if (!timeMatch) {
    // Default to 2:00 PM if parsing fails
    date.setHours(14, 0, 0, 0);
    return date;
  }
  
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Format date for URL encoding (YYYYMMDDTHHMMSS)
 */
function formatURLDate(date) {
  return formatICSDate(date).replace(/:/g, '');
}

/**
 * Generate ICS file content for a booking
 * @param {Object} booking - Booking object with appointment details
 * @returns {string} ICS file content
 */
export function generateICSFile(booking) {
  const {
    appointmentDate,
    appointmentTime,
    duration = 60,
    serviceType,
    professionalName,
    location,
    serviceDescription,
  } = booking;

  // Parse date and time
  const startDate = parseTimeString(appointmentTime || '2:00 PM', appointmentDate || new Date().toISOString().split('T')[0]);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (duration || 60));

  // Format dates for ICS
  const startICS = formatICSDate(startDate);
  const endICS = formatICSDate(endDate);
  const nowICS = formatICSDate(new Date());

  // Generate unique ID
  const uid = `booking-${booking.id || Date.now()}@modeled.app`;

  // Service name
  const serviceName = serviceType || 'Service';
  const title = `${serviceName} with ${professionalName || 'Professional'}`;
  const description = serviceDescription || `Booking for ${serviceName}`;
  const locationText = location || 'TBD';

  // Escape text for ICS format
  const escapeICS = (text) => {
    return String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  // Build ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Modeled//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowICS}`,
    `DTSTART:${startICS}`,
    `DTEND:${endICS}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(locationText)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeICS(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Download ICS file
 * @param {Object} booking - Booking object
 */
export function downloadICSFile(booking) {
  const icsContent = generateICSFile(booking);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-${booking.id || Date.now()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 * @param {Object} booking - Booking object
 * @returns {string} Google Calendar URL
 */
export function getGoogleCalendarLink(booking) {
  const {
    appointmentDate,
    appointmentTime,
    duration = 60,
    serviceType,
    professionalName,
    location,
    serviceDescription,
  } = booking;

  // Parse date and time
  const startDate = parseTimeString(appointmentTime || '2:00 PM', appointmentDate || new Date().toISOString().split('T')[0]);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (duration || 60));

  // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
  const startFormatted = formatURLDate(startDate);
  const endFormatted = formatURLDate(endDate);

  // Build title and description
  const serviceName = serviceType || 'Service';
  const title = encodeURIComponent(`${serviceName} with ${professionalName || 'Professional'}`);
  const description = encodeURIComponent(serviceDescription || `Booking for ${serviceName}`);
  const locationText = encodeURIComponent(location || 'TBD');

  // Google Calendar URL
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details: description,
    location: locationText,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 * @param {Object} booking - Booking object
 * @returns {string} Outlook Calendar URL
 */
export function getOutlookCalendarLink(booking) {
  const {
    appointmentDate,
    appointmentTime,
    duration = 60,
    serviceType,
    professionalName,
    location,
    serviceDescription,
  } = booking;

  // Parse date and time
  const startDate = parseTimeString(appointmentTime || '2:00 PM', appointmentDate || new Date().toISOString().split('T')[0]);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (duration || 60));

  // Format dates for Outlook (YYYY-MM-DDTHH:MM:SS)
  const formatOutlookDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const startFormatted = formatOutlookDate(startDate);
  const endFormatted = formatOutlookDate(endDate);

  // Build title and description
  const serviceName = serviceType || 'Service';
  const title = encodeURIComponent(`${serviceName} with ${professionalName || 'Professional'}`);
  const description = encodeURIComponent(serviceDescription || `Booking for ${serviceName}`);
  const locationText = encodeURIComponent(location || 'TBD');

  // Outlook Calendar URL
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    subject: title,
    startdt: startFormatted,
    enddt: endFormatted,
    body: description,
    location: locationText,
  });

  return `${baseUrl}?${params.toString()}`;
}
