/**
 * Automated Test Script for Booking Flow
 * Tests the complete booking workflow from match creation to calendar invites
 */

// Note: This runs in Node.js environment, so we need to mock browser APIs
// For full integration tests, use a browser testing framework like Playwright or Cypress

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper to log test results
function logTest(name, passed, message = '') {
  if (passed) {
    results.passed.push({ name, message });
    console.log(`✅ PASS: ${name}${message ? ' - ' + message : ''}`);
  } else {
    results.failed.push({ name, message });
    console.log(`❌ FAIL: ${name}${message ? ' - ' + message : ''}`);
  }
}

function logWarning(name, message) {
  results.warnings.push({ name, message });
  console.log(`⚠️  WARN: ${name} - ${message}`);
}

// Test 1: Check if calendar utilities file exists
function testCalendarUtilsExists() {
  const calendarUtilsPath = path.join(__dirname, '../src/utils/calendarUtils.js');
  const exists = fs.existsSync(calendarUtilsPath);
  logTest('Calendar Utils File Exists', exists, exists ? 'Found calendarUtils.js' : 'calendarUtils.js not found');
  return exists;
}

// Test 2: Check if calendar utilities have required functions
function testCalendarUtilsFunctions() {
  try {
    const calendarUtilsPath = path.join(__dirname, '../src/utils/calendarUtils.js');
    const content = fs.readFileSync(calendarUtilsPath, 'utf8');
    
    const requiredFunctions = [
      'generateICSFile',
      'downloadICSFile',
      'getGoogleCalendarLink',
      'getOutlookCalendarLink',
    ];
    
    let allFound = true;
    requiredFunctions.forEach(func => {
      const found = content.includes(`export function ${func}`) || content.includes(`function ${func}`);
      if (!found) {
        logTest(`Calendar Utils: ${func}`, false, 'Function not found');
        allFound = false;
      } else {
        logTest(`Calendar Utils: ${func}`, true);
      }
    });
    
    return allFound;
  } catch (error) {
    logTest('Calendar Utils Functions Check', false, error.message);
    return false;
  }
}

// Test 3: Check if ModelBookedCalendar has calendar invite buttons
function testModelCalendarInvites() {
  try {
    const modelCalendarPath = path.join(__dirname, '../src/portal/model-pages/ModelBookedCalendar.jsx');
    const content = fs.readFileSync(modelCalendarPath, 'utf8');
    
    const checks = [
      { name: 'Calendar Utils Import', pattern: /import.*calendarUtils/i },
      { name: 'Google Calendar Button', pattern: /Add to Google Calendar/i },
      { name: 'Outlook Calendar Button', pattern: /Add to Outlook/i },
      { name: 'ICS Download Button', pattern: /Download.*ics/i },
      { name: 'Calendar Section', pattern: /Add to Calendar/i },
    ];
    
    let allFound = true;
    checks.forEach(check => {
      const found = check.pattern.test(content);
      logTest(`Model Calendar: ${check.name}`, found);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    logTest('Model Calendar Invites Check', false, error.message);
    return false;
  }
}

// Test 4: Check if ProBooked has calendar invite buttons
function testProCalendarInvites() {
  try {
    const proBookedPath = path.join(__dirname, '../src/portal/pages/ProBooked.jsx');
    const content = fs.readFileSync(proBookedPath, 'utf8');
    
    const checks = [
      { name: 'Calendar Utils Import', pattern: /import.*calendarUtils/i },
      { name: 'Booking Modal', pattern: /selectedBooking.*&&|Booking Details Modal/i },
      { name: 'Google Calendar Button', pattern: /Add to Google Calendar/i },
      { name: 'Outlook Calendar Button', pattern: /Add to Outlook/i },
      { name: 'ICS Download Button', pattern: /Download.*ics/i },
    ];
    
    let allFound = true;
    checks.forEach(check => {
      const found = check.pattern.test(content);
      logTest(`Pro Booked: ${check.name}`, found);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    logTest('Pro Calendar Invites Check', false, error.message);
    return false;
  }
}

// Test 5: Check if booking service has proper demo mode handling
function testBookingServiceDemoMode() {
  try {
    const bookingServicePath = path.join(__dirname, '../src/utils/bookingService.js');
    const content = fs.readFileSync(bookingServicePath, 'utf8');
    
    const checks = [
      { name: 'Demo Mode Check', pattern: /shouldUseMockData|DEMO MODE/i },
      { name: 'Confirmed Status', pattern: /status.*confirmed/i },
      { name: 'Payment Bypass', pattern: /modelPaid|proPaid/i },
    ];
    
    let allFound = true;
    checks.forEach(check => {
      const found = check.pattern.test(content);
      logTest(`Booking Service: ${check.name}`, found);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    logTest('Booking Service Demo Mode Check', false, error.message);
    return false;
  }
}

// Test 6: Check if match service has payment bypass
function testMatchServicePaymentBypass() {
  try {
    const matchServicePath = path.join(__dirname, '../src/utils/matchService.js');
    const content = fs.readFileSync(matchServicePath, 'utf8');
    
    const checks = [
      { name: 'Payment Bypass Logic', pattern: /modelPaid.*true|proPaid.*true|demo.*mode/i },
      { name: 'Error Handling', pattern: /try.*catch|fallback/i },
      { name: 'Booking Creation', pattern: /createBookingFromMatch/i },
    ];
    
    let allFound = true;
    checks.forEach(check => {
      const found = check.pattern.test(content);
      logTest(`Match Service: ${check.name}`, found);
      if (!found) allFound = false;
    });
    
    return allFound;
  } catch (error) {
    logTest('Match Service Payment Bypass Check', false, error.message);
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Running Booking Flow Tests...\n');
  console.log('='.repeat(60));
  
  testCalendarUtilsExists();
  testCalendarUtilsFunctions();
  testModelCalendarInvites();
  testProCalendarInvites();
  testBookingServiceDemoMode();
  testMatchServicePaymentBypass();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => {
      console.log(`   - ${test.name}: ${test.message}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => {
      console.log(`   - ${warning.name}: ${warning.message}`);
    });
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Test manually:');
  console.log('      - Model Portal: http://localhost:5173/model-portal/booked');
  console.log('      - Pro Portal: http://localhost:5173/pro-portal/booked');
  console.log('      - Admin Portal: http://localhost:5173/admin/match-engine');
  console.log('   3. Verify calendar invites work in booking modals');
  
  // Exit with error code if tests failed
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests();
