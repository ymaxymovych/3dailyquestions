#!/usr/bin/env python3
"""
Script to add reportTemplate to all roles in data.ts
"""

import re

# Read the file
with open('data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all role definitions and add reportTemplate after kpis array
# Pattern: find kpis array closing followed by role closing
# We need to be careful to only match role objects, not department objects

# Split by roles array
lines = content.split('\n')
result_lines = []
in_kpis = False
kpis_indent = 0

for i, line in enumerate(lines):
    result_lines.append(line)
    
    # Detect kpis array start
    if 'kpis: [' in line:
        in_kpis = True
        kpis_indent = len(line) - len(line.lstrip())
    
    # Detect kpis array end and add reportTemplate
    elif in_kpis and line.strip() == ']':
        # Check if next line is closing the role object
        if i + 1 < len(lines) and lines[i + 1].strip().startswith('}'):
            # Add reportTemplate before closing
            indent = ' ' * kpis_indent
            result_lines.append(f"{indent},")
            result_lines.append(f"{indent}reportTemplate: createBaseTemplate()")
            in_kpis = False

# Write back
output = '\n'.join(result_lines)
with open('data.ts', 'w', encoding='utf-8') as f:
    f.write(output)

print("✅ Added reportTemplate to all roles!")
