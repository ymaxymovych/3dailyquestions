import * as fs from 'fs';
import * as path from 'path';

const dataFilePath = path.join(__dirname, 'data.ts');
let content = fs.readFileSync(dataFilePath, 'utf-8');

// Pattern to find the end of kpis array for each role
// We need to replace "]" followed by new line and spaces, then "}" with "],\n                reportTemplate: createBaseTemplate()\n            },"
const pattern = /(\s+)\]\s*\n(\s+)\},\s*\n(\s+)\{/g;

// Replace pattern - add reportTemplate before closing the role object
content = content.replace(
    /(\s+)\]\s*\n(\s+)\}/g,
    (match, indent1, indent2) => {
        // Check if this is a kpis array closing (has 16-20 spaces before ])
        if (indent1.length >= 16 && indent1.length <= 20) {
            return `${indent1}],\n${indent1}reportTemplate: createBaseTemplate()\n${indent2}}`;
        }
        return match;
    }
);

fs.writeFileSync(dataFilePath, content, 'utf-8');
console.log('✅ Added reportTemplate to all roles');
