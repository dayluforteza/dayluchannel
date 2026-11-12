"""Languages of the site. English is written in the source; every other language is a dictionary
i18n/<code>.json that maps each English string to its translation (text nodes, visible attributes and
the strings the page script writes). build.py calls translate() per page; missing strings are reported."""
import json, pathlib, re

# code, name in its own language, short label. Add a language here once i18n/<code>.json is complete.
LANGS = [('en', 'English', 'EN'), ('es', 'Español', 'ES'), ('pt', 'Português', 'PT'), ('fr', 'Français', 'FR'), ('de', 'Deutsch', 'DE'), ('it', 'Italiano', 'IT'), ('ca', 'Català', 'CA')]
HTMLLANG = {'pt': 'pt-PT'}
PLANNED = 7  # the menu is built for seven languages

_D = {}
_missing = {}

def _dict(code):
    if code not in _D:
        f = pathlib.Path('i18n', code + '.json')
        _D[code] = json.loads(f.read_text()) if f.exists() else {}
    return _D[code]

ATTR = re.compile(r'(\s(?:alt|aria-label|title|placeholder|content)=")([^"]*)(")')
TEXT = re.compile(r'>([^<>]+)<')

def _tr(s, D, miss):
    core = ' '.join(s.split())
    if not core or not re.search(r'[A-Za-z€]', core):
        return s
    if core in D:
        lead = s[:len(s) - len(s.lstrip())]; trail = s[len(s.rstrip()):]
        return lead + D[core] + trail
    if not core.startswith('&lt;'):  # code samples stay as written
        miss.add(core)
    return s

def translate(html, code, fname):
    D = _dict(code); miss = _missing.setdefault(code, set())
    parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', html, flags=re.S)
    out = []
    for i, part in enumerate(parts):
        if i % 2:  # script or style: untouched (the JS gets its strings from i18n-<code>.js)
            out.append(part); continue
        part = TEXT.sub(lambda m: '>' + _tr(m.group(1), D, miss) + '<', part)
        part = ATTR.sub(lambda m: m.group(1) + (_tr(m.group(2), D, miss) if not re.match(r'^(width=|#|https?:|[\d.]+$|summary)', m.group(2)) else m.group(2)) + m.group(3), part)
        out.append(part)
    return ''.join(out)

def _href(cur, target, fname):
    up = '' if cur == 'en' else '../'
    return up + ('' if target == 'en' else target + '/') + fname

def lang_menu(cur, fname):
    items = ''.join(f'<li><a href="{_href(cur, c, fname)}" hreflang="{c}" lang="{c}"{" aria-current=\"true\"" if c == cur else ""}><span>{n}</span><b>{l}</b></a></li>' for c, n, l in LANGS)
    label = dict((c, l) for c, n, l in LANGS)[cur]
    return (f'<div class="lang"><button type="button" aria-expanded="false" aria-haspopup="true" aria-label="Language">'
            f'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
            f'<span>{label}</span></button><ul>{items}</ul></div>')

def lang_row(cur, fname):
    return '<div class="sheet__lang">' + ''.join(f'<a href="{_href(cur, c, fname)}" hreflang="{c}" lang="{c}"{" aria-current=\"true\"" if c == cur else ""}>{n}</a>' for c, n, l in LANGS) + '</div>'

def write_js():
    """assets/i18n-<code>.js: the strings the page script writes at run time."""
    f = pathlib.Path('i18n', 'js-strings.json')
    js = json.loads(f.read_text()) if f.exists() else []
    for code, *_ in LANGS:
        if code == 'en': continue
        D = _dict(code)
        src = pathlib.Path('assets/site.js').read_text() + pathlib.Path('assets/places.js').read_text()
        js = list(dict.fromkeys(js + [k for k in D if ("'" + k + "'") in src]))
        sub = {k: D[k] for k in js if k in D}
        for k in js:
            if k not in D: _missing.setdefault(code, set()).add(k)
        pathlib.Path('assets', f'i18n-{code}.js').write_text('window.I18N=' + json.dumps(sub, ensure_ascii=False, separators=(',', ':')) + ';\n')

def report():
    write_js()
    for code, miss in _missing.items():
        if miss:
            pathlib.Path('i18n', f'missing-{code}.json').write_text(json.dumps(sorted(miss), ensure_ascii=False, indent=0))
            print(f'{code}: {len(miss)} strings without translation -> i18n/missing-{code}.json')
        else:
            print(f'{code}: complete')
