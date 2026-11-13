"""Compile i18n/<code>_src.py into i18n/<code>.json. Run: python3 i18n/compile.py es"""
import sys, json, importlib.util, pathlib
code = sys.argv[1]
spec = importlib.util.spec_from_file_location('src', f'i18n/{code}_src.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
d = {s: s for s in getattr(m, 'SAME', [])}
for a, b in list(m.PAIRS) + list(getattr(m, 'EXTRA', [])):
    if a in d and d[a] != b and a not in getattr(m, 'SAME', []):
        print('conflict:', a, '|', d[a], '|', b)
    d[a] = b
pathlib.Path(f'i18n/{code}.json').write_text(json.dumps(d, ensure_ascii=False, indent=0))
print(code, len(d), 'entries')
