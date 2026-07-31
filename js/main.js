gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================================
// HERO ENTRANCE ANIMATIONS
// ============================================
const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTL
  .to('.hero-badge', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 0.3
  })
  .to('.title-line', {
    opacity: 1,
    x: 0,
    duration: 0.7,
    stagger: 0.15
  }, '-=0.3')
  .to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 0.6
  }, '-=0.3')
  .to('.hero-buttons', {
    opacity: 1,
    y: 0,
    duration: 0.6
  }, '-=0.3')
  .to('.hero-dsp-list', {
    opacity: 1,
    y: 0,
    duration: 0.6
  }, '-=0.2');

// ============================================
// VINYL RECORD ROTATION (slow, continuous)
// ============================================
gsap.to('#vinyl', {
  rotation: 360,
  duration: 25,
  repeat: -1,
  ease: 'none'
});

// Vinyl glow pulse
gsap.to('#vinyl', {
  filter: 'drop-shadow(0 0 60px rgba(255, 215, 0, 0.35)) drop-shadow(0 0 120px rgba(255, 150, 0, 0.18))',
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

// ============================================
// FLOATING SPARKLE PARTICLES (close to vinyl)
// ============================================
const sparkleContainer = document.getElementById('sparkleContainer');
function createSparkles() {
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    const angle = Math.random() * Math.PI * 2;
    const radius = 185 + Math.random() * 170;
    sparkle.style.left = `${350 + Math.cos(angle) * radius}px`;
    sparkle.style.top = `${310 + Math.sin(angle) * radius}px`;
    sparkle.style.width = `${2 + Math.random() * 3}px`;
    sparkle.style.height = sparkle.style.width;
    sparkle.style.animationDelay = `${Math.random() * 5}s`;
    sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
    sparkleContainer.appendChild(sparkle);
  }
}
createSparkles();

// ============================================
// ORBITING PLATFORM ICONS (tilted elliptical)
// ============================================
const icons = document.querySelectorAll('.orbit-icon');
const orbitRadiusX = 300;
const orbitRadiusY = 260;
let orbitAngle = 0;
const orbitSpeed = 0.004;

function positionIcons() {
  icons.forEach((icon, i) => {
    const angle = (orbitAngle + (i * (360 / icons.length))) * (Math.PI / 180);
    const x = Math.cos(angle) * orbitRadiusX;
    const y = Math.sin(angle) * orbitRadiusY;
    icon.style.transform = `translate(${x}px, ${y}px)`;
    icon.style.zIndex = Math.sin(angle) > 0 ? 10 : 1;
  });
  orbitAngle += orbitSpeed * 16.67;
  requestAnimationFrame(positionIcons);
}

// Reveal icons
gsap.to('.orbit-icon', {
  opacity: 1,
  duration: 0.8,
  stagger: 0.12,
  delay: 1.2,
  ease: 'back.out(1.7)',
  onStart: positionIcons
});

// Continuous subtle float on each bubble
icons.forEach((icon, i) => {
  gsap.to(icon.querySelector('.glass-bubble'), {
    y: -4 + (i % 3) * 2,
    duration: 2 + (i * 0.3),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: i * 0.15
  });
});

// ============================================
// HERO ENERGY BACKGROUND (canvas)
// Faded, slow blurred blobs + twinkling stars.
// Optimized: DPR cap, pre-rendered glow sprites, pauses when
// tab hidden or hero off-screen, reduced-motion aware.
// ============================================
function initHeroParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return; // canvas is hidden via CSS anyway

  // Design grid coordinates; canvas is scaled to fill the hero.
  const grid = { width: 950, height: 750 };
  let devicePixelRatio = 1;
  let running = true;
  let rafId = 0;

  // --- Pre-rendered glow sprites (avoids per-blob shadowBlur) ---
  const spriteSize = 96;
  function makeGlowSprite(r, g, b) {
    const sprite = document.createElement('canvas');
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    const sctx = sprite.getContext('2d');
    const grad = sctx.createRadialGradient(spriteSize / 2, spriteSize / 2, 0, spriteSize / 2, spriteSize / 2, spriteSize / 2);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},0.5)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, spriteSize, spriteSize);
    return sprite;
  }
  const goldSprite = makeGlowSprite(255, 205, 60);
  const purpleSprite = makeGlowSprite(150, 90, 255);

  // --- Faded, slow drifting blurred blobs ---
  const blobs = [];
  class EnergyBlob {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * grid.width;
      this.y = Math.random() * grid.height;
      this.radius = 60 + Math.random() * 130;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = (Math.random() - 0.5) * 0.22;
      this.sprite = Math.random() > 0.45 ? goldSprite : purpleSprite;
      this.baseAlpha = 0.10 + Math.random() * 0.16;
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.4 + Math.random() * 0.7;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -this.radius) this.x = grid.width + this.radius;
      if (this.x > grid.width + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = grid.height + this.radius;
      if (this.y > grid.height + this.radius) this.y = -this.radius;
    }
    draw(now) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 3000 * this.pulseSpeed + this.phase);
      const alpha = this.baseAlpha * (0.7 + 0.6 * pulse);
      const size = this.radius * 2;
      context.globalAlpha = alpha;
      context.globalCompositeOperation = 'lighter';
      context.drawImage(this.sprite, this.x - size / 2, this.y - size / 2, size, size);
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    }
  }
  for (let i = 0; i < 12; i += 1) blobs.push(new EnergyBlob());

  // --- Pre-generated twinkling star field ---
  const stars = [];
  for (let i = 0; i < 60; i += 1) {
    stars.push({
      x: Math.random() * grid.width,
      y: Math.random() * grid.height,
      r: Math.random() * 1.3 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2
    });
  }

  function resize() {
    devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.parentElement.getBoundingClientRect();
    const canvasWidth = Math.max(bounds.width, 1);
    const canvasHeight = Math.max(bounds.height, 1);

    canvas.width = Math.round(canvasWidth * devicePixelRatio);
    canvas.height = Math.round(canvasHeight * devicePixelRatio);
    context.setTransform(
      devicePixelRatio * (canvasWidth / grid.width),
      0,
      0,
      devicePixelRatio * (canvasHeight / grid.height),
      0,
      0
    );
  }

  function drawStars(now) {
    context.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];
      context.globalAlpha = 0.14 + 0.12 * (0.5 + 0.5 * Math.sin(now / 2600 * star.speed + star.phase));
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);

    context.clearRect(0, 0, grid.width, grid.height);

    drawStars(now);

    for (let i = 0; i < blobs.length; i += 1) {
      blobs[i].update();
      blobs[i].draw(now);
    }
  }

  function pause() {
    if (running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  }

  function resume() {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(frame);
    }
  }

  // Pause when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause(); else resume();
  });

  // Pause when the hero scrolls out of view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) resume(); else pause();
        });
      },
      { rootMargin: '100px 0px 100px 0px' }
    );
    observer.observe(canvas.parentElement);
  }

  resize();
  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(frame);
}

