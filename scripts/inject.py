#!/usr/bin/env python3
"""
inject.py — injects a content block into a tool page
Usage: python3 inject.py <toolfile> <contentfile>
Injects content from contentfile before </main> or <footer or </body>
"""
import sys, os, re

tool_file    = sys.argv[1]
content_file = sys.argv[2]

tool_path    = os.path.join(os.path.dirname(__file__), 'tools', tool_file)
content_path = os.path.join(os.path.dirname(__file__), content_file)

with open(tool_path, 'r', encoding='utf-8') as f:
    html = f.read()

with open(content_path, 'r', encoding='utf-8') as f:
    block = f.read()

# Don't inject twice
if '<!-- HT-CONTENT-INJECTED -->' in html:
    print(f'⏭  Already injected: {tool_file}')
    sys.exit(0)

block = '<!-- HT-CONTENT-INJECTED -->\n' + block

if '</main>' in html:
    html = html.replace('</main>', block + '\n</main>', 1)
elif re.search(r'<footer[\s>]', html):
    html = re.sub(r'(<footer[\s>])', block + r'\n\1', html, count=1)
else:
    html = html.replace('</body>', block + '\n</body>', 1)

with open(tool_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'✅ Injected into {tool_file}')
