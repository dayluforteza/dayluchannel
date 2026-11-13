"""Deriva va.txt (valencià, norma AVL) de ca.txt. Revisió manual després."""
import re, pathlib
here = pathlib.Path(__file__).parent
W = {
 # 1a persona present
 'treballo': 'treballe', 'reviso': 'revise', 'explico': 'explique', 'dono': 'done', 'deixo': 'deixe',
 'passo': 'passe', 'oriento': 'oriente', 'configuro': 'configure', 'comprovo': 'comprove', 'busco': 'busque',
 'adapto': 'adapte', 'acabo': 'acabe', 'valoro': 'valore', 'provo': 'prove', 'aplico': 'aplique',
 'analitzo': 'analitze', 'verifico': 'verifique', 'presento': 'presente', 'porto': 'porte',
 'organitzo': 'organitze', 'optimitzo': 'optimitze', 'ofereixo': 'oferisc', 'ocupo': 'ocupe',
 'milloro': 'millore', 'estableixo': 'establisc', 'emporto': 'emporte', 'emeto': 'emet',
 'descarto': 'descarte', 'demano': 'demane', 'confirmo': 'confirme', 'comprometo': 'compromet',
 'assumeixo': 'assumisc', 'agafo': 'agafe', 'abordo': 'aborde', 'ordeno': 'ordene',
 'desenvolupo': 'desenvolupe', 'comparo': 'compare', 'instal·lo': 'instal·le', 'etiqueto': 'etiquete',
 'documento': 'documente', 'cerco': 'busque', 'envio': 'envie', 'faig': 'faig', 'diagnostico': 'diagnostique',
 'recomano': 'recomane', 'escolto': 'escolte', 'pregunto': 'pregunte', 'plantejo': 'plantege',
 'ajusto': 'ajuste', 'mesuro': 'mesure', 'preparo': 'prepare', 'pressuposto': 'pressuposte',
 'entrego': 'entregue', 'resolc': 'resolc', 'arreglo': 'arregle', 'acompanyo': 'acompanye',
 # demostratius i possessius
 'aquest': 'este', 'aquesta': 'esta', 'aquests': 'estos', 'aquestes': 'estes',
 'meva': 'meua', 'meves': 'meues', 'teva': 'teua', 'teves': 'teues', 'seva': 'seua', 'seves': 'seues',
 # lèxic
 'avui': 'hui', 'aquí': 'ací', 'Avui': 'Hui', 'Aquí': 'Ací',
 # subjuntius
 'pugui': 'puga', 'puguis': 'pugues', 'puguin': 'puguen', 'tingui': 'tinga', 'tinguis': 'tingues',
 'tinguin': 'tinguen', 'sàpigues': 'sàpies', 'sàpiguis': 'sàpies', 'sigui': 'siga', 'siguin': 'siguen',
 'vulguis': 'vullgues', 'depengui': 'depenga', 'torni': 'torne', 'continuï': 'continue',
 'surtis': 'isques', 'surti': 'isca', 'calgui': 'calga', 'hagi': 'haja', 'hagis': 'hages', 'hagin': 'hagen',
 'entengui': 'entenga', 'arribi': 'arribe', 'funcioni': 'funcione', 'falli': 'falle', 'sàpiga': 'sàpia',
 'facis': 'faces', 'faci': 'faça', 'decideixis': 'decidisques', 'decideixi': 'decidisca',
}
W.update({'contactin':'contacten','repeteixi':'repetisca','estiguin':'estiguen','vagin':'vagen','trobin':'troben','treguis':'tragues','suposi':'supose','siguis':'sigues','porti':'porte','parteixi':'partisca','ocupi':'ocupe','necessitis':'necessites','necessiti':'necessite','marxi':'marxe','garanteixi':'garantisca','faciliti':'facilite','expliqui':'explique','estigui':'estiga','esperis':'esperes','digui':'diga','deixis':'deixes','calguin':'calguen','connecti':'connecte','accedeixi':'accedisca','proveï':'proveïsc','assembli':'assemble'})
out = []
for line in (here / 'ca.txt').read_text().splitlines():
    n, txt = line.split('\t', 1)
    def rep(m):
        w = m.group(0)
        if w in W: return W[w]
        if w[:1].isupper() and w.lower() in W: r = W[w.lower()]; return r[:1].upper() + r[1:]
        return w
    txt = re.sub(r"[A-Za-zÀ-ÿ·]+", rep, txt)
    txt = txt.replace('Sóc ', 'Soc ').replace('Soc en ', 'Soc ').replace('sóc en ', 'soc ').replace('soc en ', 'soc ').replace('ací sota', 'ací baix')
    txt = re.sub(r'\bfeina\b', 'faena', txt); txt = re.sub(r'\bfeines\b', 'faenes', txt); txt = re.sub(r'\bFeina\b', 'Faena', txt)
    out.append(f'{n}\t{txt}')
(here / 'va.txt').write_text('\n'.join(out) + '\n')
print('ok', len(out))