initHeroParticles();

// ============================================
// PLATFORM VERTICAL SCROLL (All Platforms)
// ============================================
const allDSPLogos = [
  { name: 'Spotify', file: 'spotify.png' },
  { name: 'Apple Music', file: 'applemusic.png' },
  { name: 'YouTube Music', file: 'ytmusic.png' },
  { name: 'Amazon Music', file: 'amazonmusic.png' },
  { name: 'YouTube', file: 'youtube.png' },
  { name: 'TikTok Music', file: 'tiktok-music-library.png' },
  { name: 'Instagram Music', file: 'instagram-music.png' },
  { name: 'Meta', file: 'facebook.png' },
  { name: 'JioSaavn', file: 'jiosaavan.png' },
  { name: 'Gaana', file: 'gaana.png' },
  { name: 'Hungama', file: 'hungamamusic.png' },
  { name: 'Wynk Music', file: 'wynkmusic.png' },
  { name: 'Deezer', file: 'deezer.png' },
  { name: 'Tidal', file: 'tidal.png' },
  { name: 'Pandora', file: 'pandora.png' },
  { name: 'Boomplay', file: 'boomplay.png' },
  { name: 'SoundCloud', file: 'soundcloud.png' },
  { name: 'Napster', file: 'napster.png' },
  { name: 'Audiomack', file: 'audiomack.png' },
  { name: 'Anghami', file: 'anghami.png' },
  { name: 'KKBOX', file: 'kkbox.png' },
  { name: 'JOOX', file: 'joox.png' },
  { name: 'QQ Music', file: 'kugoumusic.png' },
  { name: 'Kuwo Music', file: 'kuwomusic.png' },
  { name: 'NetEase', file: 'neteasecloud.png' },
  { name: 'Yandex Music', file: 'yandexmusic.png' },
  { name: 'VK Music', file: 'vkmusic.png' },
  { name: 'Melon', file: 'melonmusic.png' },
  { name: 'Genie', file: 'geniemusic.png' },
  { name: 'Bugs', file: 'bugs.png' },
  { name: 'Boom', file: 'boom.png' },
  { name: 'Awa Music', file: 'awamusic.png' },
  { name: 'Resso', file: 'resso.png' },
  { name: 'Qobuz', file: 'qobuz.png' },
  { name: 'iHeartRadio', file: 'iheartradio.png' },
  { name: 'Tencent', file: 'tencentmusic.png' },
  { name: 'Snapchat', file: 'snapchat-sounds.png' },
  { name: 'WhatsApp', file: 'whatsapp.png' },
  { name: 'Peloton', file: 'peloton.png' },
  { name: 'Flo Music', file: 'flomusic.png' },
  { name: 'UMA Music', file: 'umamusic.png' },
  { name: 'Zvuk', file: 'zvuk.png' },
  { name: 'LINE Music', file: 'linemusic.png' },
  { name: 'Facebook Rights', file: 'facebook-rights-management.png' },
  { name: 'Facebook Audio', file: 'facebook-audio-library.png' },
  { name: 'YouTube CID', file: 'youtube-content-id.png' },
  { name: 'ACRCloud', file: 'acr-cloud.png' }
];

