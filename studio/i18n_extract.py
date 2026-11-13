"""List every visible string of the English site: HTML text nodes, visible attributes and JS strings.
Run: python3 i18n_extract.py  ->  i18n/strings.json (ordered, unique)"""
import json, re, glob, pathlib
from html.parser import HTMLParser

ATTRS = {'alt', 'aria-label', 'title', 'placeholder'}
META = {'description', 'og:title', 'og:description'}
SKIP = {'script', 'style', 'svg'}
INLINE = {'em', 'strong', 'b', 'i', 'span', 'br', 'a'}

class X(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.out = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in SKIP: self.skip += 1
        a = dict(attrs)
        for k in ATTRS:
            if a.get(k): self.out.append(a[k])
        if tag == 'meta' and (a.get('name') in META or a.get('property') in META) and a.get('content'):
            self.out.append(a['content'])
    def handle_endtag(self, tag):
        if tag in SKIP and self.skip: self.skip -= 1
    def handle_data(self, d):
        if self.skip: return
        t = ' '.join(d.split())
        if t and re.search(r'[A-Za-z]', t): self.out.append(t)

def html_strings():
    seen = []
    for f in sorted(glob.glob('*.html')):
        p = X(); p.feed(pathlib.Path(f).read_text())
        for s in p.out:
            if s not in seen: seen.append(s)
        # svg text labels are visible too
        for m in re.finditer(r'<text[^>]*>([^<]*[A-Za-z][^<]*)</text>', pathlib.Path(f).read_text()):
            t = ' '.join(m.group(1).split())
            if t not in seen: seen.append(t)
    return seen

def js_strings(path):
    src = pathlib.Path(path).read_text()
    out = []
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|`([^`$]*)`", src):
        s = m.group(1) if m.group(1) is not None else m.group(2)
        if not s or not re.search(r'[A-Za-z]{2}', s): continue
        if not (' ' in s or re.match(r'^[A-Z][a-z]', s)): continue
        if re.search(r'^[#.\[]|[\[\]=<>{}]|^\w+-\w+$|https?:|\.html|var\(|cubic|translate|rotate|rgba|\dpx|\dms|%|^\(', s): continue
        if s not in out: out.append(s)
    return out

if __name__ == '__main__':
    pathlib.Path('i18n').mkdir(exist_ok=True)
    h = html_strings(); j = js_strings('assets/site.js') + js_strings('assets/places.js')
    allx = h + [s for s in j if s not in h]
    pathlib.Path('i18n/strings.json').write_text(json.dumps(allx, ensure_ascii=False, indent=0))
    pathlib.Path('i18n/js-strings.json').write_text(json.dumps(j, ensure_ascii=False, indent=0))
    print(len(h), 'html strings,', len(j), 'js strings,', len(allx), 'unique,', sum(len(s.split()) for s in allx), 'words')
