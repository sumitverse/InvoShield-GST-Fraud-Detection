const fs = require('fs');
const path = require('path');
const file = path.join('backend', 'data', 'main_indian_gst_data.csv');
const data = fs.readFileSync(file, 'utf8');
const lines = data.split('\n');

const seen = new Map();
for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Simple CSV parser for this specific format
    // GSTIN,"Company Name",Sales,Purchase,ITC,Refund,State
    let firstComma = lines[i].indexOf(',');
    let gstin = lines[i].substring(0, firstComma);
    
    let remainder = lines[i].substring(firstComma + 1);
    let companyName = '';
    let secondCommaIdx = -1;
    
    if (remainder.startsWith('"')) {
        let endQuote = remainder.indexOf('"', 1);
        companyName = remainder.substring(1, endQuote);
        secondCommaIdx = remainder.indexOf(',', endQuote);
    } else {
        secondCommaIdx = remainder.indexOf(',');
        companyName = remainder.substring(0, secondCommaIdx);
    }
    
    let restOfLine = remainder.substring(secondCommaIdx);
    
    let baseName = companyName;
    if (seen.has(baseName)) {
        let count = seen.get(baseName);
        count++;
        seen.set(baseName, count);
        companyName = baseName + ' Unit ' + count;
    } else {
        seen.set(baseName, 1);
    }
    
    // Reconstruct the line
    lines[i] = gstin + ',"' + companyName + '"' + restOfLine;
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed main_indian_gst_data.csv. Unique names generated.');
