gsap.registerPlugin(ScrollTrigger);
document.getElementById('year').textContent = new Date().getFullYear();

// --- BULLETPROOF CURSOR LOGIC ---
// Instead of relying on buggy media queries for hybrid laptops, we detect physical mouse movement.
let hasTouch = false;
let cursorVisible = false;
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let trail = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

window.addEventListener('mousemove', e => {
  if (hasTouch) return; // Ignore if user has touched the screen
  
  // Show cursor only on the very first mouse movement
  if (!cursorVisible) {
    cursor.style.opacity = '1';
    cursorTrail.style.opacity = '1';
    cursorVisible = true;
  }
  
  mouse.x = e.clientX; 
  mouse.y = e.clientY;
  cursor.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
});

function animateTrail() {
  if(cursorVisible) {
    trail.x += (mouse.x - trail.x) * 0.15; 
    trail.y += (mouse.y - trail.y) * 0.15;
    cursorTrail.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Hover states for cursor
document.querySelectorAll('a, button, .card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorTrail.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorTrail.classList.remove('hover'));
});

// Magnetic buttons (Desktop only)
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    if(hasTouch) return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, { x: (e.clientX - rect.left - rect.width/2) * 0.4, y: (e.clientY - rect.top - rect.height/2) * 0.4, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    if(hasTouch) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
  });
});

// 3D Tilt for cards (Desktop only)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    if(hasTouch) return;
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -12; 
    const rotateY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 12;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    if(hasTouch) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
});

// --- GLITCH TEXT UTILITY ---
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+<>_";
function createGlitchEffect(el) {
  if (el.dataset.isGlitching === "true") return;
  el.dataset.isGlitching = "true";
  const originalText = el.dataset.value;
  let iterations = 0;
  
  const interval = setInterval(() => {
    el.innerText = originalText.split("").map((letter, index) => {
      if(index < iterations) return originalText[index];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    
    if(iterations >= originalText.length) {
      clearInterval(interval);
      el.dataset.isGlitching = "false";
    }
    iterations += 1 / 2;
  }, 30);
}

// Initialize Glitch on Boot Title immediately
createGlitchEffect(document.querySelector('#boot-screen .glitch-text'));

document.querySelectorAll('main .glitch-text').forEach(el => {
  el.addEventListener('mouseenter', () => { if(!hasTouch) createGlitchEffect(el); });
  ScrollTrigger.create({ trigger: el, start: "top 85%", onEnter: () => createGlitchEffect(el) });
});

// --- BOOT SEQUENCE LOGIC ---
const bootScreen = document.getElementById('boot-screen');
const initBtn = document.getElementById('init-btn');
const termOut = document.getElementById('terminal-output');
const progCont = document.getElementById('progress-container');
const progBar = document.getElementById('progress-bar');

initBtn.addEventListener('click', () => {
  initBtn.style.display = 'none';
  termOut.style.display = 'block';
  progCont.style.display = 'block';

  const sequence = [
    "CONNECTING TO SECURE NODE [NITHAN.IN]...",
    "BYPASSING FIREWALL... SUCCESS",
    "DECRYPTING USER_PROFILE [RUBIN_STELLAR]...",
    "MOUNTING UI MODULES & PARTICLE ENGINE...",
    "ESTABLISHING COMMS LINK...",
    "ACCESS GRANTED."
  ];

  let delay = 0;
  sequence.forEach((text, i) => {
    let typingSpeed = delay + (Math.random() * 400 + 300); 
    setTimeout(() => {
      const line = document.createElement('div');
      line.innerText = `> ${text}`;
      termOut.appendChild(line);
      gsap.to(progBar, {width: `${(i+1)*(100/sequence.length)}%`, duration: 0.5, ease: "power2.out"});
    }, typingSpeed);
    delay = typingSpeed;
  });

  setTimeout(() => {
    gsap.to(bootScreen, {
      yPercent: -100, opacity: 0, duration: 1.2, ease: "power4.inOut",
      onComplete: () => {
        bootScreen.remove();
        startPortfolioAnimations();
      }
    });
  }, delay + 800);
});

// --- MAIN PORTFOLIO ANIMATIONS (FLAWLESS REVEAL) ---
function startPortfolioAnimations() {
  // 1. Unlock scrolling so user can move down
  document.body.style.overflow = 'auto';
  document.body.style.overflowX = 'hidden';

  // 2. Animate Hero Section (From initial hidden CSS state to visible)
  gsap.to('.gs-reveal', { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' });
  gsap.to('.p-card', { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.6 });

  // 3. Setup ScrollTriggers for lower cards
  gsap.utils.toArray('.scroll-card').forEach(card => {
    gsap.to(card, {
      scrollTrigger: { 
        trigger: card, 
        start: "top 90%", // Animates when top of card hits bottom 10% of screen
        toggleActions: "play none none reverse" 
      },
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out"
    });
  });

  // 4. Crucial: Refresh GSAP math now that scrollbar exists
  setTimeout(() => ScrollTrigger.refresh(), 100);
}

// --- MOBILE TACTILE RIPPLE EFFECT ---
document.querySelectorAll('.interactive-el').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if(!hasTouch) return; 
    let x = e.clientX - e.target.getBoundingClientRect().left;
    let y = e.clientY - e.target.getBoundingClientRect().top;
    
    let ripples = document.createElement('span');
    ripples.style.left = x + 'px'; ripples.style.top = y + 'px';
    ripples.classList.add('touch-ripple');
    this.appendChild(ripples);
    
    setTimeout(() => ripples.remove(), 600);
  });
});

