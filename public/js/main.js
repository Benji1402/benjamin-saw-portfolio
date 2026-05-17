/* ===== Particle Background ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(87,183,242,${this.opacity})`;
        ctx.fill();
    }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(34,124,242,${0.06 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===== Typing Animation ===== */
const phrases = ["Business Student", "Data Analytics Enthusiast", "Future Business Leader", "Team Player & Leader"];
let pi = 0, ci = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function type() {
    const word = phrases[pi];
    typingEl.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);
    let delay = deleting ? 35 : 70;
    if (!deleting && ci > word.length) { delay = 2200; deleting = true; }
    else if (deleting && ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 400; }
    setTimeout(type, delay);
}
type();

/* ===== Sidebar ===== */
const sidebar = document.getElementById('sidebar');
const mobileToggle = document.getElementById('mobileToggle');
const navIcons = document.querySelectorAll('.nav-icon');
const sections = document.querySelectorAll('.section');

mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mobileToggle.querySelector('i').classList.toggle('fa-bars');
    mobileToggle.querySelector('i').classList.toggle('fa-xmark');
});

// Close sidebar on link click (mobile)
navIcons.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
            mobileToggle.querySelector('i').classList.add('fa-bars');
            mobileToggle.querySelector('i').classList.remove('fa-xmark');
        }
    });
});

// Active section tracking
function updateActive() {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    navIcons.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}
window.addEventListener('scroll', updateActive, { passive: true });

/* ===== Stats Counter ===== */
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        if (el.dataset.done) return;
        const target = parseFloat(el.dataset.target);
        const decimal = el.dataset.decimal === 'true';
        const start = performance.now();
        const duration = 2000;
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = decimal ? (ease * target).toFixed(1) : Math.floor(ease * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.dataset.done = '1';
        }
        requestAnimationFrame(tick);
    });
}

/* ===== Scroll Reveal ===== */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObs.unobserve(e.target); } });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObs.observe(heroStats);

/* ===== Contact Form ===== */
const form = document.getElementById('contactForm');
const successDiv = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const btnText = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    btn.disabled = true;
    btnText.textContent = 'Sending...';
    btnIcon.className = 'fas fa-spinner fa-spin';

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                message: document.getElementById('contactMessage').value
            })
        });
        const data = await res.json();
        if (data.success) {
            form.style.display = 'none';
            successDiv.style.display = 'block';
        } else {
            throw new Error('Failed');
        }
    } catch (err) {
        btnText.textContent = 'Failed — Try Again';
        btnIcon.className = 'fas fa-exclamation-circle';
        setTimeout(() => {
            btnText.textContent = 'Send Message';
            btnIcon.className = 'fas fa-paper-plane';
        }, 2500);
    } finally {
        btn.disabled = false;
    }
});

/* ===== Smooth Scroll ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
