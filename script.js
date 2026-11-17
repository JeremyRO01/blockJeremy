/* =========================================================
   Animaciones e interacciones del blog de Jeremy Rodríguez
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Aparición de elementos al hacer scroll ---------- */
  const autoReveal = [
    ".section__header", ".card", ".project", ".skill", ".timeline__item",
    ".feature-list li", ".food-list li", ".facts > div", ".quote",
    ".page-nav a", ".cta-band .container", ".contact-info li", ".stat",
    ".detail__main h2", ".detail__text"
  ];
  document.querySelectorAll(autoReveal.join(",")).forEach((el) => {
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
  });

  // Retraso escalonado para los elementos que comparten contenedor
  const groups = new Map();
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty("--delay", Math.min(i, 6) * 90 + "ms");
    groups.set(parent, i + 1);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 2. Barra de progreso, menú y botón "subir" ---------- */
  const progress = document.querySelector(".scroll-progress");
  const nav = document.querySelector(".nav");
  const toTop = document.querySelector(".to-top");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = "scaleX(" + ratio + ")";
    if (nav) nav.classList.toggle("nav--scrolled", window.scrollY > 10);
    if (toTop) toTop.classList.toggle("is-shown", window.scrollY > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Cerrar el menú móvil al elegir una opción
  const toggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".nav__links a").forEach((a) => {
    a.addEventListener("click", () => { if (toggle) toggle.checked = false; });
  });

  /* ---------- 3. Texto que se escribe solo ---------- */
  const typed = document.querySelector("[data-typed]");
  if (typed) {
    const words = typed.getAttribute("data-typed").split("|");
    if (reduceMotion) {
      typed.textContent = words[0];
    } else {
      let w = 0, c = 0, deleting = false;
      (function tick() {
        const word = words[w];
        c += deleting ? -1 : 1;
        typed.textContent = word.slice(0, c);
        let wait = deleting ? 40 : 85;
        if (!deleting && c === word.length) { deleting = true; wait = 1800; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; wait = 350; }
        setTimeout(tick, wait);
      })();
    }
  }

  /* ---------- 4. Contadores animados ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        if (reduceMotion) { el.textContent = target + suffix; co.unobserve(el); return; }
        const start = performance.now();
        const dur = 1400;
        (function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        })(start);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- 5. Efecto 3D en la foto y luz en las tarjetas ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".photo-frame").forEach((frame) => {
      frame.addEventListener("mousemove", (e) => {
        const r = frame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      });
      frame.addEventListener("mouseleave", () => { frame.style.transform = ""; });
    });

    document.querySelectorAll(".card, .project").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---------- 6. Transición suave entre páginas ---------- */
  if (!reduceMotion) {
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      const internal = href && href.endsWith(".html") && !a.target && !href.startsWith("http");
      if (!internal) return;
      a.addEventListener("click", (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => { window.location.href = href; }, 220);
      });
    });
    // Si el usuario vuelve con el botón "atrás", quitar el fundido
    window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
  }
})();
