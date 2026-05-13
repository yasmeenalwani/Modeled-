import XLSX from 'xlsx';

// ============================================
// DATABASE SCHEMA DOCUMENTATION FOR EXCEL
// ============================================

// Hair Profile Types - Simple (User-facing)
const hairProfileSimple = [
  {
    Category: 'Hair Length (Simple)',
    Field: 'hairLengthSimple',
    Type: 'enum',
    Options: 'short, medium, long, extra_long',
    Description: 'User-facing hair length classification',
    Visibility: 'User-facing',
  },
  {
    Category: 'Hair Color (Simple)',
    Field: 'hairColorSimple',
    Type: 'enum',
    Options: 'black, brown, blonde, red, gray, colored',
    Description: 'User-facing hair color classification',
    Visibility: 'User-facing',
  },
  {
    Category: 'Hair Texture (Simple)',
    Field: 'hairTextureSimple',
    Type: 'enum',
    Options: 'straight, wavy, curly, coily',
    Description: 'User-facing hair texture classification',
    Visibility: 'User-facing',
  },
];

// Hair Profile Types - Detailed (Admin-only)
const hairProfileDetailed = [
  {
    Category: 'Hair Length (Detailed)',
    Field: 'hairLengthDetailed',
    Type: 'string',
    Options: 'buzzed, chin-length, shoulder, mid-back, waist+',
    Description: 'Detailed hair length measurement',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Color (Detailed)',
    Field: 'hairColorDetailed',
    Type: 'JSON',
    Options: '{ natural: "dark_brown", depth: 4, undertone: "warm", artificial: "none" }',
    Description: 'Detailed color analysis with depth and undertone',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Texture (Detailed)',
    Field: 'hairTextureDetailed',
    Type: 'string',
    Options: '1A-4C (Andre Walker system)',
    Description: 'Andre Walker curl pattern classification',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Density',
    Field: 'hairDensity',
    Type: 'enum',
    Options: 'thin, medium, thick',
    Description: 'Hair density/thickness',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Porosity',
    Field: 'hairPorosity',
    Type: 'enum',
    Options: 'low, medium, high',
    Description: 'Hair porosity level (important for color treatments)',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Health',
    Field: 'hairHealth',
    Type: 'JSON',
    Options: '{ frizz: "low", damage: "none", splitEnds: false, shine: "natural" }',
    Description: 'Hair health metrics',
    Visibility: 'Admin-only',
  },
  {
    Category: 'Hair Style',
    Field: 'hairStyle',
    Type: 'string',
    Options: 'natural, blowout, silk_press, braids, cornrows, locs, twists, afro, bantu_knots, ponytail, updo, bob, wig, weave, twa, fade',
    Description: 'Current hair style',
    Visibility: 'Admin-only',
  },
];

// Legacy Hair Attributes
const hairLegacy = [
  {
    Category: 'Hair Length (Legacy)',
    Field: 'hairLength',
    Type: 'enum',
    Options: 'short, medium, long, extra_long',
    Description: 'Legacy field - maps to hairLengthSimple',
    Visibility: 'User-facing',
  },
  {
    Category: 'Hair Color (Legacy)',
    Field: 'hairColor',
    Type: 'string',
    Options: 'Free text',
    Description: 'Legacy field - free text color',
    Visibility: 'User-facing',
  },
  {
    Category: 'Hair Texture (Legacy)',
    Field: 'hairTexture',
    Type: 'enum',
    Options: 'straight, wavy, curly, coily',
    Description: 'Legacy field - maps to hairTextureSimple',
    Visibility: 'User-facing',
  },
  {
    Category: 'Hair Condition',
    Field: 'hairCondition',
    Type: 'enum',
    Options: 'healthy, damaged, color_treated, virgin',
    Description: 'Overall hair condition',
    Visibility: 'User-facing',
  },
];

