"""Compile i18n/<code>.txt (lines "N<TAB>translation", N = index in i18n/keys.json) into i18n/<code>.json.
Brand and technical names that never change are copied from the SAME list in i18n/es_src.py.
Run: python3 i18n/compile_num.py pt"""
import sys, json, importlib.util, pathlib
code = sys.argv[1]
keys = json.loads(pathlib.Path('i18n/keys.json').read_text())
spec = importlib.util.spec_from_file_location('es_src', 'i18n/es_src.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
d = {s: s for s in m.SAME}
d.update({'cover': 'cover', '{LANGMENU}': '{LANGMENU}', '{LANGROW}': '{LANGROW}'})
seen = set(); bad = []
for n, line in enumerate(pathlib.Path(f'i18n/{code}.txt').read_text().split('\n')):
    if not line.strip(): continue
    i, _, t = line.partition('\t')
    if not i.strip().isdigit(): bad.append(f'line {n+1}: {line[:40]}'); continue
    i = int(i)
    if i in seen: bad.append(f'duplicate {i}')
    k = keys[i]
    if k.endswith(' ') and not t.endswith(' '): t += ' '
    if k.startswith(' ') and not t.startswith(' '): t = ' ' + t
    if code == 'fr':
        import re as _re
        t = _re.sub(r' ([?!;:])', '\u202f\\1', t).replace('« ', '«\u202f').replace(' »', '\u202f»').replace('1 000 €', '1\u202f000\u00a0€')
    seen.add(i); d[k] = t
if code == 'ca':
    d['Málaga'] = 'Màlaga'
missing = [i for i in range(len(keys)) if i not in seen]
pathlib.Path(f'i18n/{code}.json').write_text(json.dumps(d, ensure_ascii=False, indent=0))
print(code, len(seen), 'of', len(keys), '| missing:', missing[:20], '| problems:', bad[:10])
