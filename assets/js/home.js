(() => {
  const canvas = document.querySelector('#network');
  const network = canvas?.parentElement;
  const hero = document.querySelector('.hero');
  const controls = document.querySelector('.visual-controls');
  if (!canvas || !network || !hero || !controls) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, active: false };
  const points = [], edges = [], stars = [], ripples = [];
  const total = 170;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  let width = 0, height = 0, frame = 0, lastTime = 0, elapsed = 0, angle = .35;
  let mix = 0, targetMix = 0, inView = true;

  for (let i = 0; i < total; i += 1) {
    const y = 1 - (i / (total - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const cloudRadius = Math.sqrt((i + .5) / total);
    const cloudAngle = theta * 1.8 + cloudRadius * 5;
    points.push({ x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring, cloudX: Math.cos(cloudAngle) * cloudRadius * 1.35, cloudY: Math.sin(cloudAngle) * cloudRadius * .78, cloudZ: Math.sin(theta * .6) * .35, pink: i % 9 === 0 });
  }
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i], b = points[j];
      if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < .36) edges.push([i, j]);
    }
  }
  for (let i = 0; i < 75; i += 1) stars.push({ x: Math.random(), y: Math.random(), size: Math.random() * 1.2 + .3, pink: i % 5 === 0, phase: Math.random() * Math.PI * 2 });

  function resize() {
    const rect = network.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const mobile = width <= 760;
    const cx = width * (mobile ? .53 : .72);
    const cy = height * (mobile ? .46 : .49);
    const radius = Math.min(width * (mobile ? .40 : .25), height * .38, 315);
    const tilt = -.19 + (pointer.active ? (pointer.y / height - .5) * .14 : 0);
    const turn = angle + (pointer.active ? (pointer.x / width - .5) * .55 : 0);
    const sin = Math.sin(turn), cos = Math.cos(turn), sinT = Math.sin(tilt), cosT = Math.cos(tilt);
    const projected = points.map((p) => {
      const px = p.x + (p.cloudX - p.x) * mix, py = p.y + (p.cloudY - p.y) * mix, pz = p.z + (p.cloudZ - p.z) * mix;
      const x = px * cos - pz * sin, z = px * sin + pz * cos, y = py * cosT - z * sinT, depth = py * sinT + z * cosT;
      return { x: cx + x * radius, y: cy + y * radius, depth, pink: p.pink };
    });
    stars.forEach((star) => {
      const x = star.x * width, y = star.y * height;
      if (!mobile && x < width * .37) return;
      const alpha = .35 + .25 * (Math.sin(elapsed * .001 + star.phase) + 1) / 2;
      context.fillStyle = star.pink ? `rgba(252,17,192,${alpha})` : `rgba(140,252,253,${alpha})`;
      context.beginPath(); context.arc(x, y, star.size, 0, Math.PI * 2); context.fill();
    });
    context.save(); context.translate(cx, cy); context.rotate(-.30); context.strokeStyle = `rgba(26,251,253,${.18 - mix * .1})`; context.lineWidth = 1; context.beginPath(); context.ellipse(0, 0, radius * 1.38, radius * .55, 0, 0, Math.PI * 2); context.stroke(); context.strokeStyle = `rgba(252,17,192,${.6 - mix * .25})`; context.beginPath(); context.ellipse(0, 0, radius * 1.38, radius * .55, 0, .1, 1.55); context.stroke(); context.rotate(.85); context.strokeStyle = `rgba(120,210,240,${.14 - mix * .07})`; context.beginPath(); context.ellipse(0, 0, radius * 1.16, radius * .8, 0, 0, Math.PI * 2); context.stroke(); context.restore();
    edges.forEach(([i, j]) => { const a = projected[i], b = projected[j]; context.strokeStyle = `rgba(26,251,253,${(.08 + ((a.depth + b.depth + 2) / 4) * .36) * (1 - mix * .92)})`; context.lineWidth = .8; context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke(); });
    if (mix < .98) for (let i = 0; i < 10; i += 1) { const progress = (elapsed * .00025 + i / 10) % 1, edge = edges[(i * 43 + Math.floor(elapsed / 4000)) % edges.length], a = projected[edge[0]], b = projected[edge[1]]; context.fillStyle = `rgba(253,110,214,${(1 - mix) * .9})`; context.beginPath(); context.arc(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress, 2.4, 0, Math.PI * 2); context.fill(); }
    projected.forEach((p) => { const alpha = .3 + (p.depth + 1) * .33; context.fillStyle = p.pink ? `rgba(252,17,192,${alpha})` : `rgba(118,252,253,${alpha})`; context.beginPath(); context.arc(p.x, p.y, (p.pink ? 2.2 : 1.3 + (p.depth + 1) * .35) + mix * .8, 0, Math.PI * 2); context.fill(); if (pointer.active) { const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y); if (distance < 135) { context.strokeStyle = `rgba(252,17,192,${(1 - distance / 135) * .7})`; context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(pointer.x, pointer.y); context.stroke(); } } });
    ripples.forEach((ripple) => { const progress = ripple.age / 900, fade = 1 - progress; context.strokeStyle = `rgba(252,17,192,${fade * .8})`; context.beginPath(); context.arc(ripple.x, ripple.y, 8 + progress * 100, 0, Math.PI * 2); context.stroke(); });
  }

  function resetPointer() {
    pointer.active = false;
    // Keep the current turn and let the render loop ease the visual field back to neutral.
  }
  function tick(time) {
    const delta = lastTime ? Math.min(time - lastTime, 50) : 0;
    angle += delta * .00012; elapsed += delta; mix += (targetMix - mix) * (1 - Math.exp(-delta / 220));
    ripples.forEach((ripple) => { ripple.age += delta; });
    while (ripples.length && ripples[0].age >= 900) ripples.shift();
    lastTime = time; draw(); frame = requestAnimationFrame(tick);
  }
  function updateAnimation() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (!motion.matches && !document.hidden && inView) frame = requestAnimationFrame(tick);
    else { if (motion.matches) { mix = targetMix; resetPointer(); ripples.length = 0; } draw(); }
    controls.querySelector('.visual-caption').innerHTML = motion.matches ? '<strong>INTERACTIVE FIELD</strong>选择视觉模式' : '<strong>INTERACTIVE FIELD</strong>移动或点击，探索视觉互动';
  }
  controls.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => { targetMix = button.dataset.mode === 'particles' ? 1 : 0; controls.querySelectorAll('[data-mode]').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); if (motion.matches) { mix = targetMix; draw(); } }));
  hero.addEventListener('click', (event) => { if (motion.matches || event.target.closest('button, a')) return; const rect = network.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top; if (x < 0 || x > width || y < 0 || y > height) return; ripples.push({ x, y, age: 0 }); if (ripples.length > 4) ripples.shift(); });
  network.addEventListener('pointermove', (event) => { if (motion.matches || !inView) return; const rect = network.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height; });
  network.addEventListener('pointerleave', resetPointer);
  window.addEventListener('blur', resetPointer);
  document.addEventListener('visibilitychange', () => { resetPointer(); updateAnimation(); });
  network.addEventListener('pointercancel', resetPointer);
  window.addEventListener('resize', resize);
  window.addEventListener('neonx:route', (event) => { inView = event.detail.current === 'home'; resetPointer(); if (inView) resize(); updateAnimation(); });
  motion.addEventListener('change', updateAnimation);
  if ('IntersectionObserver' in window) new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; if (!inView) resetPointer(); updateAnimation(); }).observe(network);
  controls.hidden = false; resize(); updateAnimation();
})();
