"""Assemble the multi-page site from parts/. Run: python3 build.py"""
import re, pathlib
P = lambda n: pathlib.Path('parts', n + '.html').read_text()

def fix(h):
    h = h.replace('href="#contact"', 'href="contact.html"')
    return h

NAV = [('index','index.html','Home'),('about','about.html','About me'),('services','services.html','Services'),('websites','websites.html','Web development'),('contact','contact.html','Contact')]

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
    items = ''.join(f'<li><a href="{h}" data-page="{k}">{t}{"<b class=\"badge\">Main</b>" if k=="websites" else ""}</a></li>' for k,h,t in NAV[1:])
    return f'''<header class="nav">
  <div class="wrap">
    <a class="logo" href="index.html"><i>DF</i>Daylu Forteza</a>
    <ul>{items}</ul>
    <a class="btn btn--primary btn--sm" href="contact.html">Tell me your case</a>
  </div>
</header>
'''

FOOT = '''<footer class="site">
  <div class="wrap">
    <div class="cols">
      <div class="brand"><a class="logo" href="index.html"><i>DF</i>Daylu Forteza</a><p>IT services and digital solutions in Málaga and the metro area. By appointment, on site or remote.</p></div>
      <div><h4>Pages</h4><ul><li><a href="about.html">About me</a></li><li><a href="services.html">Services</a></li><li><a href="websites.html">Web development</a></li><li><a href="method.html">Method</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div><h4>Services</h4><ul><li><a href="services.html">Systems</a></li><li><a href="services.html">Networks</a></li><li><a href="services.html">Maintenance</a></li><li><a href="services.html">Security</a></li><li><a href="websites.html">Web development</a></li><li><a href="services.html">Training</a></li></ul></div>
      <div><h4>Contact</h4><ul><li>+34 663 01 19 14</li><li>info@dayluforteza.com</li><li><a href="https://wa.me/34663011914" target="_blank" rel="noopener">WhatsApp ›</a></li></ul></div>
    </div>
    <div class="legal"><span>© 2026 Daylu Forteza · All rights reserved</span><span>Málaga, Spain</span></div>
  </div>
</footer>
'''

def cta(title='Tell me your case.', lead='A short description is enough to start. If it is not something I can help with, I will tell you who can.'):
    return f'''
  <section class="cta band" aria-labelledby="cta-h">
    <div class="wrap">
      <p class="eyebrow">Next step</p>
      <h2 class="h-xl" id="cta-h">{title}</h2>
      <p class="lead">{lead}</p>
      <div class="hero__cta"><a class="btn btn--primary" href="contact.html">Tell me your case</a><a class="btn btn--ghost" href="https://wa.me/34663011914" target="_blank" rel="noopener">Write on WhatsApp ›</a></div>
    </div>
  </section>
'''

