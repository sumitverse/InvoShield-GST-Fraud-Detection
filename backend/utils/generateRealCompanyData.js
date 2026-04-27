const fs = require('fs');
const path = require('path');

const NUM_RECORDS = 500; // Generate 500 records for a solid mock dataset
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'real_companies_gst_data.csv');

// List of real company names
const realCompanies = [
  'Reliance Industries Limited',
  'Tata Consultancy Services',
  'HDFC Bank Limited',
  'Infosys Limited',
  'ICICI Bank Limited',
  'Hindustan Unilever Limited',
  'State Bank of India',
  'Bharti Airtel Limited',
  'ITC Limited',
  'Larsen & Toubro Limited',
  'Bajaj Finance Limited',
  'Asian Paints Limited',
  'HCL Technologies Limited',
  'Maruti Suzuki India Limited',
  'Sun Pharmaceutical Industries',
  'Titan Company Limited',
  'UltraTech Cement Limited',
  'Mahindra & Mahindra Limited',
  'Nestle India Limited',
  'Wipro Limited',
  'Google India Pvt Ltd',
  'Microsoft India Pvt Ltd',
  'Amazon Seller Services Pvt Ltd',
  'Flipkart Internet Pvt Ltd',
  'Samsung India Electronics',
  'BMW India Private Limited',
  'Apple India Private Limited',
  'Oracle India Private Limited',
  'Cisco Systems India',
  'Intel Technology India',
  'PVR INOX Limited',
  'Adani Enterprises Limited',
  'Tata Motors Limited',
  'Tech Mahindra Limited',
  'JSW Steel Limited',
  'Hindalco Industries Limited',
  'NTPC Limited',
  'Power Grid Corp of India',
  'Tata Steel Limited',
  'Coal India Limited',
  'Bajaj Auto Limited',
  "Dr. Reddy's Laboratories",
  "Divi's Laboratories",
  'Grasim Industries Limited',
  'IndusInd Bank Limited',
  'Apollo Hospitals Enterprise',
  'Eicher Motors Limited',
  'Hero MotoCorp Limited',
  'Britannia Industries Limited',
  'Cipla Limited'
];

const states = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' }
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generatePAN() {
  let pan = '';
  for (let i = 0; i < 5; i++) pan += alphabet[Math.floor(Math.random() * alphabet.length)];
  for (let i = 0; i < 4; i++) pan += Math.floor(Math.random() * 10);
  pan += alphabet[Math.floor(Math.random() * alphabet.length)];
  return pan;
}

function generateGSTIN(stateCode) {
  const pan = generatePAN();
  const entityNumber = Math.floor(Math.random() * 9) + 1;
  const defaultChar = 'Z';
  const checkDigit = alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${stateCode}${pan}${entityNumber}${defaultChar}${checkDigit}`;
}

const headers = ['GSTIN', 'Company', 'Sales', 'Purchase', 'ITC', 'Refund'];
const rows = [];
rows.push(headers.join(','));

// Using the exact format provided by the user
for (let i = 0; i < NUM_RECORDS; i++) {
  const state = states[Math.floor(Math.random() * states.length)];
  const company = realCompanies[Math.floor(Math.random() * realCompanies.length)];
  const gstin = generateGSTIN(state.code);
  
  // Random financial values
  const purchaseBase = Math.floor(Math.random() * 900000) + 100000; // 100k to 1M
  // Sometimes purchase is more than sales (suspicious), sometimes sales is more
  const sales = Math.floor(purchaseBase * (Math.random() * 1.5 + 0.5)); // 0.5x to 2x purchase
  const purchase = purchaseBase;
  
  // ITC is typically 18% of purchase
  const itc = Math.floor(purchase * 0.18);
  
  // Refund is randomly 0 to 50% of ITC, but sometimes suspiciously high
  const refundFactor = Math.random() > 0.9 ? Math.random() * 2 + 1 : Math.random() * 0.5; // 90% normal, 10% high refund
  const refund = Math.floor(itc * refundFactor);

  const row = [
    gstin,
    `"${company}"`,
    sales,
    purchase,
    itc,
    refund
  ];
  
  rows.push(row.join(','));
}

fs.writeFileSync(OUTPUT_FILE, rows.join('\n'));
console.log(`Successfully generated ${NUM_RECORDS} records to ${OUTPUT_FILE}`);
