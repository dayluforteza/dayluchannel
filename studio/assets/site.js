(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = id => document.getElementById(id);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const sticky = el => el && getComputedStyle(el).position === 'sticky';
  const progress = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };

  /* current page in the nav */
  const page = document.body.dataset.page;
  $$('a[data-page]').forEach(a => { if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); });
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.sub__item, .sheet__sv a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });

  /* menu sheet (phone and tablet) */
  const burger = document.querySelector('.burger'), sheet = $('sheet');
  if (burger && sheet) {
    const setOpen = open => {
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      sheet.hidden = !open; document.body.classList.toggle('menu-open', open);
      if (open) { const f = sheet.querySelector('a'); f && f.focus({ preventScroll: true }); }
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setOpen(false); burger.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 1120 && !sheet.hidden) setOpen(false); });
  }

  /* soft page transition between the site's own pages */
  if (!reduced) document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href') || '';
    if (!/^[a-z-]+\.html(#.*)?$/.test(href)) return;
    if (href.split('#')[0] === location.pathname.split('/').pop() && href.includes('#')) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 260);
  });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  const loops = [];
  const onScroll = () => { if (!onScroll.t) { onScroll.t = true; requestAnimationFrame(() => { onScroll.t = false; loops.forEach(f => f()); }); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* HERO: exploded stack */
  const hero = $('hero');
  if (hero) {
    const stack = $('stack'), tags = $$('#tags .tag'), head = hero.querySelector('.hero__head'), title = $('stage-title'), cue = $('cue');
    loops.push(() => {
      if (reduced) return;
      const p = progress(hero);
      const rise = 1 - Math.pow(1 - clamp(p / 0.32), 3), ex = clamp((p - 0.3) / 0.55);
      stack.style.setProperty('--y', ((1 - rise) * 38 + ex * 9).toFixed(2) + 'vh');
      stack.style.setProperty('--p', ex.toFixed(4));
      head.style.opacity = (1 - clamp((p - 0.06) / 0.2)).toFixed(3);
      head.style.transform = `translateY(${(-clamp(p / 0.3) * 60).toFixed(1)}px)`;
      head.style.pointerEvents = p > 0.2 ? 'none' : '';
      tags.forEach((t, i) => t.classList.toggle('on', ex > 0.08 + i * 0.22));
      if (title) title.classList.toggle('on', ex > 0.05);
      if (cue) cue.style.opacity = p > 0.05 ? 0 : 1;
    });
    if (reduced) { tags.forEach(t => t.classList.add('on')); title && title.classList.add('on'); }
  }

  /* statement: words light up */
  const reveal = $('reveal');
  if (reveal) {
    const words = [];
    (function split(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; f.appendChild(s); words.push(s); }
          });
          n.replaceWith(f);
        } else if (n.nodeType === 1) split(n);
      });
    })(reveal);
    loops.push(() => {
      if (reduced) return;
      const r = reveal.getBoundingClientRect();
      const q = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.45));
      words.forEach((w, i) => w.style.setProperty('--o', (0.18 + clamp(q * words.length * 1.15 - i) * 0.82).toFixed(3)));
    });
  }

  /* draw-on infographics */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .35 });
  $$('.draw').forEach(el => reduced ? el.classList.add('in') : io.observe(el));

  /* coverage selector */
  const chipsRow = $('who');
  if (chipsRow) {
    const AREAS = ['Systems', 'Networks', 'Maintenance', 'Security', 'Web', 'Training'];
    const WHO = {
      home: ['Home', [0, 1, 2, 3, 5], ['A slow laptop made fast again before you buy another', 'Wi-Fi that reaches every room of the house', 'Family photos and documents kept in two places', 'Help to use your phone, tablet and computer with ease']],
      freelancer: ['Freelancer', [0, 1, 2, 3, 4, 5], ['A work setup that runs the same at home and at the office', 'A website or landing page that brings enquiries', 'Client data backed up and protected', 'Remote help when something stops you working']],
      shop: ['Shop', [1, 2, 3, 4], ['A till and card terminal that never drop off the network', 'Wi-Fi for staff kept apart from the customers’ one', 'Quarterly checks before the busy season', 'A site that tells people where you are and when you open']],
      office: ['Office', [0, 1, 2, 3, 5], ['Cabling and Wi-Fi for every desk, labelled and documented', 'The same base setup on every computer', 'A maintenance plan with a status report', 'Secure access to your files from home']],
      clinic: ['Clinic', [0, 1, 2, 3], ['Specialised equipment and software from the healthcare sector', 'Patient records backed up and permissions set per person', 'A network for reception and every consulting room', 'Preventive care so appointments never wait on a computer']],
      school: ['School', [0, 1, 4, 5], ['A computer room with one base image on every machine', 'Classroom Wi-Fi that holds a full group', 'Training for staff on the tools they actually use', 'A website for courses and enrolment']],
      startup: ['New business', [0, 1, 3, 4], ['Equipment chosen for the job, without overspending', 'The network installed before you open the doors', 'A website ready for launch day', 'Accounts, passwords and backups set up right from the start']]
    };
    const cells = $$('#cover-svg .cell'), count = $('cover-n'), arc = $('cover-arc'), title = $('jobs-t'), list = $('jobs-l');
    const L = 2 * Math.PI * 182;
    arc.style.strokeDasharray = L;
    function pick(k) {
      const [name, on, jobs] = WHO[k];
      $$('button', chipsRow).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
      cells.forEach((c, i) => { const lit = on.includes(i); c.style.opacity = lit ? 1 : .22; c.querySelector('.dot').setAttribute('fill', lit ? 'var(--accent)' : 'var(--line)'); });
      arc.style.strokeDashoffset = L * (1 - on.length / 6);
      title.textContent = `For a ${name.toLowerCase()}`;
      list.innerHTML = jobs.map((j, i) => `<li style="animation-delay:${i * 60}ms">${j}</li>`).join('');
      const target = on.length; let n = +count.textContent || 0;
      if (reduced) count.textContent = target; else { const step = () => { n += Math.sign(target - n); count.textContent = n; if (n !== target) setTimeout(step, 70); }; step(); }
      $('cover-of').textContent = 'of 6 areas covered';
    }
    $$('button', chipsRow).forEach(b => b.addEventListener('click', () => pick(b.dataset.k)));
    pick('freelancer');
  }

  /* symptom finder */
  const list = $('symptoms');
  if (list) {
    const data = [
      ['The computer takes forever to start.', 'Maintenance and diagnosis', 'Usually startup programs, a full disk or an ageing hard drive. A diagnosis tells you which, before anything is replaced.', ['Check startup and disk health', 'Clean up and update', 'Upgrade to an SSD only if it pays off'], 25],
      ['The same error comes back every week.', 'Maintenance and diagnosis', 'A recurring error has a cause. I trace it in the logs instead of restarting and hoping.', ['Read the system logs', 'Reproduce the error', 'Fix the cause and document it'], 45],
      ['The Wi-Fi drops or does not reach every room.', 'Networks and infrastructure', 'Router placement, channel interference or a building that needs more than one access point.', ['Measure coverage room by room', 'Fix channels and placement', 'Add access points where needed'], 40],
      ['Nobody knows which cable goes where.', 'Networks and infrastructure', 'A cabinet without labels turns every change into guesswork.', ['Trace and label every patch cable', 'Draw the network diagram', 'Hand over the documentation'], 55],
      ['New computers arrived badly configured.', 'Systems', 'Default settings, no updates, every user as administrator.', ['Review each machine', 'Set users and permissions', 'Leave one base image for the next ones'], 35],
      ['The computer is slow and you do not know whether to replace it.', 'Systems', 'Sometimes an upgrade is enough. Sometimes it is not. You get the numbers to decide.', ['Measure what is slowing it down', 'Price the upgrade and the replacement', 'You choose, with the facts'], 20],
      ['You have no backups and you lose files.', 'Security', 'One copy on one disk is not a backup. Three verified copies on different media are.', ['Find what must be saved', 'Set up three copies, one off site', 'Test a restore with you'], 65],
      ['Your website does not exist or does not say what you do.', 'Web development', 'A site that explains your service and makes it easy to contact you. From €1,000.', ['Agree what the site must achieve', 'Write the structure and copy', 'Build, test and publish in your name'], 50],
      ['Nobody ever explained how your own setup works.', 'Training', 'You should be able to run your own tools without calling someone each time.', ['Walk through your setup together', 'Write a short guide for you', 'Answer follow-up questions'], 30]
    ];
    const show = i => {
      const d = data[i];
      $('dx-title').textContent = d[0]; $('dx-area').textContent = d[1]; $('dx-text').textContent = d[2];
      $('dx-steps').innerHTML = d[3].map(s => `<li>${s}</li>`).join('');
      $('dx-meter').style.setProperty('--w', d[4] + '%');
      $$('button', list).forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    };
    data.forEach((d, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" aria-pressed="false"><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${d[0]}</span><span class="chip">${d[1].split(' ')[0]}</span></button>`;
      li.firstChild.addEventListener('click', () => show(i));
      list.appendChild(li);
    });
    show(0);
  }

  /* method ring */
  const ring = $('ring');
  if (ring) {
    const names = ['Listen', 'Diagnose', 'Propose', 'Resolve', 'Verify', 'Support'];
    const R = 160, C = 200, gap = 6;
    let html = `<circle cx="${C}" cy="${C}" r="${R}" stroke="var(--line)" stroke-width="2" fill="none"/>`;
    names.forEach((n, i) => {
      const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2 + gap * Math.PI / 180, a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2 - gap * Math.PI / 180;
      const pt = a => [C + R * Math.cos(a), C + R * Math.sin(a)];
      const [x0, y0] = pt(a0), [x1, y1] = pt(a1), am = (a0 + a1) / 2;
      html += `<path data-seg="${i}" d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" fill="none" opacity=".15" style="transition:opacity .4s"/>`;
      html += `<text x="${C + (R + 26) * Math.cos(am)}" y="${C + (R + 26) * Math.sin(am)}" text-anchor="middle" dominant-baseline="middle" font-family="var(--mono)" font-size="11" fill="var(--muted)">0${i + 1}</text>`;
    });
    ring.innerHTML = html;
    const segs = $$('[data-seg]', ring), stages = $$('#stages li');
    const set = k => { segs.forEach((s, i) => s.setAttribute('opacity', i <= k ? 1 : .15)); stages.forEach((s, i) => s.classList.toggle('on', i === k)); $('ring-n').textContent = '0' + (k + 1); $('ring-l').textContent = names[k]; };
    set(reduced ? 5 : 0);
    const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(stages.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    if (!reduced) stages.forEach(s => sio.observe(s));
    stages.forEach((s, i) => s.addEventListener('mouseenter', () => set(i)));
  }

  /* counters */
  const Y = new Date().getFullYear();
  $$('[data-count="__Y17__"]').forEach(e => e.dataset.count = Y - 2017);
  $$('[data-count="__Y18__"]').forEach(e => e.dataset.count = Y - 2018);
  const nums = $('numbers');
  if (nums) {
    $$('[data-count]', nums).forEach(el => el.textContent = el.dataset.count);
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      $$('[data-count]', e.target).forEach(el => {
        const n = +el.dataset.count; if (reduced) return;
        const t0 = performance.now(); const tick = t => { const k = clamp((t - t0) / 1400); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      });
    }), { threshold: .4 });
    cio.observe(nums);
  }

  /* deep dive: chapters scrolled sideways */
  const deep = $('deep');
  if (deep) {
    const track = $('deep-track'), dots = $$('#deep-dots i');
    loops.push(() => {
      if (reduced || !sticky(deep.firstElementChild)) return;
      const p = progress(deep), step = track.children[0].offsetWidth + 24;
      const q = p * 5, base = Math.min(4, Math.floor(q)), f = clamp(q - base), t = clamp((f - .3) / .4), e = q >= 5 ? 5 : base + t * t * (3 - 2 * t);
      track.style.transform = `translate3d(${(-e * step).toFixed(1)}px,0,0)`;
      const k = Math.min(5, Math.round(e)); dots.forEach((d, i) => d.classList.toggle('on', i === k));
    });
  }

  /* handover fan */
  const hand = $('handover');
  if (hand) {
    const fan = $$('#fan .doc');
    loops.push(() => {
      if (reduced || !sticky(hand.firstElementChild)) return;
      const p = clamp(progress(hand) * 1.25), e = 1 - Math.pow(1 - p, 3), w = fan[0].offsetWidth;
      fan.forEach((d, i) => { const o = i - 2; d.style.transform = `translate(${(o * e * w * 1.02).toFixed(1)}px, ${(Math.abs(o) * e * 22).toFixed(1)}px) rotate(${(o * e * 5).toFixed(2)}deg)`; d.style.zIndex = 10 - Math.abs(o); });
    });
  }

  /* website build */
  const build = $('build');
  if (build) {
    const browser = $('browser'), steps = $$('#bsteps li');
    loops.push(() => {
      if (reduced || !sticky(build.firstElementChild)) { browser.dataset.s = 5; return; }
      const k = Math.min(5, Math.floor(progress(build) * 6));
      browser.dataset.s = k; steps.forEach((li, i) => li.classList.toggle('on', i === k));
    });
  }

  /* office map */
  const nodes = $$('#office .node');
  if (nodes.length) {
    const ON = [
      ['Internet line', 'Where it all starts.', 'Your provider’s line. I check what you pay for against what actually arrives.', ['Real speed measured at the router', 'Provider equipment and contract checked', 'Backup line considered for critical shops']],
      ['Router', 'The front door of your network.', 'Everything goes through it, so it is the first thing I review.', ['Firmware updated, default password changed', 'Wi-Fi channels set for the building', 'Guest network kept apart from work devices']],
      ['Switch and cabling', 'The part nobody looks at until it fails.', 'Structured cabling and a patch panel where every cable has a name.', ['Every patch cable labelled', 'Network diagram drawn and handed over', 'Existing cabling tested before replacing it']],
      ['Access points', 'Wi-Fi in the rooms where you work.', 'Coverage measured room by room, access points cabled where possible.', ['Signal measured in each room', 'Mesh only where a cable cannot reach', 'Stable when several people connect']],
      ['Computers', 'Five desks that behave the same.', 'One base setup, separate users and a controlled update routine.', ['System updated and licences clear', 'Users and permissions per person', 'Data migrated and checked']],
      ['NAS and backups', 'Copies you have actually restored.', 'Three copies on different media, one of them outside the office.', ['Automatic copies scheduled', 'One copy off site', 'A restore tested together with you']],
      ['Printer and card terminal', 'Devices that stop dropping off.', 'Printers and POS terminals get fixed addresses so they are always found.', ['Fixed IP for each device', 'Drivers installed on every desk', 'Tested from each computer']],
      ['Remote access', 'Your office, from home, safely.', 'A VPN so you reach your files from outside without opening the network to everyone.', ['VPN set up on the router', 'Access per person, easy to revoke', 'Tested from outside the office']]
    ];
    const show = n => { const d = ON[n]; $('op-k').textContent = d[0]; $('op-t').textContent = d[1]; $('op-d').textContent = d[2]; $('op-c').innerHTML = d[3].map(x => `<li>${x}</li>`).join(''); nodes.forEach(g => g.classList.toggle('on', +g.dataset.n === n)); };
    nodes.forEach(g => { const n = +g.dataset.n; g.addEventListener('click', () => show(n)); g.addEventListener('mouseenter', () => show(n)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(n); } }); });
    show(1);
    if (reduced && $('packets')) $('packets').remove();
  }

  /* timeline */
  const tl = $('tline');
  if (tl) {
    const items = $$('.tle', tl), rail = tl.querySelector('.tl-rail');
    loops.push(() => {
      const r = tl.getBoundingClientRect(), mid = innerHeight * 0.6;
      rail.style.setProperty('--fill', reduced ? 1 : clamp((mid - r.top) / r.height).toFixed(4));
      items.forEach(it => { const b = it.getBoundingClientRect(); it.classList.toggle('on', reduced || b.top < mid); });
    });
  }


  /* catalogue index follows the reading position */
  const catIdx = $('cat-index');
  if (catIdx) {
    const links = $$('a[href^="#"]', catIdx);
    const blocks = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const kio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
    blocks.forEach(b => kio.observe(b));
  }

  /* Spain map */
  const es = $('es-svg');
  if (es && window.SPAIN) {
    const S = window.SPAIN, places = (window.PLACES || []).slice();
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const proj = (lon, lat) => { if (lon < -12.5 && lat < 30) { lon += 5; lat += 7; } return [(lon - S.lon0) * S.k * S.s, (S.lat1 - lat) * S.s]; };
    es.setAttribute('viewBox', `0 0 ${S.w} ${S.h}`);
    const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const lit = new Set(places.map(p => norm(p.province)));
    const gProv = el('g', {});
    S.provinces.forEach(pr => {
      const names = pr.name.split('/').map(norm);
      const path = el('path', { d: pr.d, class: 'prov' + (names.some(n => lit.has(n)) ? ' lit' : '') });
      const t = el('title', {}); t.textContent = pr.name; path.appendChild(t); gProv.appendChild(path);
    });
    es.appendChild(gProv);
    const [cx, cy, cw, ch] = S.canary;
    es.appendChild(el('rect', { x: cx - 6, y: cy - 6, width: cw + 12, height: ch + 12, rx: 8, class: 'frame' }));
    const base = places.find(p => p.type === 'base') || places[0];
    const clients = places.filter(p => p !== base);
    const pt = p => proj(p.lon, p.lat);
    const gLinks = el('g', {}), gDots = el('g', {});
    es.append(gLinks, gDots);
    const curve = (a, b, bend = .18) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return `M${a[0]} ${a[1]} Q${mx - dy * bend} ${my + dx * bend} ${b[0]} ${b[1]}`; };
    let links = 0;
    const all = [];
    if (base) clients.forEach(c => { all.push(el('path', { d: curve(pt(base), pt(c)), class: 'link' })); links++; });
    const seen = new Set();
    clients.forEach((c, i) => {
      let best = -1, bd = Infinity;
      clients.forEach((o, j) => { if (i === j) return; const d = (c.lon - o.lon) ** 2 + (c.lat - o.lat) ** 2; if (d < bd) { bd = d; best = j; } });
      if (best < 0) return;
      const key = [i, best].sort().join('-'); if (seen.has(key)) return; seen.add(key);
      all.push(el('path', { d: curve(pt(c), pt(clients[best]), -.12), class: 'link mesh' })); links++;
    });
    all.forEach(l => gLinks.appendChild(l));
    if (base) {
      const [bx, by] = pt(base);
      gDots.append(el('circle', { cx: bx, cy: by, r: 26, class: 'onsite' }), el('circle', { cx: bx, cy: by, r: 10, class: 'ring' }), el('circle', { cx: bx, cy: by, r: 10, class: 'ring r2' }), el('circle', { cx: bx, cy: by, r: 6, class: 'base' }));
      const lb = el('text', { x: bx + 32, y: by - 6, class: 'lbl' }); lb.textContent = base.name;
      const ls = el('text', { x: bx + 32, y: by + 9, class: 'lbl-s' }); ls.textContent = 'BASE · ON SITE';
      gDots.append(lb, ls);
    }
    clients.forEach(c => { const [x, y] = pt(c); gDots.appendChild(el('circle', { cx: x, cy: y, r: 4.5, class: 'dot' })); });
    const drawIn = () => all.forEach((l, i) => {
      if (l.classList.contains('mesh') || reduced) return;
      const L = l.getTotalLength(); l.style.strokeDasharray = L; l.style.strokeDashoffset = L;
      l.style.transition = `stroke-dashoffset 1.4s ${i * .12}s cubic-bezier(.22,1,.36,1)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { l.style.strokeDashoffset = 0; }));
    });
    const mio = new IntersectionObserver(e => { if (e[0].isIntersecting) { drawIn(); mio.disconnect(); } }, { threshold: .3 });
    mio.observe(es);
    [['es-places', places.length, 'place', 'places'], ['es-prov', lit.size, 'province', 'provinces'], ['es-links', links, 'connection', 'connections']].forEach(([id, n, one, many]) => { $(id).textContent = n; $(id).nextElementSibling.textContent = n === 1 ? one : many; });
    $('es-list').innerHTML = places.map(p => `<li>${p.name}<span>${p.note || p.province}</span></li>`).join('');
    if (reduced) $$('.ring', es).forEach(r => r.remove());
  }


  /* project filters */
  const filters = $('filters');
  if (filters) {
    const cards = $$('#pgrid .pcard');
    $$('button', filters).forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.f;
      $$('button', filters).forEach(x => x.setAttribute('aria-pressed', x === b));
      cards.forEach((c, i) => { const show = f === 'all' || c.dataset.cat === f; c.classList.toggle('out', !show); c.classList.remove('pop'); if (show && !reduced) { void c.offsetWidth; c.style.animationDelay = (i % 6) * 40 + 'ms'; c.classList.add('pop'); } });
    }));
  }

  /* hiring steps light up while reading */
  const hire = $('hire');
  if (hire) {
    const items = $$('li', hire);
    loops.push(() => { const mid = innerHeight * 0.62; items.forEach(li => li.classList.toggle('on', reduced || li.getBoundingClientRect().top < mid)); });
  }

  /* copy buttons */
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const el = $(b.dataset.copy), text = el.textContent.trim();
    const done = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected'; };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  }));

  /* brief form -> WhatsApp */
  const brief = $('brief');
  if (brief) brief.addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('b-msg').value.trim();
    $('b-err').hidden = !!msg; $('b-msg').setAttribute('aria-invalid', !msg);
    if (!msg) { $('b-msg').focus(); return; }
    const name = $('b-name').value.trim();
    const text = `Hello Daylu${name ? ', I am ' + name : ''}. About: ${$('b-area').value}. ${msg}`;
    const a = document.createElement('a');
    a.href = 'https://wa.me/34663011914?text=' + encodeURIComponent(text); a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    $('b-status').textContent = 'WhatsApp should open with your message. If it does not, copy the number above.';
  });

  onScroll(); loops.forEach(f => f());
})();