GLYPHS = {
 'services': '<svg viewBox="0 0 300 300" fill="none"><g class="spin"><circle cx="150" cy="150" r="130" stroke="var(--line)" stroke-dasharray="4 8"/></g><circle cx="150" cy="150" r="22" fill="var(--accent)"/><g stroke="var(--accent)" stroke-width="2"><path d="M150 150 60 80M150 150l90-70M150 150 60 220M150 150l90 70M150 150V30M150 150v120"/></g><g fill="var(--bg)" stroke="var(--fg)" stroke-opacity=".5" stroke-width="2"><circle cx="60" cy="80" r="14"/><circle cx="240" cy="80" r="14"/><circle cx="60" cy="220" r="14"/><circle cx="240" cy="220" r="14"/><circle cx="150" cy="30" r="14"/><circle cx="150" cy="270" r="14"/></g></svg>',
 'method': '<svg viewBox="0 0 300 300" fill="none"><g class="spin"><circle cx="150" cy="150" r="130" stroke="var(--accent)" stroke-width="10" stroke-dasharray="120 16" stroke-linecap="round" opacity=".85"/></g><text x="150" y="162" text-anchor="middle" font-family="var(--display)" font-weight="600" font-size="44" fill="var(--fg)">1–6</text></svg>',
 'websites': '<svg viewBox="0 0 300 300" fill="none"><rect x="20" y="50" width="220" height="160" rx="14" stroke="var(--fg)" stroke-opacity=".4" stroke-width="2"/><rect x="40" y="80" width="120" height="14" rx="7" fill="var(--fg)"/><rect x="40" y="104" width="80" height="9" rx="4.5" fill="var(--line)"/><rect x="40" y="126" width="60" height="18" rx="9" fill="var(--accent)"/><rect x="200" y="110" width="84" height="160" rx="18" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/><rect x="214" y="140" width="52" height="9" rx="4.5" fill="var(--fg)"/><rect x="214" y="158" width="34" height="14" rx="7" fill="var(--accent)"/></svg>',
 'about': '<svg viewBox="0 0 300 300" fill="none"><path d="M40 250 C 90 240, 110 170, 150 150 S 230 70, 260 50" stroke="var(--accent)" stroke-width="3"/><g fill="var(--bg)" stroke="var(--accent)" stroke-width="3"><circle cx="40" cy="250" r="9"/><circle cx="150" cy="150" r="9"/><circle cx="260" cy="50" r="9"/></g><g font-family="var(--mono)" font-size="12" fill="var(--muted)"><text x="54" y="268">2017</text><text x="166" y="170">2018</text><text x="200" y="40">TODAY</text></g></svg>',
 'contact': '<svg viewBox="0 0 300 300" fill="none"><rect x="40" y="70" width="200" height="130" rx="22" fill="var(--accent)"/><path d="M80 200 70 240l50-40" fill="var(--accent)"/><g fill="#fff"><circle cx="100" cy="135" r="9" class="pulse"/><circle cx="140" cy="135" r="9" class="pulse" style="animation-delay:.3s"/><circle cx="180" cy="135" r="9" class="pulse" style="animation-delay:.6s"/></g></svg>',
}

def page_hero(key, crumb, h1, lead, jumps=()):
    j = ''.join(f'<a href="#{a}">{t}</a>' for a,t in jumps)
    jj = f'<div class="jump">{j}</div>' if j else ''
    return f'''
  <section class="page-hero" aria-labelledby="ph-h">
    <div class="wrap">
      <p class="crumb"><a href="index.html">Daylu Forteza</a><span>/</span><span>{crumb}</span></p>
      <h1 class="h-xl" id="ph-h">{h1}</h1>
      <p class="lead">{lead}</p>
      {jj}
    </div>
    <div class="glyph" aria-hidden="true">{GLYPHS[key]}</div>
  </section>
'''

def page(key, title, desc, body):
    extra = '<script src="assets/spain.js"></script>\n<script src="assets/places.js"></script>\n' if key == 'contact' else ''
    html = head(title, desc) + f'<body data-page="{key}">\n' + nav() + '<main id="top">\n' + fix(body) + '</main>\n' + FOOT + extra + '<script src="assets/site.js"></script>\n</body>\n</html>\n'
    pathlib.Path(f'{"index" if key=="index" else key}.html').write_text(html)
    return html


INTRO = """
  <!-- INTRO -->
  <section id="intro" aria-labelledby="in-h">
    <div class="wrap intro">
      <div class="intro__text">
        <p class="eyebrow">Who I am</p>
        <h2 class="h-l" id="in-h">An IT technician who explains every step.</h2>
        <p>I am Daylu Forteza, an IT technician trained in network computer systems administration (ASIR) and microcomputer systems and networks (SMR).</p>
        <p>Since 2017 I have combined technology with teaching, helping people understand and use it better. Since 2018 I have also worked in technical support, on site and remotely: repairs, incidents, networks and systems, including specialised equipment and software in the healthcare sector.</p>
        <p>That taught me something I bring to every job: behind each technical problem there is a person who needs it solved. Knowing systems is half the work. The other half is listening, explaining and choosing the fix that still makes sense in a year.</p>
      </div>
      <aside class="idcard" aria-label="Profile">
        <div class="idcard__top"><i>DF</i><div><strong>Daylu Forteza</strong><span>IT technician · Web developer</span></div></div>
        <dl>
          <div><dt>Based in</dt><dd>Málaga, Spain</dd></div>
          <div><dt>Working since</dt><dd>2017</dd></div>
          <div><dt>Works</dt><dd>On site and remote</dd></div>
          <div><dt>Availability</dt><dd>By appointment</dd></div>
          <div><dt>Main focus</dt><dd>Websites and systems</dd></div>
        </dl>
        <a class="btn btn--primary" href="contact.html">Tell me your case</a>
      </aside>
    </div>
  </section>
"""

