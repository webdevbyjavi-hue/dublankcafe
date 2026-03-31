/* ================================================
   DuBlank Café — script.js
   Centro Histórico CDMX
   ================================================ */

'use strict';

/* ——— DOM ELEMENTS ——————————————————————————————— */
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const navLinks   = document.getElementById('navLinks');
const heroContent = document.getElementById('heroContent');

/* ================================================
   1. NAVBAR — scroll behaviour & toggle
   ================================================ */

// Add .scrolled class when page scrolled past threshold
function handleNavScroll() {
    const scrolled = window.scrollY > 45;
    navbar.classList.toggle('scrolled', scrolled);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load

// Mobile hamburger toggle
navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav when any link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});


/* ================================================
   2. SMOOTH SCROLL — for in-page anchor links
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const offset = navbar.offsetHeight + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });
    });
});


/* ================================================
   3. ACTIVE NAV LINK HIGHLIGHTING
   ================================================ */
const sections      = document.querySelectorAll('section[id]');
const navAnchorLinks = navLinks.querySelectorAll('a[href^="#"]');

function updateActiveLink() {
    let current = '';
    const scrollMid = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
        if (section.offsetTop <= scrollMid) {
            current = section.getAttribute('id');
        }
    });

    navAnchorLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('nav-active', isActive);
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();


/* ================================================
   4. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   (Intersection Observer API)
   ================================================ */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Small rAF delay for buttery render
            requestAnimationFrame(() => {
                entry.target.classList.add('visible');
            });
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
});

fadeElements.forEach(el => fadeObserver.observe(el));


/* ================================================
   5. HERO PARALLAX
   Subtle vertical drift on scroll
   ================================================ */
function heroParallax() {
    if (!heroContent) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    if (scrollY < vh) {
        const progress = scrollY / vh;            // 0 → 1
        const drift    = scrollY * 0.28;          // px to move up
        const fade     = 1 - progress * 1.6;     // fade out

        heroContent.style.transform = `translateY(${drift}px)`;
        heroContent.style.opacity   = Math.max(0, fade);
    } else {
        heroContent.style.opacity = '0';
    }
}

window.addEventListener('scroll', heroParallax, { passive: true });


/* ================================================
   6. STAGGER ANIMATION — grano features list
   ================================================ */
const granoSection  = document.getElementById('grano');
const granoItems    = document.querySelectorAll('.gfeature');

// Prepare items
granoItems.forEach(li => {
    li.style.opacity   = '0';
    li.style.transform = 'translateX(-18px)';
    li.style.transition = 'opacity .5s ease, transform .5s ease';
});

const granoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            granoItems.forEach((li, i) => {
                setTimeout(() => {
                    li.style.opacity   = '1';
                    li.style.transform = 'translateX(0)';
                }, i * 130);
            });
            granoObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

if (granoSection) granoObserver.observe(granoSection);


/* ================================================
   7. STEAM WISPS — randomise speed & delay
   ================================================ */
document.querySelectorAll('.steam-wisp').forEach(wisp => {
    const dur   = (2.8 + Math.random() * 2).toFixed(2);
    const delay = (Math.random() * 2).toFixed(2);
    const dx    = (Math.random() > .5 ? 1 : -1) * (Math.random() * 10 + 5);
    wisp.style.animationDuration  = `${dur}s`;
    wisp.style.animationDelay     = `${delay}s`;

    // Tiny CSS custom property for per-wisp horizontal drift
    wisp.style.setProperty('--dx', `${dx}px`);
});


/* ================================================
   8. COUNTER ANIMATION — nosotros stats
   Animated number count-up on first view
   ================================================ */
