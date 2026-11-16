/* =========================================================
   Ąžuolo baldai — 2 versija: bendra puslapio logika
   Be išorinių bibliotekų. Judesys tik jei lankytojas
   neprašė jo sumažinti.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* lietuviškos daugiskaitos formos: 1 failas, 2 failai, 10 failų */
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  };
  /* forms.js naudoja šiuos pagalbininkus */
  window.AB = { $, $$, esc, plural, reduceMotion, hasGsap: () => false };

  document.documentElement.classList.add("js");
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Antraštė ir mobilioji juosta ---------- */
  const hdr = $("#hdr");
  const mbar = $("#mbar");
  const contact = $("#kontaktai");
  let contactVisible = false;
  const onScroll = () => {
    const y = window.scrollY;
    hdr && hdr.classList.toggle("is-scrolled", y > 8);
    mbar && mbar.classList.toggle("is-on", y > window.innerHeight * 0.7 && !contactVisible);
  };
  if (contact && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; onScroll(); }, { threshold: 0.05 }).observe(contact);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilusis meniu ---------- */
  const menu = $("#menu");
  const openBtn = $("[data-menu-open]");
  if (menu && openBtn && typeof menu.showModal === "function") {
    openBtn.addEventListener("click", () => { menu.showModal(); openBtn.setAttribute("aria-expanded", "true"); });
    menu.addEventListener("close", () => openBtn.setAttribute("aria-expanded", "false"));
    $$("[data-menu-close]", menu).forEach((b) => b.addEventListener("click", () => menu.close()));
    /* modalinis langas blokuoja slinkimą, todėl pirmiausia uždarome meniu, tada slenkame prie skilties */
    $$(".menu__nav a, .menu__foot a", menu).forEach((a) => a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      const id = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
      const target = id && document.getElementById(id);
      menu.close();
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", "#" + id);
      target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    }));
    /* išplėtus langą iki kompiuterio pločio meniu uždaromas */
    window.matchMedia("(min-width: 1100px)").addEventListener("change", (e) => { if (e.matches && menu.open) menu.close(); });
  } else if (openBtn) {
    openBtn.addEventListener("click", () => { location.hash = "#gaminiai"; });
  }

  /* ---------- Aktyvi navigacijos nuoroda ---------- */
  const navLinks = $$(".hdr__nav a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    const map = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute("aria-current"));
        const a = map.get(e.target.id);
        a && a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- Gaminių sąrašas: nuotraukos peržiūra ---------- */
  const preview = $(".products__preview");
  const rows = $$(".prow");
  const show = (row) => {
    rows.forEach((r) => r.classList.toggle("is-active", r === row));
    if (!preview) return;
    const i = Number(row.dataset.img);
    $$("img", preview).forEach((img, n) => img.classList.toggle("is-on", n === i));
  };
  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => show(row));
    row.addEventListener("focusin", () => show(row));
  });
  rows[0] && rows[0].classList.add("is-active");

  /* ---------- Užklausos formos parinkimas iš nuorodų (#u-virtuve ir pan.) ---------- */
  const scrollToForm = () => {
    const form = $("#form");
    if (!form) return;
    form.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    const first = $("#f-name");
    first && setTimeout(() => first.focus({ preventScroll: true }), reduceMotion() ? 0 : 600);
  };
  const route = (hash) => {
    const m = /^#u-([a-z]+)$/.exec(hash || "");
    if (!m || !AB.forms) return false;
    const type = m[1];
    if (type === "vizitas" || type === "matavimas") AB.forms.setVisit(type);
    else AB.forms.setType(type);
    scrollToForm();
    return true;
  };
  AB.route = route;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#u-']");
    if (!a) return;
    e.preventDefault();
    history.replaceState(null, "", a.getAttribute("href"));
    route(a.getAttribute("href"));
  });
  window.addEventListener("hashchange", () => route(location.hash));
  window.addEventListener("load", () => { if (/^#u-/.test(location.hash)) setTimeout(() => route(location.hash), 50); });

  /* ---------- Nuotraukų peržiūra ---------- */
  const lb = $("#lb");
  const triggers = $$("[data-lb]");
  if (lb && triggers.length && typeof lb.showModal === "function") {
    const img = $("#lbImg"), cap = $("#lbCap"), count = $("#lbCount");
    const items = triggers
      .sort((a, b) => a.dataset.lb - b.dataset.lb)
      .map((t) => {
        const i = $("img", t);
        const set = (i.getAttribute("srcset") || "").split(",").map((s) => s.trim().split(" ")[0]).filter(Boolean);
        return { src: set[set.length - 1] || i.getAttribute("src"), alt: i.alt };
      });
    let cur = 0, opener = null;
    const render = () => {
      const it = items[cur];
      img.src = it.src;
      img.alt = it.alt;
      cap.textContent = it.alt;
      count.textContent = `${cur + 1} / ${items.length}`;
    };
    const go = (d) => { cur = (cur + d + items.length) % items.length; render(); };
    triggers.forEach((t) => t.addEventListener("click", () => {
      opener = t;
      cur = Number(t.dataset.lb);
      render();
      lb.showModal();
    }));
    $("[data-lb-close]", lb).addEventListener("click", () => lb.close());
    $("[data-lb-prev]", lb).addEventListener("click", () => go(-1));
    $("[data-lb-next]", lb).addEventListener("click", () => go(1));
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb__fig")) lb.close(); });
    lb.addEventListener("close", () => { img.removeAttribute("src"); opener && opener.focus(); });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  /* ---------- Žemėlapis tik paspaudus ---------- */
  const mapBox = $("#map");
  const mapBtn = $("#mapLoad");
  if (mapBox && mapBtn && mapBox.dataset.src) {
    mapBtn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = mapBox.dataset.src;
      f.title = "Dirbtuvės vieta žemėlapyje";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      mapBox.replaceChildren(f);
      mapBox.classList.add("is-loaded");
    });
  }

  /* ---------- Švelnus atsiradimas slenkant ---------- */
  if (!reduceMotion() && "IntersectionObserver" in window) {
    const els = $$(".shead, .gallery__head, .prow, .step, .species > div, .finish, .swatches, .prep, .form");
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }
})();