ENVS = """
  <!-- ENVIRONMENTS -->
  <section id="worked" style="background: var(--bg-2)" aria-labelledby="env-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Where I have worked</p>
        <h2 class="h-l" id="env-h">Different places, the same standard.</h2>
        <p class="lead" style="margin-top:18px">Each environment asked for something different. Together they shaped how I work today.</p>
      </div>
      <div class="envs">
        <article class="env"><p class="mono">Training · since 2017</p><h3>Classrooms and one-to-one sessions</h3><p>Teaching technology to people of every level. Patience, clear language, nothing assumed.</p><span class="env__k">Explaining</span></article>
        <article class="env"><p class="mono">Support · since 2018</p><h3>Technical support, on site and remote</h3><p>Repairs, incidents and configuration of networks and systems, under time pressure.</p><span class="env__k">Solving</span></article>
        <article class="env"><p class="mono">Healthcare</p><h3>Specialised equipment and software</h3><p>Systems where a failure affects patients. Every change careful, every step written down.</p><span class="env__k">Precision</span></article>
      </div>
    </div>
  </section>
"""

STACK_ITEMS = [("Systems",["Windows","Windows Server","macOS","Users and permissions","Shared resources"]),("Networks",["Structured cabling","Routers","Switches","Access points","VPN","Cisco routing and switching"]),("Support",["Diagnosis","Preventive maintenance","Remote support","Backups","Hardware upgrades"]),("Web",["HTML","CSS","JavaScript","PHP","MySQL","Responsive design"])]
row1 = ' '.join(x for _,xs in STACK_ITEMS[:2] for x in xs).split(' ')
def mq(items): return ''.join(f'<span>{x}</span>' for x in items)
ALL = [x for _,xs in STACK_ITEMS for x in xs]
STACK = f"""
  <!-- STACK -->
  <section id="stack" aria-labelledby="st-h">
    <div class="wrap center">
      <p class="eyebrow">What I work with</p>
      <h2 class="h-l" id="st-h">The tools behind the work.</h2>
    </div>
    <div class="marquee" aria-hidden="true"><div class="marquee__row">{mq(ALL[:11]*2)}</div><div class="marquee__row rev">{mq(ALL[11:]*2)}</div></div>
    <div class="wrap">
      <div class="stackgrid">{''.join(f'<div class="sg"><h3>{g}</h3><ul>{"".join(f"<li>{x}</li>" for x in xs)}</ul></div>' for g,xs in STACK_ITEMS)}</div>
    </div>
  </section>
"""

OWN = """
  <!-- OWNERSHIP -->
  <section id="own" aria-labelledby="own-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Ownership</p>
        <h2 class="h-l" id="own-h">At launch, you get four keys.</h2>
        <p class="lead" style="margin-top:18px">Nothing stays tied to me. If one day you want another person to look after your site, you hand them these.</p>
      </div>
      <div class="keys draw">
        <article class="key"><span class="key__n">01</span><h3>Domain</h3><p>Registered in your name, with the access details.</p></article>
        <article class="key"><span class="key__n">02</span><h3>Hosting</h3><p>Your account with the provider, not a reseller’s.</p></article>
        <article class="key"><span class="key__n">03</span><h3>Code</h3><p>Standard HTML, CSS and JavaScript any developer can read.</p></article>
        <article class="key"><span class="key__n">04</span><h3>Content</h3><p>Texts and images you can edit or take with you.</p></article>
      </div>
    </div>
  </section>
"""

WEBFAQ = """
  <!-- WEB FAQ -->
  <section id="webfaq" style="background: var(--bg-2)" aria-labelledby="wf-h">
    <div class="wrap">
      <div class="center"><p class="eyebrow">Questions</p><h2 class="h-l" id="wf-h">Before you ask for a quote.</h2></div>
      <div class="faq">
        <details><summary><span>Can I update the website myself?</span></summary><p>Yes, if you need to. I can deliver it with a simple editor and show you how to change the content that updates often.</p></details>
        <details><summary><span>Are domain and hosting included?</span></summary><p>They can be part of the proposal. The cost depends on the provider and the expected traffic, and they are always in your name.</p></details>
        <details><summary><span>How long does it take?</span></summary><p>It depends on the number of sections and on when texts and images are ready. The proposal shows the phases and the expected dates.</p></details>
        <details><summary><span>Do you guarantee first place on Google?</span></summary><p>No, and be wary of anyone who does. You get the technical base and the content ready to rank with real work.</p></details>
        <details><summary><span>What does €1,000 include?</span></summary><p>A landing page or a compact corporate site with structure, copy, design, responsive build, a working form, publishing and setup in your name. Larger sites get a fixed quote first.</p></details>
      </div>
    </div>
  </section>
"""

