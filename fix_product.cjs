const fs = require('fs');
const path = 'c:/Users/james/Documents/JamesyStore/src/pages/AdminAddProduct.jsx';
let content = fs.readFileSync(path, 'utf-8');

// Fix 1: Replace the broken flex row section - add back price input and proper closing
const brokenSection = '<div style={{ flex: 1 }}>\n                                <label style={{ display: \'block\', marginBottom: \'6px\', fontWeight: 500, fontSize: \'14px\' }}>Unit Price (PHP)</label>\n\n                            </div>\n                        <button type="submit"';

const fixedSection = '<div style={{ flex: 1 }}>\n                                <label style={{ display: \'block\', marginBottom: \'6px\', fontWeight: 500, fontSize: \'14px\' }}>Unit Price (PHP)</label>\n                                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required placeholder="0.00" style={{ width: \'100%\', padding: \'10px 12px\', border: \'1px solid #d1d5db\', borderRadius: \'8px\', fontSize: \'14px\', boxSizing: \'border-box\', outline: \'none\' }} />\n                            </div>\n                        </div>\n                        <button type="submit"';

if (content.includes(brokenSection)) {
    content = content.replace(brokenSection, fixedSection);
    fs.writeFileSync(path, content, 'utf-8');
    console.log('Fixed successfully!');
} else {
    console.log('Could not find broken section. Checking file...');
    // Fallback: simpler approach - just check line by line
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('Unit Price (PHP)')) {
            console.log(`Line ${i+1}: ${line}`);
        }
        if (line.includes('</label>') && i > 60 && i < 75) {
            console.log(`Line ${i+1}: ${line}`);
        }
    });
    console.log('--- Full file lines 70-75 ---');
    for (let i = 69; i < 75 && i < lines.length; i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