// --- NAVBAR HIDE ON SCROLL ---
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 100 && currentScroll > lastScroll) document.getElementById('navbar').style.transform = 'translateY(-100%)';
  else document.getElementById('navbar').style.transform = 'translateY(0)';
  lastScroll = currentScroll;
}, {passive: true});

// --- PARALLAX PARTICLES ---
const canvases = [document.getElementById('p-back'), document.getElementById('p-mid'), document.getElementById('p-front')];
class ParticleLayer {
  constructor(canvas, count, speedRange, sizeRange, colorBase, parallaxSpeed) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.count = count; this.speedRange = speedRange; this.sizeRange = sizeRange; 
    this.colorBase = colorBase; this.parallaxSpeed = parallaxSpeed; this.particles = [];
    this.resize(); window.addEventListener('resize', () => this.resize());
    for(let i=0; i<this.count; i++) this.particles.push(this.create());
  }
  resize() { this.w = window.innerWidth; this.h = window.innerHeight; this.canvas.width = this.w; this.canvas.height = this.h; }
  create() { return { x: Math.random() * this.w, y: Math.random() * this.h, size: this.sizeRange[0] + Math.random() * (this.sizeRange[1] - this.sizeRange[0]), speed: this.speedRange[0] + Math.random() * (this.speedRange[1] - this.speedRange[0]), hue: this.colorBase + (Math.random() * 20 - 10), alpha: 0.2 + Math.random() * 0.8 }; }
  render(scrollY) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.particles.forEach(p => {
      p.y -= p.speed;
      let renderY = p.y - (scrollY * this.parallaxSpeed);
      if (renderY < -50) p.y = this.h + 50 + (scrollY * this.parallaxSpeed);
      if (renderY > this.h + 50) p.y = -50 + (scrollY * this.parallaxSpeed);
      p.x += Math.sin(p.y * 0.01) * 0.5;
      if (p.x > this.w + 20) p.x = -20; if (p.x < -20) p.x = this.w + 20;
      this.ctx.beginPath(); this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.alpha})`;
      this.ctx.arc(p.x, renderY, p.size, 0, Math.PI * 2); this.ctx.fill();
    });
  }
}

const mult = window.innerWidth > 600 ? 1 : 0.5; // Cut particles in half for mobile
const layers = [
  new ParticleLayer(canvases[0], 40*mult, [0.1, 0.3], [1, 3], 340, 0.1),
  new ParticleLayer(canvases[1], 30*mult, [0.3, 0.7], [2, 5], 345, 0.3),
  new ParticleLayer(canvases[2], 20*mult, [0.8, 1.5], [3, 8], 350, 0.6)
];

function renderParticles() {
  const scrollY = window.pageYOffset;
  layers.forEach(layer => layer.render(scrollY));
  requestAnimationFrame(renderParticles);
}
renderParticles();