function animateCounter(el, target, suffix, duration = 1200) {
    const isPercentage = suffix === '%';
    const isCDMX       = suffix === 'CDMX';
    const isInfinity   = target === Infinity;

    if (isCDMX || isInfinity) return; // skip non-numeric

    let start    = null;
    const start0 = 0;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current  = Math.round(start0 + ease * target);

        el.textContent = current + (isPercentage ? '%' : '');

        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

const statVals = document.querySelectorAll('.nstat-val');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;

            statVals.forEach(el => {
                const text = el.textContent.trim();
                if (text === '100%') animateCounter(el, 100, '%', 1400);
                // CDMX and ∞ are left as-is
            });

            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const nosotrosSection = document.getElementById('nosotros');
if (nosotrosSection) statsObserver.observe(nosotrosSection);


/* ================================================
   9. BEAN DOT ORBIT PAUSE ON HOVER
   (pause CSS animation when user hovers logo)
   ================================================ */
const visLogoWrap = document.querySelector('.visual-ring-wrap');
const beanDots    = document.querySelectorAll('.bean-dot');

if (visLogoWrap) {
    visLogoWrap.addEventListener('mouseenter', () => {
        beanDots.forEach(d => d.style.animationPlayState = 'paused');
    });
    visLogoWrap.addEventListener('mouseleave', () => {
        beanDots.forEach(d => d.style.animationPlayState = 'running');
    });
}


/* ================================================
   10. GOOGLE MAP IFRAME — dark-mode toggle
   Allow user to view original map colours
   ================================================ */
const mapIframe = document.querySelector('.map-iframe');
let mapDark = true;

if (mapIframe) {
    // Add a small toggle button next to map
    const mapFrame = document.querySelector('.map-frame');
    if (mapFrame) {
        const mapToggle = document.createElement('button');
        mapToggle.className = 'map-mode-toggle';
        mapToggle.setAttribute('aria-label', 'Cambiar modo del mapa');
        mapToggle.textContent = '☀ Modo claro';

        // Inject styles
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .map-mode-toggle {
                position: absolute;
                top: .6rem;
                right: .6rem;
                z-index: 10;
                background: rgba(16,8,6,.85);
                color: rgba(242,230,212,.7);
                border: 1px solid rgba(196,123,43,.35);
                border-radius: 2px;
                padding: .35rem .75rem;
                font-family: 'Jost', sans-serif;
                font-size: .65rem;
                font-weight: 500;
                letter-spacing: .12em;
                text-transform: uppercase;
                cursor: pointer;
                backdrop-filter: blur(8px);
                transition: all .22s ease;
            }
            .map-mode-toggle:hover {
                background: rgba(196,123,43,.85);
                color: #100806;
                border-color: transparent;
            }
            .map-frame { position: relative; }
        `;
        document.head.appendChild(styleEl);
        mapFrame.appendChild(mapToggle);

        mapToggle.addEventListener('click', () => {
            mapDark = !mapDark;
            mapIframe.style.filter = mapDark
                ? 'invert(88%) hue-rotate(180deg) saturate(.75) brightness(.88) contrast(1.05)'
                : 'none';
            mapToggle.textContent = mapDark ? '☀ Modo claro' : '🌙 Modo oscuro';
        });
    }
}


/* ================================================
   11. HEADER VISIBILITY ON FAST SCROLL UP
   Auto-show nav on scroll up, hide on scroll down
   ================================================ */
let lastScrollY = 0;
let scrollDir   = 'down';
let ticking     = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const currentY = window.scrollY;
            scrollDir = currentY < lastScrollY ? 'up' : 'down';

            // Only hide nav after scrolled past hero
            if (currentY > window.innerHeight * 0.5) {
                navbar.style.transform = scrollDir === 'up' || currentY < 100
                    ? 'translateY(0)'
                    : 'translateY(-100%)';
                navbar.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1), background .45s ease, border-color .45s ease';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentY;
            ticking     = false;
        });
        ticking = true;
    }
}, { passive: true });


/* ================================================
   12. ACCESSIBILITY — keyboard focus ring only
   ================================================ */
document.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.remove('using-mouse');
});

const accessStyle = document.createElement('style');
accessStyle.textContent = `
    .using-mouse *:focus { outline: none !important; }
`;
document.head.appendChild(accessStyle);


/* ================================================
   13. LOGO IMAGE — graceful fallback
   ================================================ */
document.querySelectorAll('img[src*="linktr.ee"]').forEach(img => {
    img.addEventListener('error', function () {
        // Replace with a text-based SVG placeholder showing "DC"
        this.style.display = 'none';
        const svg = document.createElement('div');
        svg.style.cssText = `
            width: ${this.width || 42}px;
            height: ${this.height || 42}px;
            border-radius: 50%;
            background: #2D1B12;
            border: 1px solid rgba(196,123,43,.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cormorant Garamond', serif;
            font-size: ${(this.width || 42) * 0.35}px;
            font-style: italic;
            color: #D4A853;
            flex-shrink: 0;
        `;
        svg.textContent = 'D';
        this.parentNode.insertBefore(svg, this.nextSibling);
    });
});


/* ================================================
   14. PAGE LOAD — remove pre-render jank
   ================================================ */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Inject loaded style
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body.loaded * { -webkit-font-smoothing: antialiased; }
    `;
    document.head.appendChild(loadedStyle);
});


/* ================================================
   15. REDES SOCIAL CARDS — subtle tilt on hover
   (CSS perspective tilt effect)
   ================================================ */
document.querySelectorAll('.red-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const tiltX  = ((y - cy) / cy) * 5;   // max 5deg
        const tiltY  = ((x - cx) / cx) * -5;

        card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ================================================
   Console Easter Egg ☕
   ================================================ */
console.log(
    '%c ☕ DuBlank Café \n%c El mejor café de la ciudad · CDMX',
    'background:#C47B2B;color:#100806;font-family:serif;font-size:18px;font-weight:bold;padding:8px 16px;',
    'color:#D4A853;font-family:serif;font-size:13px;padding:4px 16px;'
);
