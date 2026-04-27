const fs = require('fs');
const path = require('path');

const NUM_RECORDS = 500;
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'mock_company_gst_data.csv');

// Sample data pools
const companyTypes = ['Technologies', 'Solutions', 'Enterprises', 'Traders', 'Industries', 'Consulting', 'Logistics', 'Retail', 'Global'];
const states = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' }
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Helper to generate a random PAN number (format: 5 chars, 4 digits, 1 char)
function generatePAN() {
  let pan = '';
  for (let i = 0; i < 5; i++) pan += alphabet[Math.floor(Math.random() * alphabet.length)];
  for (let i = 0; i < 4; i++) pan += Math.floor(Math.random() * 10);
  pan += alphabet[Math.floor(Math.random() * alphabet.length)];
  return pan;
}

// Helper to generate a realistic looking GSTIN
function generateGSTIN(stateCode) {
  const pan = generatePAN();
  const entityNumber = Math.floor(Math.random() * 9) + 1;
  const defaultChar = 'Z';
  const checkDigit = alphabet[Math.floor(Math.random() * alphabet.length)]; // simplified check digit
  return `${stateCode}${pan}${entityNumber}${defaultChar}${checkDigit}`;
}

// Helper to generate random company name
function generateCompanyName() {
  const words = ['Apex', 'Nexus', 'Vertex', 'Quantum', 'Horizon', 'Stellar', 'Aegis', 'Nimbus', 'Nova', 'Crest', 'Prime'];
  const name = words[Math.floor(Math.random() * words.length)];
  const type = companyTypes[Math.floor(Math.random() * companyTypes.length)];
  return `${name} ${type} Pvt. Ltd.`;
}

// Generate the data
const headers = ['InvoiceID', 'CompanyName', 'GSTIN', 'State', 'InvoiceDate', 'Amount', 'TaxAmount', 'IsFraud', 'RiskScore'];
const rows = [];
rows.push(headers.join(','));

for (let i = 1; i <= NUM_RECORDS; i++) {
  const state = states[Math.floor(Math.random() * states.length)];
  const invoiceId = `INV-${new Date().getFullYear()}-${String(i).padStart(5, '0')}`;
  const companyName = generateCompanyName();
  const gstin = generateGSTIN(state.code);
  
  // Random date within the last 6 months
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 180));
  const invoiceDate = date.toISOString().split('T')[0];
  
  const amount = (Math.random() * 1000000 + 5000).toFixed(2); // Between 5k and 10L
  const taxAmount = (amount * 0.18).toFixed(2); // 18% GST
  
  // Create some fraud conditions
  // Fraud is more likely if amount is very high or random chance
  let riskScore = Math.floor(Math.random() * 100);
  let isFraud = 0;
  
  if (amount > 800000 && Math.random() > 0.5) {
    riskScore = Math.floor(Math.random() * 20) + 80; // 80-100
    isFraud = 1;
  } else if (Math.random() > 0.9) {
    riskScore = Math.floor(Math.random() * 30) + 70; // 70-100
    isFraud = 1;
  } else {
    riskScore = Math.floor(Math.random() * 40) + 10; // 10-50
  }

  const row = [
    invoiceId,
    `"${companyName}"`,
    gstin,
    `"${state.name}"`,
    invoiceDate,
    amount,
    taxAmount,
    isFraud,
    riskScore
  ];
  
  rows.push(row.join(','));
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, rows.join('\n'));
console.log(`Successfully generated ${NUM_RECORDS} records to ${OUTPUT_FILE}`);