// Beauty Profile Attributes
const beautyProfile = [
  {
    Category: 'Skin Tone (Simple)',
    Field: 'skinToneSimple',
    Type: 'enum',
    Options: 'fair, light, medium, olive, tan, brown, dark',
    Description: 'User-facing skin tone classification',
    Visibility: 'User-facing',
  },
  {
    Category: 'Skin Undertone',
    Field: 'skinUndertone',
    Type: 'enum',
    Options: 'warm, cool, neutral',
    Description: 'Skin undertone',
    Visibility: 'User-facing',
  },
  {
    Category: 'Skin Type',
    Field: 'skinType',
    Type: 'enum',
    Options: 'dry, normal, oily, combination',
    Description: 'Skin type classification',
    Visibility: 'User-facing',
  },
  {
    Category: 'Face Shape (Simple)',
    Field: 'faceShapeSimple',
    Type: 'enum',
    Options: 'oval, round, square, heart, oblong, diamond',
    Description: 'User-facing face shape',
    Visibility: 'User-facing',
  },
  {
    Category: 'Eye Color (Simple)',
    Field: 'eyeColorSimple',
    Type: 'enum',
    Options: 'brown, blue, green, hazel, gray, amber',
    Description: 'User-facing eye color',
    Visibility: 'User-facing',
  },
  {
    Category: 'Eye Shape (Simple)',
    Field: 'eyeShapeSimple',
    Type: 'enum',
    Options: 'almond, round, hooded, monolid, downturned, upturned',
    Description: 'User-facing eye shape',
    Visibility: 'User-facing',
  },
  {
    Category: 'Eyebrow Shape (Simple)',
    Field: 'eyebrowShapeSimple',
    Type: 'enum',
    Options: 'arched, straight, curved, s_shaped, rounded',
    Description: 'User-facing eyebrow shape',
    Visibility: 'User-facing',
  },
  {
    Category: 'Eyebrow Thickness',
    Field: 'eyebrowThickness',
    Type: 'enum',
    Options: 'thin, medium, thick, bushy',
    Description: 'Eyebrow thickness',
    Visibility: 'User-facing',
  },
  {
    Category: 'Lip Shape (Simple)',
    Field: 'lipShapeSimple',
    Type: 'enum',
    Options: 'full, thin, heart, wide, round, bow_shaped',
    Description: 'User-facing lip shape',
    Visibility: 'User-facing',
  },
  {
    Category: 'Lip Size',
    Field: 'lipSize',
    Type: 'enum',
    Options: 'thin, medium, full, very_full',
    Description: 'Lip size classification',
    Visibility: 'User-facing',
  },
];

// Services Menu
const services = [
  {
    Service_ID: 'haircut',
    Service_Name: 'Haircut',
    Category: 'Hair',
    Price: 125,
    Duration_Minutes: 60,
    Professional_Fee_Percent: 17,
    Professional_Fee: 21,
    Model_Fee_Percent: 20,
    Model_Fee: 25,
    Total_Revenue: 46,
    Description: 'Precision cut and styling',
    Requirements: 'Any hair type',
  },
  {
    Service_ID: 'color',
    Service_Name: 'Color',
    Category: 'Hair',
    Price: 300,
    Duration_Minutes: 180,
    Professional_Fee_Percent: 12,
    Professional_Fee: 36,
    Model_Fee_Percent: 10,
    Model_Fee: 30,
    Total_Revenue: 66,
    Description: 'Full color treatment',
    Requirements: 'Virgin or color-treated hair',
  },
  {
    Service_ID: 'blowdry',
    Service_Name: 'Blowdry',
    Category: 'Hair',
    Price: 90,
    Duration_Minutes: 45,
    Professional_Fee_Percent: 17,
    Professional_Fee: 15,
    Model_Fee_Percent: 22,
    Model_Fee: 20,
    Total_Revenue: 35,
    Description: 'Professional blowout styling',
    Requirements: 'Medium to long hair preferred',
  },
  {
    Service_ID: 'gloss',
    Service_Name: 'Gloss',
    Category: 'Hair',
    Price: 100,
    Duration_Minutes: 60,
    Professional_Fee_Percent: 17,
    Professional_Fee: 17,
    Model_Fee_Percent: 25,
    Model_Fee: 25,
    Total_Revenue: 42,
    Description: 'Shine and toning treatment',
    Requirements: 'Any hair type',
  },
  {
    Service_ID: 'highlights',
    Service_Name: 'Highlights',
    Category: 'Hair',
    Price: 225,
    Duration_Minutes: 150,
    Professional_Fee_Percent: 12,
    Professional_Fee: 27,
    Model_Fee_Percent: 13,
    Model_Fee: 30,
    Total_Revenue: 57,
    Description: 'Partial or full highlights',
    Requirements: 'Virgin or lightly processed hair preferred',
  },
  {
    Service_ID: 'keratin',
    Service_Name: 'Keratin',
    Category: 'Hair',
    Price: 300,
    Duration_Minutes: 180,
    Professional_Fee_Percent: 12,
    Professional_Fee: 36,
    Model_Fee_Percent: 12,
    Model_Fee: 35,
    Total_Revenue: 71,
    Description: 'Keratin smoothing treatment',
    Requirements: 'Frizzy or curly hair ideal',
  },
];

