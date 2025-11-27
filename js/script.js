// script.js — complete interactive behaviour
(function () {
  'use strict';

  /* -------------------------
     Cached DOM elements
  ------------------------- */
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('.theme-btn');
  const MENU_TOGGLE_ID = 'menu-toggle';
  const menuToggle = document.getElementById(MENU_TOGGLE_ID);
  const mobileNav = document.getElementById('mobile-nav');
  const projectsGrid = document.getElementById('projects-grid');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTech = document.getElementById('modal-tech');
  const modalLink = document.getElementById('modal-link');
  const modalCopy = document.getElementById('modal-copy');
  const modalCloseBtn = modal?.querySelector('.modal-close');
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const yearSpan = document.getElementById('year');
  const heroLead = document.querySelector('.hero-text .lead');
  const particleCanvas = document.getElementById('particles');

  /* -------------------------
     Utilities
  ------------------------- */
  const THEME_KEY = 'portfolio-theme-v2';

  function supportsLocalStorage() {
    try {
      const k = '__test__';
      localStorage.setItem(k, k);
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  function saveTheme(theme) {
    if (supportsLocalStorage()) localStorage.setItem(THEME_KEY, theme);
  }
  function loadTheme() {
    if (!supportsLocalStorage()) return null;
    return localStorage.getItem(THEME_KEY);
  }

  /* -------------------------
     Theme Switcher
  ------------------------- */
  function applyTheme(theme) {
    if (!theme) theme = 'dark';
    root.setAttribute('data-theme', theme);
  }

  // initial theme: prefer persisted, else system preference, else dark
  (function initTheme() {
    const persisted = loadTheme();
    if (persisted) {
      applyTheme(persisted);
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  })();

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme || 'dark';
      applyTheme(theme);
      saveTheme(theme);
      // small ARIA feedback
      btn.setAttribute('aria-pressed', 'true');
      // reset siblings
      themeButtons.forEach(b => { if (b !== btn) b.removeAttribute('aria-pressed'); });
    });
  });

  /* -------------------------
     Mobile menu toggle
  ------------------------- */
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      } else {
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileNav.hidden = false;
      }
    });

    // hide mobile nav on link click
    mobileNav.addEventListener('click', (ev) => {
      if (ev.target.tagName === 'A') {
        mobileNav.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------
     Year stamp
  ------------------------- */
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* -------------------------
     Scroll reveal (IntersectionObserver)
  ------------------------- */
  (function setupReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length || !('IntersectionObserver' in window)) {
      // fallback: just add visible
      revealEls.forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // optionally unobserve for performance
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => obs.observe(el));
  })();

  /* -------------------------
     Button ripple effect
  ------------------------- */
  document.addEventListener('pointerdown', (e) => {
    // use pointerdown to capture touch/mouse
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
    // the ::after animation is handled in CSS
  });

  /* -------------------------
     Typed hero intro
  ------------------------- */
  (function typeHero() {
    if (!heroLead) return;
    const text = heroLead.textContent.trim();
    if (!text) return;
    heroLead.textContent = '';
    let i = 0;
    function step() {
      heroLead.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        // small variable delay for nicer feel
        window.setTimeout(() => requestAnimationFrame(step), 14 + (i % 3) * 6);
      }
    }
    // slight delay to allow reveal animation
    window.setTimeout(() => requestAnimationFrame(step), 350);
  })();

  /* -------------------------
     Project modal handling
  ------------------------- */
  (function projectModal() {
    if (!projectsGrid || !modal) return;

    // open
    projectsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      openFromCard(card);
    });

    // keyboard open (Enter)
    projectsGrid.addEventListener('keydown', (e) => {
      const el = document.activeElement;
      if (e.key === 'Enter' && el && el.classList.contains('project-card')) {
        openFromCard(el);
      }
    });

    function openFromCard(card) {
      const title = card.dataset.title || '';
      const desc = card.dataset.desc || '';
      const tech = card.dataset.tech || '';
      const link = card.dataset.link || '#';
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      if (modalTech) modalTech.textContent = tech;
      if (modalLink) {
        modalLink.href = link;
        modalLink.setAttribute('aria-label', `Open ${title}`);
      }

      // show modal
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');

      // trap focus: focus close button
      setTimeout(() => {
        if (modalCloseBtn) modalCloseBtn.focus();
      }, 50);

      // store last focused element
      modal._lastFocus = document.activeElement;
      document.body.style.overflow = 'hidden';
    }

    // close handlers
    function closeModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (modal._lastFocus) {
        try { modal._lastFocus.focus(); } catch {}
      }
    }

    modalCloseBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });

    // copy button
    modalCopy?.addEventListener('click', () => {
      const info = `${modalTitle.textContent}\n${modalDesc.textContent}\n${modalTech?.textContent || ''}\n${modalLink?.href || ''}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(info).then(() => {
          modalCopy.textContent = 'Copied ✔️';
          setTimeout(() => modalCopy.textContent = 'Copy', 1400);
        }).catch(() => {
          modalCopy.textContent = 'Failed';
          setTimeout(() => modalCopy.textContent = 'Copy', 1400);
        });
      } else {
        // fallback: select + execCommand (older browsers)
        const ta = document.createElement('textarea');
        ta.value = info;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          modalCopy.textContent = 'Copied ✔️';
        } catch {
          modalCopy.textContent = 'Failed';
        }
        setTimeout(() => {
          modalCopy.textContent = 'Copy';
          document.body.removeChild(ta);
        }, 1400);
      }
    });

    // focus trap (basic)
    document.addEventListener('focusin', (e) => {
      if (!modal.classList.contains('show')) return;
      if (!modal.contains(e.target)) {
        // keep focus inside modal
        modalCloseBtn?.focus();
      }
    });
  })();

  /* -------------------------
     Contact form handling (mailto fallback)
  ------------------------- */
  (function contactFormHandler() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const name = (form.name?.value || '').trim();
      const email = (form.email?.value || '').trim();
      const message = (form.message?.value || '').trim();

      if (!name || !email || !message) {
        if (formFeedback) formFeedback.textContent = 'Please fill all fields.';
        return;
      }

      // basic email validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        if (formFeedback) formFeedback.textContent = 'Please enter a valid email.';
        return;
      }

      // prepare mailto
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      const mailto = `mailto:you@example.com?subject=${subject}&body=${body}`;

      // try mailto
      if (formFeedback) formFeedback.textContent = 'Opening mail client...';
      window.location.href = mailto;
    });
  })();

  /* -------------------------
     Soft particles canvas
  ------------------------- */
  (function softParticles() {
    if (!particleCanvas || !particleCanvas.getContext) return;
    const ctx = particleCanvas.getContext('2d', { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;
    let rafId = null;
    let particles = [];
    const COUNT = Math.max(30, Math.round((width * height) / (1600 * 1))); // scale with viewport

    function resize() {
      width = particleCanvas.width = window.innerWidth;
      height = particleCanvas.height = window.innerHeight;
      // recreate particles to fit new size
      particles = Array.from({ length: COUNT }).map(() => createParticle(true));
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticle(initialize) {
      return {
        x: rand(3, width),
        y: rand(3, height),
        r: rand(0.6, 2.5),
        dx: rand(-2, 2),
        dy: rand(-2, 2),
        alpha: rand(-4, 4),
        hueShift: rand(0, 180),
        drift: rand(-10, 10),
        color: rand(0,0)
      };
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        // gentle color based on theme accents
        const accent1 = getComputedStyle(root).getPropertyValue('--accent-1').trim() || '#ecc205ff';
        // draw circle
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.globalCompositeOperation = 'lighter';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // motion
        p.x += p.dx + Math.sin(p.hueShift * 0.01) * p.drift;
        p.y += p.dy;

        // wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        p.hueShift += 0.1;
      });

      rafId = requestAnimationFrame(step);
    }

    // pause when tab not visible to save CPU
    function handleVisibility() {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        if (!rafId) rafId = requestAnimationFrame(step);
      }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    // init
    resize();
    rafId = requestAnimationFrame(step);
  })();

  /* -------------------------
     Lightweight accessibility helpers
  ------------------------- */
  // ensure links that are not real have noopener etc.
  (function sanitizeLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      if (!a.rel.includes('noopener')) a.rel = (a.rel + ' noopener').trim();
    });
  })();

  /* -------------------------
     Small performance & safety
  ------------------------- */
  // throttle scroll reveals fallback (if IntersectionObserver not available)
  // (already handled above)

  // expose a small debug object when running locally (optional)
  try {
    window.__portfolio = {
      setTheme: applyTheme,
      getTheme: () => root.getAttribute('data-theme'),
    };
  } catch { /* ignore in strict CSP contexts */ }

})();
