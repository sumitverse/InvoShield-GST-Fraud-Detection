const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/<span class="badge-count">34<\/span>/g, '<span class="badge-count">0</span>');
    content = content.replace(/<span class="badge-count">12<\/span>/g, '<span class="badge-count">0</span>');
    content = content.replace(/<span class="badge-count ok">3<\/span>/g, '<span class="badge-count ok">0</span>');
    
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
});