MAP = """
  <!-- MAP -->
  <section id="map" class="band" aria-labelledby="map-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Where I work</p>
        <h2 class="h-l" id="map-h">A map that grows with every client.</h2>
        <p class="lead" style="margin-top:18px">Based in Málaga, on site across the metro area and remote anywhere in Spain. Each place I work in joins the network.</p>
      </div>
      <div class="es">
        <div class="es__map"><svg id="es-svg" role="img" aria-label="Map of Spain with the places Daylu Forteza works in"></svg></div>
        <aside class="es__side">
          <div class="es__stats"><div><strong id="es-places">0</strong><span>places</span></div><div><strong id="es-prov">0</strong><span>provinces</span></div><div><strong id="es-links">0</strong><span>connections</span></div></div>
          <ol class="es__list" id="es-list"></ol>
          <p class="es__legend"><i class="lg-base"></i>Base &nbsp; <i class="lg-site"></i>Client location &nbsp; <i class="lg-line"></i>Connection</p>
        </aside>
      </div>
    </div>
  </section>
"""

# ---------- new blocks ----------
cells_xy = [(260,78),(409,164),(409,336),(260,422),(111,336),(111,164)]
names = ['Systems','Networks','Maintenance','Security','Web','Training']
cells = ''.join(f'<g class="cell"><circle class="dot" cx="{x}" cy="{y}" r="40" fill="var(--accent)"/><text x="{x}" y="{y+5}" text-anchor="middle" font-family="var(--text)" font-size="13" font-weight="500" fill="#fff">{n}</text></g>' for (x,y),n in zip(cells_xy,names))
COVER = f'''
  <!-- COVERAGE -->
  <section id="coverage" aria-labelledby="cov-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Who I work with</p>
        <h2 class="h-l" id="cov-h">Whoever you are, it is covered.</h2>
        <p class="lead" style="margin-top:18px">From one laptop at home to an office full of desks. I adapt to the size and the pace of each client. Choose yours.</p>
      </div>
      <div class="chips-row" id="who" role="group" aria-label="Type of client">
        <button type="button" data-k="home">Home</button><button type="button" data-k="freelancer">Freelancer</button><button type="button" data-k="shop">Shop</button><button type="button" data-k="office">Office</button><button type="button" data-k="clinic">Clinic</button><button type="button" data-k="school">School</button><button type="button" data-k="startup">New business</button>
      </div>
      <div class="cover">
        <div class="cover-map" aria-hidden="true">
          <svg viewBox="0 0 520 500" id="cover-svg">
            <circle cx="260" cy="250" r="182" stroke="var(--line)" stroke-width="2" fill="none"/>
            <circle id="cover-arc" cx="260" cy="250" r="182" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round" transform="rotate(-90 260 250)" style="transition: stroke-dashoffset .8s var(--ease)"/>
            {cells}
          </svg>
          <div class="center"><strong id="cover-n">0</strong><span id="cover-of">of 6 areas</span></div>
        </div>
        <div class="jobs" aria-live="polite">
          <h3 id="jobs-t">For a freelancer</h3>
          <p>Typical jobs I take on from start to finish:</p>
          <ul id="jobs-l"></ul>
          <p class="more">Not on the list? Ask anyway. If it is not for me, I will tell you who it is for.</p>
        </div>
      </div>
    </div>
  </section>
'''

