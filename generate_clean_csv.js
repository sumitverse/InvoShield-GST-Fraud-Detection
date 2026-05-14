const fs = require('fs');
const path = require('path');

const companies = [
    "Reliance Industries", "Tata Consultancy Services", "HDFC Bank", "ICICI Bank", 
    "Hindustan Unilever", "Infosys", "ITC Limited", "State Bank of India", 
    "Bharti Airtel", "Kotak Mahindra Bank", "Larsen & Toubro", "Bajaj Finance", 
    "Asian Paints", "Axis Bank", "Maruti Suzuki", "Sun Pharmaceutical", 
    "Titan Company", "UltraTech Cement", "Wipro", "Nestle India", 
    "Mahindra & Mahindra", "JSW Steel", "Tata Steel", "HCL Technologies", 
    "Power Grid Corp", "Bajaj Auto", "Tech Mahindra", "NTPC", "Tata Motors", 
    "Hindalco Industries", "Grasim Industries", "Divis Laboratories", 
    "Apollo Hospitals", "Eicher Motors", "Dr. Reddys Laboratories", 
    "Britannia Industries", "Cipla", "IndusInd Bank", "Coal India", 
    "Godrej Consumer", "PVR INOX", "Amazon Seller Services", "Google India", 
    "Microsoft India", "Apple India", "Samsung India Electronics", 
    "Intel Technology India", "Flipkart Internet", "Cisco Systems India", 
    "Oracle India Private"
];

function generateGSTIN(index) {
    const states = ["07", "09", "27", "29", "33", "24", "08", "03", "36", "32"];
    const state = states[index % states.length];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pan = "";
    for(let i=0; i<5; i++) pan += letters.charAt(Math.floor(Math.random() * 26));
    for(let i=0; i<4; i++) pan += Math.floor(Math.random() * 10);
    pan += letters.charAt(Math.floor(Math.random() * 26));
    return state + pan + "1Z" + Math.floor(Math.random() * 10);
}

function generateCleanData() {
    const file = path.join('backend', 'data', 'clean_with_one_critical.csv');
    let csv = "GSTIN,Company,Sales,Purchase,ITC,Refund\n";

    for (let i = 0; i < companies.length; i++) {
        const gstin = generateGSTIN(i);
        const company = companies[i];
        
        let sales = Math.floor(Math.random() * 1000000) + 500000;
        let purchase, itc, refund;

        // Make the 15th company (index 14) the CRITICAL one
        if (i === 14) {
            // Critical needs: purchase > 1.5 * sales, itc > 0.5 * sales, refund > 0.3 * sales
            purchase = Math.floor(sales * 1.6);
            itc = Math.floor(sales * 0.55);
            refund = Math.floor(sales * 0.35);
        } else {
            // No risk: purchase <= 1.5 * sales, itc <= 0.5 * sales, refund <= 0.3 * sales
            // To be safe and realistic:
            purchase = Math.floor(sales * (0.6 + Math.random() * 0.4)); // 60-100% of sales
            itc = Math.floor(sales * (0.1 + Math.random() * 0.2)); // 10-30% of sales
            refund = Math.floor(sales * (0.01 + Math.random() * 0.05)); // 1-6% of sales
        }

        csv += `${gstin},"${company}",${sales},${purchase},${itc},${refund}\n`;
    }

    fs.writeFileSync(file, csv);
    console.log(`Generated ${file} with ${companies.length} rows (1 critical, ${companies.length - 1} safe).`);
}

generateCleanData();
