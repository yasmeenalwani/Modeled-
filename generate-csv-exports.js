import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('MODELED_DATABASE_SCHEMA.xlsx');

// Export each sheet as CSV
workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  // Create safe filename
  const safeName = sheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const csvFileName = `MODELED_SCHEMA_${safeName}.csv`;
  
  // Write CSV file
  fs.writeFileSync(csvFileName, csv, 'utf8');
  
  console.log(`✅ Created: ${csvFileName}`);
});

console.log(`\n✅ All CSV files created! You can open these in any text editor or spreadsheet program.`);