EXPLORE = '''
  <!-- EXPLORE -->
  <section id="explore" style="background: var(--bg-2)" aria-labelledby="ex-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Explore</p>
        <h2 class="h-l" id="ex-h">Go as deep as you want.</h2>
      </div>
      <div class="explore">
        <a class="xcard wide" href="services.html" style="background:var(--bg)"><div><p class="mono">Services</p><h3>Each service, opened up.</h3><p>Problems, results, what is included and who it is for. Plus an office network you can click through.</p></div><span class="go">See the services <i>›</i></span></a>
        <a class="xcard wide dark" href="websites.html"><div><p class="mono">Websites</p><h3>Your site, your name, your code.</h3><p>Hand-written websites from €1,000, with domain and hosting in your name.</p></div><span class="go">See how a site is built <i>›</i></span></a>
        <a class="xcard" href="method.html" style="background:var(--bg)"><div><p class="mono">Method</p><h3>Six stages, no mystery.</h3><p>What happens from the first message to the handover.</p></div><span class="go">See the method <i>›</i></span></a>
        <a class="xcard" href="about.html" style="background:var(--bg)"><div><p class="mono">About</p><h3>The person behind it.</h3><p>Trajectory, qualifications and how I work.</p></div><span class="go">Read my story <i>›</i></span></a>
        <a class="xcard" href="contact.html" style="background:var(--bg)"><div><p class="mono">Contact</p><h3>One message is enough.</h3><p>WhatsApp, phone or email. By appointment in Málaga.</p></div><span class="go">Get in touch <i>›</i></span></a>
      </div>
    </div>
  </section>
'''

TIMELINE = '''
  <!-- TIMELINE -->
  <section id="trajectory" aria-labelledby="tl-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">Trajectory</p>
        <h2 class="h-l" id="tl-h">How I got here.</h2>
        <p class="lead" style="margin-top:18px">Training, support and hands-on work, step by step. Each stage added something I now bring to every job.</p>
      </div>
      <div class="tline" id="tline">
        <div class="tl-rail" aria-hidden="true"><div class="tl-fill"></div></div>
        <ol class="tl-items">
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">SMR</div><p class="kind">Education</p><h3>Microcomputer systems and networks</h3><p>The base: assembling, installing and connecting computers and networks.</p><div class="tl-tags"><span>Hardware</span><span>Operating systems</span><span>Networks</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">ASIR</div><p class="kind">Higher education</p><h3>Network computer systems administration</h3><p>Servers, services, security and the administration of whole networks.</p><div class="tl-tags"><span>Windows Server</span><span>Services</span><span>Security</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">Cisco</div><p class="kind">Certification</p><h3>IT Essentials and CCNA Routing and Switching</h3><p>Routing, switching and the way real networks are designed.</p><div class="tl-tags"><span>Routing</span><span>Switching</span><span>VLAN</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">2017</div><p class="kind">Training</p><h3>Teaching technology</h3><p>Helping people understand and use their technology. I learned to explain without assuming anything.</p><div class="tl-tags"><span>Classes</span><span>All levels</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">2018</div><p class="kind">Technical support</p><h3>On-site and remote support</h3><p>Repairs, incidents, network and system configuration, day after day.</p><div class="tl-tags"><span>Repairs</span><span>Incidents</span><span>Remote</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">Health</div><p class="kind">Specialised sector</p><h3>Equipment and software in healthcare</h3><p>Work where a failure affects patients, so every step is careful and documented.</p><div class="tl-tags"><span>Specialised software</span><span>Critical systems</span></div></div></li>
          <li class="tle"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">Today</div><p class="kind">Own practice</p><h3>IT services and websites in Málaga</h3><p>Systems, networks, maintenance, security, web and training for every kind of client.</p><div class="tl-tags"><span>Málaga</span><span>By appointment</span></div></div></li>
          <li class="tle next"><span class="node" aria-hidden="true"></span><div class="card"><div class="when">Next</div><p class="kind">Your project</p><h3>The next line on this timeline</h3><p>Tell me what you need and let us add it.</p><div class="tl-tags"><a class="btn btn--primary btn--sm" href="contact.html">Tell me your case</a></div></div></li>
        </ol>
      </div>
    </div>
  </section>
'''

