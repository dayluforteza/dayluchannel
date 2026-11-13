/* Construcciones Daylu — casa 3D que se construye con el scroll */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Reveal + pasos activos ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  const steps = $$('.step');
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting));
  }, { rootMargin: '-35% 0px -35% 0px' });
  steps.forEach((s) => stepIO.observe(s));

  /* ---------- Escena 3D ---------- */
  const canvas = $('#scene');
  if (!window.THREE) { canvas.remove(); return; }
  const T = window.THREE;

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  scene.fog = new T.Fog(0x0d0e10, 16, 34);
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);

  scene.add(new T.HemisphereLight(0xfff1e0, 0x1a1b1f, 0.65));
  const sun = new T.DirectionalLight(0xffffff, 0.9);
  sun.position.set(6, 10, 4);
  scene.add(sun);
  const warm = new T.PointLight(0xff6a1a, 0, 9);
  warm.position.set(0, 1.6, 0);
  scene.add(warm);

  const grid = new T.GridHelper(40, 40, 0xff6a1a, 0x2a2c30);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  const house = new T.Group();
  scene.add(house);

  const ORANGE = 0xff6a1a;
  const parts = []; // { obj, mats, start, end, from }

  function block(w, h, d, color, x, y, z, start, end, opts = {}) {
    const geo = opts.geo || new T.BoxGeometry(w, h, d);
    const mat = new T.MeshStandardMaterial({
      color, roughness: 0.85, metalness: 0.05, flatShading: true,
      transparent: true, opacity: 0, emissive: opts.emissive || 0x000000, emissiveIntensity: opts.emissive ? 0 : 1,
    });
    const mesh = new T.Mesh(geo, mat);
    const edges = new T.LineSegments(
      new T.EdgesGeometry(geo),
      new T.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0 })
    );
    mesh.add(edges);
    mesh.position.set(x, y, z);
    if (opts.rot) mesh.rotation.set(...opts.rot);
    house.add(mesh);
    parts.push({ obj: mesh, mat, line: edges.material, start, end, baseY: y, glow: !!opts.emissive });
    return mesh;
  }

  // Dimensiones
  const W = 6, D = 4.4, H = 2.6, t = 0.22, ROWS = 6;
  const CONCRETE = 0x9a958c, WALL = 0xd9d2c5, ROOF = 0x3a3d43;

  // 01 Cimientos (0 – 0.22)
  block(W + 0.8, 0.3, D + 0.8, CONCRETE, 0, 0.15, 0, 0.0, 0.14);
  block(W + 0.2, 0.12, D + 0.2, 0x7d7870, 0, 0.36, 0, 0.1, 0.22);

  // 02 Muros por hiladas (0.24 – 0.5)
  const rowH = H / ROWS;
  for (let r = 0; r < ROWS; r++) {
    const y = 0.42 + rowH * r + rowH / 2;
    const s = 0.24 + (r / ROWS) * 0.24;
    const e = s + 0.06;
    const isDoorRow = r < 4; // hueco de puerta en fachada
    // Fachada frontal (con hueco de puerta y ventanas)
    if (isDoorRow) {
      block(W / 2 - 0.55, rowH, t, WALL, -W / 4 - 0.27, y, D / 2, s, e);
      block(W / 2 - 0.55, rowH, t, WALL, W / 4 + 0.27, y, D / 2, s, e);
    } else {
      block(W, rowH, t, WALL, 0, y, D / 2, s, e);
    }
    block(W, rowH, t, WALL, 0, y, -D / 2, s + 0.01, e + 0.01);
    block(t, rowH, D - t, WALL, -W / 2 + t / 2, y, 0, s + 0.02, e + 0.02);
    block(t, rowH, D - t, WALL, W / 2 - t / 2, y, 0, s + 0.02, e + 0.02);
  }

  // 03 Cubierta (0.52 – 0.74)
  const roofY = 0.42 + H;
  const half = D / 2 + 0.45;
  const pitch = 0.62;
  const slab = half / Math.cos(pitch);
  block(W + 0.8, 0.14, slab, ROOF, 0, roofY + Math.sin(pitch) * slab / 2, D / 4 + 0.22, 0.52, 0.62, { rot: [pitch, 0, 0] });
  block(W + 0.8, 0.14, slab, ROOF, 0, roofY + Math.sin(pitch) * slab / 2, -D / 4 - 0.22, 0.56, 0.66, { rot: [-pitch, 0, 0] });
  // hastiales (triángulos laterales)
  const rise = Math.tan(pitch) * (D / 2);
  const tri = new T.Shape();
  tri.moveTo(-D / 2, 0); tri.lineTo(D / 2, 0); tri.lineTo(0, rise); tri.closePath();
  const gable = new T.ExtrudeGeometry(tri, { depth: t, bevelEnabled: false });
  gable.translate(0, 0, -t / 2);
  [-1, 1].forEach((sx, i) => block(0, 0, 0, WALL, sx * (W / 2 - t / 2), roofY, 0, 0.48 + i * 0.02, 0.56 + i * 0.02, { geo: gable, rot: [0, Math.PI / 2, 0] }));
  block(0.5, 1.1, 0.5, 0x6b5f55, W / 4, roofY + 1.3, -0.6, 0.64, 0.74);
  // canalón
  block(W + 0.9, 0.1, 0.12, ORANGE, 0, roofY - 0.02, D / 2 + 0.5, 0.66, 0.74);

  // 04 Acabados (0.76 – 1)
  block(1.0, 1.9, 0.08, ORANGE, 0, 0.42 + 0.95, D / 2 + 0.04, 0.76, 0.84); // puerta
  [-2, 2].forEach((x, i) => block(0.9, 0.7, 0.06, 0xffc48a, x, 1.75, D / 2 + 0.13, 0.82 + i * 0.03, 0.9 + i * 0.03, { emissive: 0xffa14a }));
  [-1.4, 1.4].forEach((z, i) => block(0.06, 0.7, 0.9, 0xffc48a, W / 2 + 0.03, 1.75, z, 0.86 + i * 0.02, 0.94, { emissive: 0xffa14a }));
  block(2.4, 0.06, 1.6, 0x8c867c, 0, 0.03, D / 2 + 1.3, 0.88, 0.96); // acera de hormigón impreso

  /* ---------- Scroll → progreso de obra ---------- */
  const story = $('#proceso');
  let target = reduced ? 1 : 0;
  let progress = target;

  function readScroll() {
    const rect = story.getBoundingClientRect();
    const total = rect.height - innerHeight * 0.3;
    const raw = clamp((innerHeight * 0.65 - rect.top) / total);
    target = reduced ? 1 : raw;

    const docMax = document.documentElement.scrollHeight - innerHeight;
    $('#progressBar').style.transform = `scaleX(${clamp(scrollY / docMax)})`;

    // Ocultar el 3D cuando la historia termina
    canvas.style.opacity = rect.bottom < innerHeight * 0.4 ? 0 : 1;
  }
  addEventListener('scroll', readScroll, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En escritorio la casa va a la derecha, el texto a la izquierda
    if (w > 860) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.14, w, h);
    camera.updateProjectionMatrix();
    readScroll();
  }
  addEventListener('resize', resize);
  resize();

  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  const clock = new T.Clock();
  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || canvas.style.opacity === '0') return;
    const time = clock.getElapsedTime();
    progress += (target - progress) * 0.08;

    for (const p of parts) {
      const k = easeOut(clamp((progress - p.start) / (p.end - p.start)));
      const blueprint = clamp((progress - p.start + 0.06) / 0.06); // las líneas aparecen antes que el sólido
      p.mat.opacity = k;
      p.line.opacity = Math.max(blueprint * 0.9 * (1 - k * 0.75), 0);
      p.obj.position.y = p.baseY + (1 - k) * 2.2;
      if (p.glow) p.mat.emissiveIntensity = k * (0.8 + Math.sin(time * 2) * 0.1);
    }
    warm.intensity = clamp((progress - 0.82) / 0.15) * 1.4;

    const angle = -1.1 + progress * 1.6 + (reduced ? 0 : Math.sin(time * 0.3) * 0.06) + mx * 0.12;
    const radius = (16 - progress * 1.5) * Math.max(1, 1.05 / camera.aspect);
    scene.fog.near = radius + 1; scene.fog.far = radius + 18;
    camera.position.set(Math.sin(angle) * radius, 4.5 + progress * 1.5 - my * 0.6, Math.cos(angle) * radius);
    camera.lookAt(0, 1.6, 0);

    renderer.render(scene, camera);
  }
  frame();
})();
