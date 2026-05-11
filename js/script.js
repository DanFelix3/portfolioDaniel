

/* 1. MENU OVERLAY */
const menuTrigger = document.getElementById('menuTrigger');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose   = document.getElementById('menuClose');
const menuLinks   = document.querySelectorAll('.menu-link');

function openMenu() {
    menuOverlay.classList.add('open');
    menuOverlay.setAttribute('aria-hidden', 'false');
    menuTrigger.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    menuOverlay.classList.remove('open');
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuTrigger.classList.remove('active');
    document.body.style.overflow = '';
}

menuTrigger.addEventListener('click', () => {
    menuOverlay.classList.contains('open') ? closeMenu() : openMenu();
});
menuClose.addEventListener('click', closeMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

/* close on overlay click (outside nav) */
menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) closeMenu();
});

/* close on Escape key */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

/* 2. SCROLL REVEAL  (IntersectionObserver)*/
const hiddenElements = document.querySelectorAll('.hidden');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            /* stagger siblings in same container */
            const siblings = Array.from(
                entry.target.parentElement.querySelectorAll('.hidden:not(.show)')
            );
            const delay = siblings.indexOf(entry.target) * 100;

            setTimeout(() => {
                entry.target.classList.add('show');
            }, Math.max(0, delay));

            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
});

hiddenElements.forEach(el => revealObserver.observe(el));

/* 3. PROJECTS SLIDER */
(function initProjectsSlider() {
    const track      = document.getElementById('projectsTrack');
    const prevBtn    = document.getElementById('projPrev');
    const nextBtn    = document.getElementById('projNext');
    const dotsWrap   = document.getElementById('sliderDots');

    if (!track) return;

    const tiles = track.querySelectorAll('.project-tile');
    const count = tiles.length;

    /* how many visible at once depends on viewport */
    function getVisible() {
        return window.innerWidth <= 600 ? 1 : 2;
    }

    let current = 0;
    let totalPages = () => count - getVisible() + 1;

    /* build dots */
    function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < Math.ceil(count / getVisible()); i++) {
            const btn = document.createElement('button');
            btn.className = 'slider-dot' + (i === 0 ? ' active' : '');
            btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
            btn.addEventListener('click', () => goTo(i * getVisible()));
            dotsWrap.appendChild(btn);
        }
    }

    function updateDots() {
        const dots = dotsWrap.querySelectorAll('.slider-dot');
        const pageIndex = Math.floor(current / getVisible());
        dots.forEach((d, i) => d.classList.toggle('active', i === pageIndex));
    }

    function goTo(index) {
        const visible = getVisible();
        const maxIndex = count - visible;
        current = Math.max(0, Math.min(index, maxIndex));

        /* tile width + gap */
        const tileEl    = tiles[0];
        const tileWidth = tileEl.getBoundingClientRect().width;
        const gap       = parseFloat(getComputedStyle(tileEl).marginRight) || 24;
        const offset    = current * (tileWidth + gap);

        track.style.transform = `translateX(-${offset}px)`;

        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= maxIndex;

        updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - getVisible()));
    nextBtn.addEventListener('click', () => goTo(current + getVisible()));

    /* touch/swipe support */
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
        }
    });

    function reset() {
        current = 0;
        buildDots();
        goTo(0);
    }

    reset();
    window.addEventListener('resize', reset);
})();

/* 4. SMOOTH ACTIVE NAV HIGHLIGHT (optional)
     Highlights menu link when section is in view */
const sections = document.querySelectorAll('section[id], footer[id]');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            menuLinks.forEach(link => {
                const href = link.getAttribute('href').replace('#', '');
                link.style.color = href === id
                    ? 'var(--color-5)'
                    : 'var(--text-muted)';
            });
        }
    });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* 5. HERO IMAGE PARALLAX (subtle)*/
const heroImg = document.querySelector('.hero-img-frame');

window.addEventListener('scroll', () => {
    if (!heroImg) return;
    const scrollY = window.scrollY;
    heroImg.style.transform = `translateY(${scrollY * 0.08}px)`;
}, { passive: true });