ICON = {
 'commit':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
 'care':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h6"/></svg>',
 'straight':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
 'adapt':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
}
VALUES = f'''
  <!-- VALUES -->
  <section id="values" aria-labelledby="val-h">
    <div class="wrap">
      <div class="center">
        <p class="eyebrow">How I work</p>
        <h2 class="h-l" id="val-h">When I commit, I see it through.</h2>
      </div>
      <div class="values">
        <article class="value"><span class="ic">{ICON['commit']}</span><h3>Committed</h3><p>Once I take a job, it is finished, tested and explained. Nothing is left half done.</p></article>
        <article class="value"><span class="ic">{ICON['care']}</span><h3>Meticulous</h3><p>Every cable labelled, every change written down. Work that the next person can read.</p></article>
        <article class="value"><span class="ic">{ICON['straight']}</span><h3>Straight</h3><p>If something is not worth paying for, I say so, even when it means less work for me.</p></article>
        <article class="value"><span class="ic">{ICON['adapt']}</span><h3>Adaptable</h3><p>A retired neighbour or a busy office: the explanation and the pace fit the person.</p></article>
      </div>
    </div>
  </section>
'''

areas = P('AREAS').replace('<p class="lead" style="margin-top:18px">From the first cable','<p class="lead" style="margin-top:18px">From the first cable')
areas = areas.replace('<div class="bento">','<div class="bento">',1)
areas = areas.replace('</div>\n    </div>\n  </section>', '</div>\n      <div class="hero__cta"><a class="btn btn--primary" href="services.html">See every service in depth</a></div>\n    </div>\n  </section>',1) if False else areas
areas = re.sub(r'(<div class="bento">.*</div>)(\s*</div>\s*</section>)', lambda m: m.group(1)+'\n      <div class="hero__cta" style="margin-top:48px"><a class="btn btn--primary" href="services.html">See every service in depth</a></div>'+m.group(2), areas, flags=re.S)


page('index','Daylu Forteza','IT services and websites in Málaga: systems, networks, maintenance, security, web development and training by Daylu Forteza.',
  P('HERO') + P('STATEMENT') + COVER + areas + EXPLORE + cta())

page('about','About me · Daylu Forteza','Who Daylu Forteza is: IT technician in Málaga, trajectory, environments and the tools he works with.',
  page_hero('about','About me','Hi, I am Daylu.','IT technician and web developer in Málaga. Training, support and hands-on work since 2017, with the same care for one laptop as for a whole office.',[('intro','Who I am'),('trajectory','Trajectory'),('worked','Where I have worked'),('stack','Tools'),('values','How I work')])
  + INTRO + TIMELINE + ENVS + STACK + VALUES + P('ABOUT') + cta())

page('services','Services · Daylu Forteza','IT services in detail: structured cabling, network equipment, servers, operating systems, system services, maintenance, security and training in Málaga.',
  page_hero('services','Services','Every service, in detail.','What each job includes, what you keep when it is done and who it is for. From the first cable to the services that make an office work.',[('catalogue','Catalogue'),('scope','What I do and don’t'),('finder','Diagnosis'),('office','Inside an office')])
  + P('CATALOGUE') + P('SCOPE') + P('SYMPTOM_FINDER') + P('OFFICE') + P('CONCEPTS') + P('RESOURCES') + cta('Recognise your problem?'))

page('websites','Web development · Daylu Forteza','Hand-written websites from €1,000 in Málaga, with domain, hosting and code in the client’s name.',
  page_hero('websites','Web development','Your business, explained in one website.','Corporate sites and landing pages written by hand, designed for the phone first and registered in your name. From €1,000.',[('web','The offer'),('build','How it is built'),('own','Ownership'),('webfaq','Questions')])
  + P('WEBSITES') + P('BUILD') + OWN + WEBFAQ + cta('Ask for a website quote.','Tell me what your business does and what the site must achieve. You get a fixed quote before any work starts.'))

page('method','Method · Daylu Forteza','How Daylu Forteza works: six stages, written scope and price, documented handover.',
  page_hero('method','Method','First I understand. Then we fix it.','You do not need technical words to explain what is happening. You always know where your case is, what comes next and what it costs.',[('method','Six stages'),('handover','Handover'),('modes','Ways to work'),('faq','Questions')])
  + P('METHOD') + P('HANDOVER') + P('WAYS_TO_WORK') + P('FAQ') + cta())

contact = P('CONTACT').replace('<h2 class="h-xl" id="contact-h">Tell me your case.</h2>','<h1 class="h-xl" id="contact-h">Tell me your case.</h1>').replace('class="contact band"','class="contact" style="padding-top:clamp(110px,14vw,170px)"')
page('contact','Contact · Daylu Forteza','Contact Daylu Forteza in Málaga by WhatsApp, phone or email, and see the places he works in.', contact + MAP)
print('built')
