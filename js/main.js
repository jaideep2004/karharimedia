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
// Faded, slow streaks + rising particles + twinkling stars.
// Optimized: DPR cap, pre-rendered glow sprite, pauses when
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

  // --- Pre-rendered glow sprite (avoids per-particle shadowBlur) ---
  const spriteSize = 48;
  const glowSprite = document.createElement('canvas');
  glowSprite.width = spriteSize;
  glowSprite.height = spriteSize;
  {
    const sctx = glowSprite.getContext('2d');
    const grad = sctx.createRadialGradient(spriteSize / 2, spriteSize / 2, 0, spriteSize / 2, spriteSize / 2, spriteSize / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, spriteSize, spriteSize);
  }

  // --- Faded, slow flowing streaks ---
  const streaks = [];
  class EnergyStreak {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * grid.width;
      this.y = Math.random() * grid.height;
      this.length = 140 + Math.random() * 320;
      this.speed = 0.16 + Math.random() * 0.38;
      this.angle = Math.random() * Math.PI * 2;
      this.life = 0;
      this.maxLife = 500 + Math.random() * 400;
      this.color = Math.random() > 0.5 ? '255,208,0' : '150,90,255';
      this.wave = Math.random() * Math.PI * 2;
    }
    update() {
      this.life += 1;
      this.angle += 0.0004;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.life > this.maxLife) this.reset();
    }
    draw(now) {
      context.save();
      context.lineWidth = 1.4;
      context.lineCap = 'round';
      const grad = context.createLinearGradient(
        this.x, this.y,
        this.x + Math.cos(this.angle) * this.length,
        this.y + Math.sin(this.angle) * this.length
      );
      grad.addColorStop(0, `rgba(${this.color},0)`);
      grad.addColorStop(0.25, `rgba(${this.color},0.07)`);
      grad.addColorStop(0.5, `rgba(${this.color},0.22)`);
      grad.addColorStop(1, `rgba(${this.color},0)`);
      context.strokeStyle = grad;
      context.shadowColor = `rgb(${this.color})`;
      context.shadowBlur = 12;
      context.beginPath();
      context.moveTo(this.x, this.y);
      for (let i = 1; i < 6; i += 1) {
        const t = i / 6;
        const px = this.x + Math.cos(this.angle) * this.length * t
          + Math.sin(now / 1000 + i * 1.4 + this.wave) * 12;
        const py = this.y + Math.sin(this.angle) * this.length * t
          + Math.cos(now / 1200 + i * 1.4 + this.wave) * 12;
        context.lineTo(px, py);
      }
      context.stroke();
      context.restore();
    }
  }
  for (let i = 0; i < 11; i += 1) streaks.push(new EnergyStreak());

  // --- Faded, slow rising particles ---
  const particles = [];
  class EnergyParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * grid.width;
      this.y = Math.random() * grid.height;
      this.r = Math.random() * 1.4 + 0.8;
      this.speed = 0.1 + Math.random() * 0.3;
      this.color = Math.random() > 0.5 ? '255,208,0' : '155,95,255';
      this.phase = Math.random() * Math.PI * 2;
    }
    update(now) {
      this.y -= this.speed;
      this.alpha = Math.sin(now / 1000 + this.phase) * 0.11 + 0.22;
      if (this.y < -5) {
        this.reset();
        this.y = grid.height + 5;
      }
    }
    draw() {
      const size = this.r * 6;
      context.globalAlpha = Math.max(this.alpha, 0.05);
      context.globalCompositeOperation = 'lighter';
      context.drawImage(glowSprite, this.x - size / 2, this.y - size / 2, size, size);
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    }
  }
  for (let i = 0; i < 55; i += 1) particles.push(new EnergyParticle());

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

    for (let i = 0; i < particles.length; i += 1) {
      particles[i].update(now);
      particles[i].draw();
    }

    for (let i = 0; i < streaks.length; i += 1) {
      streaks[i].update();
      streaks[i].draw(now);
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

// Split into 3 columns
const col1Data = allDSPLogos.filter((_, i) => i % 3 === 0);
const col2Data = allDSPLogos.filter((_, i) => i % 3 === 1);
const col3Data = allDSPLogos.filter((_, i) => i % 3 === 2);

function createLogoCards(column, data) {
  data.forEach(logo => {
    const card = document.createElement('div');
    card.className = 'platform-logo-card';
    card.innerHTML = `
      <img src="dsp-logos/${logo.file}" alt="${logo.name}">
      <span>${logo.name}</span>
    `;
    column.appendChild(card);
  });
}

const col1 = document.getElementById('scrollColumn1');
const col2 = document.getElementById('scrollColumn2');
const col3 = document.getElementById('scrollColumn3');

createLogoCards(col1, col1Data);
createLogoCards(col2, col2Data);
createLogoCards(col3, col3Data);

// Duplicate content for seamless scroll
[col1, col2, col3].forEach(col => {
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
