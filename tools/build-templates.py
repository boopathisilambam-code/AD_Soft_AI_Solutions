#!/usr/bin/env python3
"""Writes templates/manifest.json (same data templates.php returns).
Only needed on hosts WITHOUT PHP (Vercel / Netlify / local preview). Run it after adding a template folder:
    python tools/build-templates.py
On Hostinger (PHP) you do not need it - templates.php scans the folder on every visit."""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'templates')

def scan(root=ROOT):
    out = []
    if not os.path.isdir(root):
        return out
    for name in sorted(os.listdir(root)):
        d = os.path.join(root, name)
        reg = os.path.join(d, 'register.js')
        if not (os.path.isdir(d) and re.match(r'^[A-Za-z0-9][A-Za-z0-9-]*$', name)): continue
        if not os.path.isfile(reg) or os.path.exists(os.path.join(d, '.hidden')): continue
        card = os.path.join(d, 'card.jpg')
        t = int(os.path.getmtime(reg))
        out.append({'id': name, 't': t, 'v': max(t, int(os.path.getmtime(card)) if os.path.isfile(card) else 0)})
    return out

if __name__ == '__main__':
    data = scan()
    if not data:
        sys.exit('No templates found in ' + os.path.abspath(ROOT))
    with open(os.path.join(ROOT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump({'templates': data}, f, separators=(',', ':'))
    print('manifest.json written with %d templates' % len(data))