// Split into 4 columns
const col1Data = allDSPLogos.filter((_, i) => i % 4 === 0);
const col2Data = allDSPLogos.filter((_, i) => i % 4 === 1);
const col3Data = allDSPLogos.filter((_, i) => i % 4 === 2);
const col4Data = allDSPLogos.filter((_, i) => i % 4 === 3);

function createLogoCards(column, data) {
  data.forEach(logo => {
    const card = document.createElement('div');
    card.className = 'platform-logo-card';
    card.innerHTML = `
      <img src="https://cms.karharimedia.com/images/dsp/${logo.file}" alt="${logo.name}">
    `;
    column.appendChild(card);
  });
}

const col1 = document.getElementById('scrollColumn1');
const col2 = document.getElementById('scrollColumn2');
const col3 = document.getElementById('scrollColumn3');
const col4 = document.getElementById('scrollColumn4');

createLogoCards(col1, col1Data);
createLogoCards(col2, col2Data);
createLogoCards(col3, col3Data);
createLogoCards(col4, col4Data);

// Duplicate content for seamless scroll
[col1, col2, col3, col4].forEach(col => {
  const clone = col.innerHTML;
  col.innerHTML += clone;
});

// Animate each column with different speeds for visual interest
function animateColumn(col, duration, direction) {
  const totalHeight = col.scrollHeight / 2;
  gsap.fromTo(col,
    { y: direction === 'up' ? 0 : -totalHeight },
    {
      y: direction === 'up' ? -totalHeight : 0,
      duration: duration,
      repeat: -1,
      ease: 'none',
      modifiers: {
        y: gsap.utils.unitize(y => parseFloat(y) % totalHeight)
      }
    }
  );
}

animateColumn(col1, 40, 'up');
animateColumn(col2, 50, 'down');
animateColumn(col3, 45, 'up');
animateColumn(col4, 55, 'down');

// ============================================
// SECTION SCROLL REVEALS
// ============================================
gsap.from('.platforms-content', {
  scrollTrigger: {
    trigger: '.all-platforms',
    start: 'top 75%',
  },
  opacity: 0,
  x: -50,
  duration: 0.8,
  ease: 'power3.out'
});

gsap.from('.platforms-scroll-wrapper', {
  scrollTrigger: {
    trigger: '.all-platforms',
    start: 'top 75%',
  },
  opacity: 0,
  x: 50,
  duration: 0.8,
  delay: 0.2,
  ease: 'power3.out'
});

