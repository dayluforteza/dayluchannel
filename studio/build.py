"""Assemble the multi-page site. Run: python3 build.py
Content lives in parts/*.html (sections), blocks.py (shared blocks) and services_data.py (service pages)."""
import re, pathlib, html as H
from blocks import *
from services_data import SERVICES, PROJECTS, HIRING

SV = {s['key']: s for s in SERVICES}
PAGES = [('index', 'index.html', 'Home'), ('services', 'services.html', 'Services'), ('projects', 'projects.html', 'Projects'),
         ('about', 'about.html', 'About me'), ('how', 'how-i-work.html', 'How I work'), ('resources', 'resources.html', 'Resources'),
         ('contact', 'contact.html', 'Contact')]
SUBLINE = {'systems': 'Computers, servers and system services', 'networks': 'Cabling, routers, switches and Wi-Fi',
           'maintenance': 'Diagnosis and preventive care', 'security': 'Settings, permissions and backups',
           'web': 'Websites from €1,000', 'training': 'Training and buying advice'}
BADGE = '<b class="badge">Main</b>'
CHEV = ('<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" '
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def head(title, desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<script>document.documentElement.classList.add('js')</script>
</head>
'''


def nav():
    sub = ''
    for s in SERVICES:
        main = s['key'] == 'web'
        sub += (f'<a class="sub__item{" sub__item--main" if main else ""}" href="{s["file"]}" data-sv="{s["key"]}">'
                f'<span class="mono">{s["n"]}</span><strong>{s["name"]}{BADGE if main else ""}</strong>'
                f'<span>{SUBLINE[s["key"]]}</span></a>')
    items = ''
    for k, h, t in PAGES:
        if k == 'services':
            items += (f'<li class="has-sub"><a href="{h}" data-page="{k}">{t}{CHEV}</a>'
                      f'<div class="sub"><div class="wrap sub__grid">{sub}'
                      f'<a class="sub__all" href="services.html">All services <i>›</i></a></div></div></li>')
        else:
            items += f'<li><a href="{h}" data-page="{k}">{t}</a></li>'
    sheet_sv = ''.join(f'<li><a href="{s["file"]}">{s["name"]}{" " + BADGE if s["key"] == "web" else ""}</a></li>' for s in SERVICES)
    sheet_pg = ''.join(f'<li><a href="{h}" data-page="{k}">{t}</a></li>' for k, h, t in PAGES)
    return f'''<header class="nav">
  <div class="wrap">
    <a class="logo" href="index.html"><i>DF</i>Daylu Forteza</a>
    <nav class="menu" aria-label="Main"><ul>{items}</ul></nav>
    <a class="btn btn--primary btn--sm nav__cta" href="find-your-solution.html">Find your solution</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span></span><span></span></button>
  </div>
</header>
<div class="sheet" id="sheet" hidden>
  <div class="wrap sheet__in">
    <ul class="sheet__pages">{sheet_pg}</ul>
    <div class="sheet__sv"><p class="mono">Services</p><ul>{sheet_sv}</ul></div>
    <div class="sheet__foot"><a class="btn btn--primary" href="find-your-solution.html">Find your solution</a><a class="btn btn--ghost" href="https://wa.me/34663011914" target="_blank" rel="noopener">WhatsApp ›</a><p>+34 663 01 19 14 · info@dayluforteza.com</p></div>
  </div>
</div>
'''


FOOT_SV = ''.join(f'<li><a href="{s["file"]}">{s["name"]}</a></li>' for s in SERVICES)
FOOT = f'''<footer class="site">
  <div class="wrap">
    <div class="cols">
      <div class="brand"><a class="logo" href="index.html"><i>DF</i>Daylu Forteza</a><p>IT services and digital solutions in Málaga and the metro area. By appointment, on site or remote.</p></div>
      <div><h4>Services</h4><ul>{FOOT_SV}</ul></div>
      <div><h4>Website</h4><ul><li><a href="projects.html">Projects</a></li><li><a href="about.html">About me</a></li><li><a href="how-i-work.html">How I work</a></li><li><a href="resources.html">Resources</a></li><li><a href="find-your-solution.html">Find your solution</a></li></ul></div>
      <div><h4>Contact</h4><ul><li>+34 663 01 19 14</li><li>info@dayluforteza.com</li><li><a href="https://wa.me/34663011914" target="_blank" rel="noopener">WhatsApp ›</a></li><li><a href="contact.html">Contact page</a></li></ul></div>
    </div>
    <div class="legal"><span>© 2026 Daylu Forteza · All rights reserved</span><span>Málaga, Spain · By appointment</span></div>
  </div>
</footer>
'''


def fixlinks(h):
    return (h.replace('href="#contact"', 'href="contact.html"')
             .replace('href="websites.html"', 'href="service-web-development.html"')
             .replace('href="method.html"', 'href="how-i-work.html"'))


def page(fname, group, title, desc, body):
    extra = '<script src="assets/spain.js"></script>\n<script src="assets/places.js"></script>\n' if fname == 'contact.html' else ''
    out = (head(title, desc) + f'<body data-page="{group}">\n' + nav() + '<main id="top">\n' + fixlinks(body) + '</main>\n'
           + FOOT + extra + '<script src="assets/site.js"></script>\n</body>\n</html>\n')
    pathlib.Path(fname).write_text(out)


# ---------- catalogue blocks, by id ----------
CAT = P('CATALOGUE')
def cat_block(bid):
    m = re.search(r'(<article class="svc" id="%s">.*?</article>)' % re.escape(bid), CAT, re.S)
    return m.group(1) if m else ''


# ---------- service tiles that link to the pages ----------
TILE_ORDER = ['systems', 'networks', 'maintenance', 'security', 'web', 'training']
def service_tiles():
    a = P('AREAS')
    tiles = re.findall(r'<article class="tile[^"]*">.*?</article>', a, re.S)
    out = []
    for key, t in zip(TILE_ORDER, tiles):
        s = SV[key]
        t = re.sub(r'^<article class="(tile[^"]*)">', lambda m: f'<a class="{m.group(1)} tile--link" href="{s["file"]}">', t)
        t = t[:-len('</article>')] + f'<span class="more-link">{"Main service · " if key == "web" else ""}Details ›</span></a>'
        out.append(t)
    head_end = a.index('<div class="bento">')
    return a[:head_end] + '<div class="bento">' + '\n'.join(out) + '</div>\n    </div>\n  </section>\n'


def lis(xs, cls=''):
    return ''.join(f'<li{cls}>{x}</li>' for x in xs)


def service_page(s):
    k = s['key']
    jumps = [('problems', 'Problems'), ('gets', 'What you get')]
    detail = ''
    if s['blocks']:
        jumps.append(('detail', 'In detail'))
        detail = f'''
  <section id="detail" class="detail" aria-labelledby="dt-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">In detail</p><h2 class="h-l" id="dt-h">What the work looks like.</h2></div>
      <div class="cat__body" style="margin-top:56px">{''.join(cat_block(b) for b in s['blocks'])}</div>
    </div>
  </section>'''
    if k == 'web':
        jumps += [('web', 'The offer'), ('build', 'How it is built'), ('own', 'Ownership')]
        detail = P('WEBSITES') + P('BUILD') + OWN
    jumps += [('includes', 'Includes')] + ([] if k == 'web' else [('steps', 'How it goes')])
    if s['faq'] or k == 'web':
        jumps.append(('sfaq', 'Questions'))
    glyph = 'websites' if k == 'web' else 'services'
    hero = page_hero(glyph, f'<a href="services.html">Services</a><span>/</span><span>{s["name"]}</span>', s['title'], s['lead'], jumps)
    hero = hero.replace('<h1 class="h-xl" id="ph-h">', f'<p class="sv-n" aria-hidden="true">{s["n"]}</p><h1 class="h-xl" id="ph-h">', 1)
    if k == 'web':
        hero = hero.replace('<div class="jump">', '<p class="sv-main">Main service · from €1,000</p><div class="jump">', 1)

    problems = f'''
  <section id="problems" aria-labelledby="pr-h">
    <div class="wrap split">
      <div><p class="eyebrow">Problems it solves</p><h2 class="h-l" id="pr-h">Sound familiar?</h2><p class="lead" style="margin-top:18px">These are the cases that reach me most often in {s['name'].lower()}.</p></div>
      <ol class="problems">{''.join(f'<li><span class="mono">{i+1:02d}</span><span>{p}</span></li>' for i, p in enumerate(s['problems']))}</ol>
    </div>
  </section>'''
    gets = f'''
  <section id="gets" style="background: var(--bg-2)" aria-labelledby="gt-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">What you get</p><h2 class="h-l" id="gt-h">The result, in plain words.</h2></div>
      <div class="gets">{''.join(f'<article class="get"><span class="get__n">{i+1:02d}</span><p>{g}</p></article>' for i, g in enumerate(s['gets']))}</div>
    </div>
  </section>'''
    includes = f'''
  <section id="includes" aria-labelledby="in2-h">
    <div class="wrap split">
      <div><p class="eyebrow">What it includes</p><h2 class="h-l" id="in2-h">Everything in the scope.</h2><ul class="incl">{lis(s['includes'])}</ul></div>
      <div><p class="eyebrow">Who it is for</p><h2 class="h-m" style="margin-bottom:24px">Built for</h2><ul class="whofor">{lis(s['who'])}</ul>
      <a class="btn btn--primary" style="margin-top:28px" href="contact.html">{s['cta']}</a></div>
    </div>
  </section>'''
    steps = f'''
  <section id="steps" class="band" aria-labelledby="sp-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">How it goes</p><h2 class="h-l" id="sp-h">Four steps, start to finish.</h2></div>
      <ol class="stepper draw">{''.join(f'<li><span class="stepper__dot">{i+1:02d}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(s['steps']))}</ol>
    </div>
  </section>'''
    if k == 'web':
        faq = WEBFAQ.replace('id="webfaq"', 'id="sfaq"')
    elif s['faq']:
        faq = f'''
  <section id="sfaq" style="background: var(--bg-2)" aria-labelledby="sf-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Questions</p><h2 class="h-l" id="sf-h">Asked about {s['name'].lower()}.</h2></div>
      <div class="faq">{''.join(f'<details><summary><span>{q}</span></summary><p>{a}</p></details>' for q, a in s['faq'])}</div>
    </div>
  </section>'''
    else:
        faq = ''
    others = ''.join(f'<a class="oth{" oth--main" if o["key"] == "web" else ""}" href="{o["file"]}"><span class="mono">{o["n"]}</span><strong>{o["name"]}</strong><span>{SUBLINE[o["key"]]}</span><i>›</i></a>' for o in SERVICES if o['key'] != k)
    other = f'''
  <section id="other" aria-labelledby="ot-h">
    <div class="wrap"><p class="eyebrow">Other services</p><h2 class="h-m" id="ot-h">Often needed together.</h2><div class="others">{others}</div></div>
  </section>'''
    body = hero + problems + gets + detail + includes + ('' if k == 'web' else steps) + faq + other + cta(s['cta'] + '.', 'Tell me the case with whatever detail you have. You get a reasoned diagnosis, with no commitment and no unnecessary jargon.')
    body = body.replace('<a class="btn btn--primary" href="contact.html">Tell me your case</a>', f'<a class="btn btn--primary" href="contact.html">{s["cta"]}</a>')
    page(s['file'], 'services', f'{s["name"]} · Daylu Forteza', s['lead'][:150].rsplit(' ', 1)[0] + '.', body)


# ---------- home ----------
HOME_SV = """
  <section id="home-services" aria-labelledby="hs-h">
    <div class="wrap">
      <div class="hs-head"><div><p class="eyebrow">Services</p><h2 class="h-l" id="hs-h">What I can do for you.</h2></div><a class="btn btn--ghost" href="services.html">All services ›</a></div>
      <ul class="hs">""" + ''.join(f'<li><a class="hs__row{" hs__row--main" if s["key"] == "web" else ""}" href="{s["file"]}"><span class="mono">{s["n"]}</span><strong>{s["name"]}{" " + BADGE if s["key"] == "web" else ""}</strong><span class="hs__line">{SUBLINE[s["key"]]}</span><i>›</i></a></li>' for s in SERVICES) + """</ul>
    </div>
  </section>
"""
WEBTEASE = """
  <section id="webtease" class="band" aria-labelledby="wt-h">
    <div class="wrap center">
      <p class="eyebrow">Main service</p>
      <h2 class="h-xl" id="wt-h">Websites from €1,000.</h2>
      <p class="lead" style="margin-top:20px">The offer, how a site gets built and what you own at the end, all on one page.</p>
      <div class="hero__cta"><a class="btn btn--primary" href="service-web-development.html">See web development</a></div>
    </div>
  </section>
"""

EXPLORE2 = '''
  <section id="explore" style="background: var(--bg-2)" aria-labelledby="ex-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Explore</p><h2 class="h-l" id="ex-h">Go as deep as you want.</h2></div>
      <div class="explore">
        <a class="xcard wide" href="find-your-solution.html" style="background:var(--bg)"><div><p class="mono">Find your solution</p><h3>Describe the problem. Get the service.</h3><p>Nine common cases, each one linked to the service that solves it.</p></div><span class="go">Find your solution <i>›</i></span></a>
        <a class="xcard wide dark" href="how-i-work.html"><div><p class="mono">How I work</p><h3>Six stages, no mystery.</h3><p>From the first message to the handover, with scope and price in writing.</p></div><span class="go">See how I work <i>›</i></span></a>
        <a class="xcard" href="projects.html" style="background:var(--bg)"><div><p class="mono">Projects</p><h3>How I would approach it.</h3><p>Nine concepts across networks, systems, security and web.</p></div><span class="go">See the projects <i>›</i></span></a>
        <a class="xcard" href="about.html" style="background:var(--bg)"><div><p class="mono">About me</p><h3>The person behind it.</h3><p>Trajectory, tools and how I work.</p></div><span class="go">Read my story <i>›</i></span></a>
        <a class="xcard" href="contact.html" style="background:var(--bg)"><div><p class="mono">Contact</p><h3>One message is enough.</h3><p>WhatsApp, phone or email. By appointment in Málaga.</p></div><span class="go">Get in touch <i>›</i></span></a>
      </div>
    </div>
  </section>
'''
page('index.html', 'index', 'Daylu Forteza', 'IT services and websites in Málaga: systems, networks, maintenance, security, web development and training by Daylu Forteza.',
     P('HERO') + P('STATEMENT') + HOME_SV + WEBTEASE + EXPLORE2 + cta())

# ---------- services overview ----------
page('services.html', 'services', 'Services · Daylu Forteza', 'Six IT services in Málaga: systems, networks, maintenance, security, web development and training.',
     page_hero('services', 'Services', 'Six services. One technician.', 'Choose a service to see the problems it solves, what it includes, how it goes and the questions people ask about it.', [('areas', 'The six services'), ('scope', 'What I do and don’t'), ('office', 'Inside an office')])
     + service_tiles() + P('SCOPE') + P('OFFICE') + cta())

for s in SERVICES:
    service_page(s)

# ---------- projects ----------
cats = sorted({c for c, _, _ in PROJECTS}, key=lambda c: [p[0] for p in PROJECTS].index(c))
proj_cards = ''.join(f'<article class="pcard" data-cat="{c}"><p class="mono"><span>{c}</span><span class="pill">Concept</span></p><h3>{t}</h3><p>{d}</p></article>' for c, t, d in PROJECTS)
PROJ = f'''
  <section id="projects" aria-label="Projects">
    <div class="wrap">
      <div class="filters" id="filters" role="group" aria-label="Filter projects"><button type="button" aria-pressed="true" data-f="all">All</button>{''.join(f'<button type="button" aria-pressed="false" data-f="{c}">{c}</button>' for c in cats)}</div>
      <div class="pgrid" id="pgrid">{proj_cards}</div>
      <p class="note">Cards marked “Concept” are work proposals and design concepts, not finished client jobs. They show the criteria I apply to each kind of need.</p>
    </div>
  </section>
'''
page('projects.html', 'projects', 'Projects · Daylu Forteza', 'Projects and concepts by Daylu Forteza: networks, cabling, systems, maintenance, web and security.',
     page_hero('about', 'Projects', 'Real cases and concepts, nothing faked.', 'Each card shows how I would approach a type of need. Filter by area to see the ones closest to yours.') + PROJ + cta('Have a similar case?'))

# ---------- about ----------
page('about.html', 'about', 'About me · Daylu Forteza', 'Who Daylu Forteza is: IT technician in Málaga, trajectory, environments and the tools behind the work.',
     page_hero('about', 'About me', 'Hi, I am Daylu.', 'IT technician and web developer in Málaga. Training, support and hands-on work since 2017, with the same care for one laptop as for a whole office.', [('intro', 'Who I am'), ('trajectory', 'Trajectory'), ('stack', 'Tools'), ('values', 'How I work')])
     + INTRO + TIMELINE + STACK + VALUES + cta())

# ---------- how I work ----------
HIRE = f'''
  <section id="hiring" class="band" aria-labelledby="hr-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Hiring</p><h2 class="h-l" id="hr-h">From the first message to the close.</h2><p class="lead" style="margin-top:18px">The first contact carries no commitment. If your case does not fit what I can offer, I will tell you clearly.</p></div>
      <ol class="hire" id="hire">{''.join(f'<li><span class="hire__n">{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></li>' for i, (t, d) in enumerate(HIRING))}</ol>
    </div>
  </section>
'''
page('how-i-work.html', 'how', 'How I work · Daylu Forteza', 'How Daylu Forteza works: six stages, written scope and price, documented handover.',
     page_hero('method', 'How I work', 'Six stages, from your message to the handover.', 'You do not need technical words to explain what is happening. You always know where your case is, what comes next and what it costs.', [('method', 'Six stages'), ('hiring', 'Hiring'), ('modes', 'Ways to work'), ('handover', 'Handover'), ('faq', 'Questions')])
     + P('METHOD') + HIRE + P('WAYS_TO_WORK') + P('HANDOVER') + P('FAQ') + cta())

# ---------- resources ----------
res = P('RESOURCES').replace('<p class="eyebrow">Resources</p>\n        <h2 class="h-l" id="res-h">Clear explanations of what fails, and why.</h2>', '<h2 class="h-l" id="res-h">Latest articles</h2>')
page('resources.html', 'resources', 'Resources · Daylu Forteza', 'Clear explanations of what fails and why: maintenance, networks and web, by Daylu Forteza.',
     page_hero('about', 'Resources', 'Clear explanations of what fails, and why.', 'No hype and no alarmist headlines: practical criteria to understand your technology and decide better.') + res + cta())

# ---------- find your solution ----------
page('find-your-solution.html', 'find', 'Find your solution · Daylu Forteza', 'Pick the problem that sounds like yours and see how Daylu Forteza would solve it.',
     page_hero('services', 'Find your solution', 'Not sure what you need?', 'Pick the problem that sounds like yours, or tell me who you are. You do not need the technical name for anything.', [('finder', 'By problem'), ('coverage', 'By type of client')])
     + P('SYMPTOM_FINDER') + COVER + cta())

# ---------- contact ----------
contact = P('CONTACT').replace('<h2 class="h-xl" id="contact-h">Tell me your case.</h2>', '<h1 class="h-xl" id="contact-h">Tell me your case.</h1>').replace('class="contact band"', 'class="contact" style="padding-top:clamp(110px,14vw,170px)"')
page('contact.html', 'contact', 'Contact · Daylu Forteza', 'Contact Daylu Forteza in Málaga by WhatsApp, phone or email, and see the places where Daylu Forteza works.', contact + MAP)
print('built', len(SERVICES) + 8, 'pages')
