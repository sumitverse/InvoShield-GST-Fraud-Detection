const fs = require('fs');
const path = require('path');

function deduplicateFile(filename) {
    const file = path.join('backend', 'data', filename);
    if (!fs.existsSync(file)) return;
    
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.split('\n');

    const seen = new Map();
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
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
        
        lines[i] = gstin + ',"' + companyName + '"' + restOfLine;
    }

    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed ' + filename + '. Unique names generated.');
}

deduplicateFile('real_companies_gst_data.csv');