// ============================================
// YOUTUBE NETWORK SECTION (diagram + connectors + stats)
// ============================================
(function () {
  const diagram = document.getElementById('ytDiagram');
  if (!diagram) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = document.getElementById('ytConnectors');
  const NS = 'http://www.w3.org/2000/svg';

  const connections = [
    { from: 'entertainment', fromEdge: 'bottom', to: 'cms', toEdge: 'top', type: 'straight' },
    { from: 'musicClub', fromEdge: 'right', to: 'cms', toEdge: 'leftUpper', type: 'hvh' },
    { from: 'bhaktiSagar', fromEdge: 'left', to: 'cms', toEdge: 'rightUpper', type: 'hvh' },
    { from: 'aaravFilms', fromEdge: 'top', to: 'cms', toEdge: 'bottomLeft', type: 'vhv' },
    { from: 'kidsWorld', fromEdge: 'top', to: 'cms', toEdge: 'bottomRight', type: 'vhv' }
  ];

  let pulseTweens = [];
  const STUB = 16;
  const CORNER_R = 6;
  let mainWires = [];

  function edgePoint(el, edge, containerRect) {
    const r = el.getBoundingClientRect();
    const x0 = r.left - containerRect.left;
    const y0 = r.top - containerRect.top;
    const cx = x0 + r.width / 2;
    const cy = y0 + r.height / 2;
    switch (edge) {
      case 'left': return { x: x0, y: cy };
      case 'right': return { x: x0 + r.width, y: cy };
      case 'top': return { x: cx, y: y0 };
      case 'bottom': return { x: cx, y: y0 + r.height };
      case 'leftUpper': return { x: x0, y: y0 + r.height * 0.32 };
      case 'rightUpper': return { x: x0 + r.width, y: y0 + r.height * 0.32 };
      case 'bottomLeft': return { x: x0 + r.width * 0.28, y: y0 + r.height };
      case 'bottomRight': return { x: x0 + r.width * 0.72, y: y0 + r.height };
    }
  }

  function roundedPolyline(pts, r) {
    if (pts.length < 2) return '';
    let d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < pts.length - 1; i += 1) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const next = pts[i + 1];
      const v1x = cur.x - prev.x;
      const v1y = cur.y - prev.y;
      const len1 = Math.hypot(v1x, v1y) || 1;
      const v2x = next.x - cur.x;
      const v2y = next.y - cur.y;
      const len2 = Math.hypot(v2x, v2y) || 1;
      const rr = Math.min(r, len1 / 2, len2 / 2);
      const a = { x: cur.x - (v1x / len1) * rr, y: cur.y - (v1y / len1) * rr };
      const b = { x: cur.x + (v2x / len2) * rr, y: cur.y + (v2y / len2) * rr };
      d += ' L ' + a.x + ' ' + a.y + ' Q ' + cur.x + ' ' + cur.y + ' ' + b.x + ' ' + b.y;
    }
    const last = pts[pts.length - 1];
    d += ' L ' + last.x + ' ' + last.y;
    return d;
  }

  function routePoints(p1, p2, type) {
    if (type === 'straight') return [p1, p2];
    if (type === 'hvh') {
      const sx = p2.x >= p1.x ? 1 : -1;
      const cornerA = { x: p1.x + sx * STUB, y: p1.y };
      const cornerB = { x: cornerA.x, y: p2.y };
      return [p1, cornerA, cornerB, p2];
    }
    if (type === 'vhv') {
      const sy = p2.y >= p1.y ? 1 : -1;
      const cA = { x: p1.x, y: p1.y + sy * STUB };
      const cB = { x: p2.x, y: cA.y };
      return [p1, cA, cB, p2];
    }
  }

  function addDefs() {
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML =
      '<linearGradient id="ytWireGradient" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#eaa12c" stop-opacity="0.35"/>' +
      '<stop offset="100%" stop-color="#f4c667" stop-opacity="0.85"/>' +
      '</linearGradient>';
    svg.appendChild(defs);
  }

  function refreshPulses() {
    pulseTweens.forEach((t) => t.kill());
    pulseTweens = [];
    if (reduceMotion) return;
    mainWires.forEach((w) => {
      w.pulse.style.opacity = 1;
      const tw = gsap.to(w.pulse, {
        motionPath: { path: w.path, align: w.path, alignOrigin: [0.5, 0.5] },
        duration: 2.4,
        repeat: -1,
        delay: w.delay,
        ease: 'power1.inOut'
      });
      pulseTweens.push(tw);
    });
  }

  function render(initial) {
    const containerRect = diagram.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + containerRect.width + ' ' + containerRect.height);
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
    svg.innerHTML = '';
    addDefs();
    mainWires = [];

    connections.forEach((c, i) => {
      const fromEl = document.querySelector('[data-node="' + c.from + '"]');
      const toEl = document.querySelector('[data-node="' + c.to + '"]');
      if (!fromEl || !toEl) return;
      const p1 = edgePoint(fromEl, c.fromEdge, containerRect);
      const p2 = edgePoint(toEl, c.toEdge, containerRect);
      const pts = routePoints(p1, p2, c.type);
      const d = roundedPolyline(pts, CORNER_R);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'yt-wire');
      svg.appendChild(path);

      pts.forEach((pt) => {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        dot.setAttribute('r', 2.2);
        dot.setAttribute('class', 'yt-node-dot');
        svg.appendChild(dot);
      });

      const pulse = document.createElementNS(NS, 'circle');
      pulse.setAttribute('r', 3.2);
      pulse.setAttribute('class', 'yt-pulse-dot');
      pulse.style.opacity = 0;
      svg.appendChild(pulse);

      mainWires.push({ path: path, pulse: pulse, delay: i * 0.3 });
    });

    if (initial) animateEntrance();
    else refreshPulses();
  }

  function animateEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.yt-eyebrow', { opacity: 1, duration: 0.5 }, 0)
      .fromTo('.yt-eyebrow', { y: 14 }, { y: 0, duration: 0.5 }, 0)
      .to('.yt-headline', { opacity: 1, duration: 0.6 }, 0.08)
      .fromTo('.yt-headline', { y: 18 }, { y: 0, duration: 0.6 }, 0.08)
      .to('.yt-lead', { opacity: 1, duration: 0.6 }, 0.18)
      .fromTo('.yt-lead', { y: 16 }, { y: 0, duration: 0.6 }, 0.18)
      .to('.yt-cta', { opacity: 1, duration: 0.6 }, 0.28)
      .fromTo('.yt-cta', { y: 14 }, { y: 0, duration: 0.6 }, 0.28);

    tl.to('.yt-card', { opacity: 1, duration: 0.55, stagger: 0.09 }, 0.2)
      .fromTo('.yt-card', { y: 16 }, { y: 0, duration: 0.55, stagger: 0.09 }, 0.2)
      .to('.yt-node--cms', { opacity: 1, duration: 0.5, scale: 1 }, 0.55)
      .fromTo('.yt-node--cms', { scale: 0.7 }, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.55);

    tl.add(function () {
      mainWires.forEach(function (w, i) {
        const len = w.path.getTotalLength();
        w.path.style.strokeDasharray = len;
        w.path.style.strokeDashoffset = len;
        gsap.to(w.path, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          delay: i * 0.08,
          onComplete: i === mainWires.length - 1 ? refreshPulses : null
        });
      });
      gsap.fromTo('.yt-node-dot', { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6 });
    }, 0.75);

    tl.to('.yt-stat-card', { opacity: 1, duration: 0.55, stagger: 0.08 }, 0.5)
      .fromTo('.yt-stat-card', { y: 16 }, { y: 0, duration: 0.55, stagger: 0.08 }, 0.5);

    if (!reduceMotion) {
      gsap.to('.yt-cms-icon', {
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 34px 4px rgba(255,80,80,0.55)',
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    document.querySelectorAll('.yt-stat-card').forEach(function (card) {
      const target = parseInt(card.getAttribute('data-target'), 10);
      const numEl = card.querySelector('.yt-stat-number');
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 3.2,
        delay: 1.1,
        ease: 'sine.inOut',
        onUpdate: function () {
          numEl.textContent = Math.round(counter.val).toLocaleString('en-US') + '+';
        }
      });
    });
  }

  function init() {
    // Play the whole entrance (cards, wires, and number counters)
    // when the section scrolls into view, instead of on page load.
    const section = diagram.closest('.yt-network') || diagram;
    gsap.set(section, { opacity: 0 });
    gsap.to(section, {
      opacity: 1,
      duration: 0.4,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: function () {
          render(true);
        }
      }
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { render(false); }, 200);
  });
})();