// Services Open To (Boolean Fields)
const servicesOpenTo = [
  {
    Field: 'openToHaircut',
    Type: 'boolean',
    Description: 'Model is open to haircut services',
    Service_Related: 'haircut',
  },
  {
    Field: 'openToColor',
    Type: 'boolean',
    Description: 'Model is open to color services',
    Service_Related: 'color, highlights',
  },
  {
    Field: 'openToStyling',
    Type: 'boolean',
    Description: 'Model is open to styling/blowdry services',
    Service_Related: 'blowdry',
  },
  {
    Field: 'openToMakeup',
    Type: 'boolean',
    Description: 'Model is open to makeup services',
    Service_Related: 'makeup',
  },
  {
    Field: 'openToNails',
    Type: 'boolean',
    Description: 'Model is open to nail services',
    Service_Related: 'nails',
  },
  {
    Field: 'openToSkincare',
    Type: 'boolean',
    Description: 'Model is open to skincare services',
    Service_Related: 'skincare',
  },
];

// Preferences/Tags (Based on UI examples)
const preferences = [
  {
    Preference_Type: 'Service Preference',
    Examples: 'Open to color, Love balayage, Trims OK, Love blowouts, No bleach',
    Storage_Field: 'tags (string array)',
    Description: 'User-defined preference tags stored in tags array field',
  },
  {
    Preference_Type: 'Location Preference',
    Examples: 'Manhattan only, Brooklyn preferred, Willing to travel',
    Storage_Field: 'tags (string array)',
    Description: 'Location-related preferences',
  },
  {
    Preference_Type: 'Time Preference',
    Examples: 'Mornings preferred, Afternoons only, Weekends only',
    Storage_Field: 'tags (string array)',
    Description: 'Time/schedule preferences',
  },
  {
    Preference_Type: 'Style Preference',
    Examples: 'Natural styles, Bold changes, Conservative',
    Storage_Field: 'tags (string array)',
    Description: 'Style preferences and restrictions',
  },
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Add sheets
const ws1 = XLSX.utils.json_to_sheet(hairProfileSimple);
const ws2 = XLSX.utils.json_to_sheet(hairProfileDetailed);
const ws3 = XLSX.utils.json_to_sheet(hairLegacy);
const ws4 = XLSX.utils.json_to_sheet(beautyProfile);
const ws5 = XLSX.utils.json_to_sheet(services);
const ws6 = XLSX.utils.json_to_sheet(servicesOpenTo);
const ws7 = XLSX.utils.json_to_sheet(preferences);

XLSX.utils.book_append_sheet(workbook, ws1, 'Hair Profile (Simple)');
XLSX.utils.book_append_sheet(workbook, ws2, 'Hair Profile (Detailed)');
XLSX.utils.book_append_sheet(workbook, ws3, 'Hair Profile (Legacy)');
XLSX.utils.book_append_sheet(workbook, ws4, 'Beauty Profile');
XLSX.utils.book_append_sheet(workbook, ws5, 'Services Menu');
XLSX.utils.book_append_sheet(workbook, ws6, 'Services Open To');
XLSX.utils.book_append_sheet(workbook, ws7, 'Preferences');

// Write file
XLSX.writeFile(workbook, 'MODELED_DATABASE_SCHEMA.xlsx');

console.log('✅ Excel file generated: MODELED_DATABASE_SCHEMA.xlsx');
console.log('\nSheets created:');
console.log('  1. Hair Profile (Simple) - User-facing hair attributes');
console.log('  2. Hair Profile (Detailed) - Admin-only detailed attributes');
console.log('  3. Hair Profile (Legacy) - Legacy fields for backwards compatibility');
console.log('  4. Beauty Profile - Skin, face, eye, lip attributes');
console.log('  5. Services Menu - All available services with pricing');
console.log('  6. Services Open To - Boolean service preference fields');
console.log('  7. Preferences - User preference tags/examples');

