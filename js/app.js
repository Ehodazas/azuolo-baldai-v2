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

  /* ---------- Socialiniai tinklai ----------
     Ikonos rodomos visada. Nuoroda jos tampa tik įrašius tikrą https adresą config.js;
     iki tol tai ne nuoroda, o ženklas su užrašu „Paskyra ruošiama“ (jokių neveikiančių nuorodų). */
  const social = (window.AB_CONFIG && window.AB_CONFIG.social) || {};
  const NETS = {
    facebook: { name: "Facebook", host: /(^|\.)facebook\.com$/, icon: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8Z" fill="currentColor"/>' },
    instagram: { name: "Instagram", host: /(^|\.)instagram\.com$/, icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>' },
  };
  const isValid = (k, n) => {
    try { const u = new URL(social[k]); return u.protocol === "https:" && n.host.test(u.hostname); } catch { return false; }
  };
  const ftrBrand = $(".ftr__brand");
  if (ftrBrand) {
    const ul = document.createElement("ul");
    ul.className = "ftr__social";
    ul.innerHTML = Object.entries(NETS).map(([k, n]) => {
      const svg = `<svg viewBox="0 0 24 24" aria-hidden="true">${n.icon}</svg>`;
      return isValid(k, n)
        ? `<li><a href="${esc(social[k])}" target="_blank" rel="noopener noreferrer" aria-label="${n.name} (atsidaro naujame lange)">${svg}</a></li>`
        : `<li><span class="is-soon" role="img" aria-label="${n.name}: paskyra ruošiama" title="${n.name}: paskyra ruošiama">${svg}</span></li>`;
    }).join("");
    ftrBrand.appendChild(ul);
  }

  /* iOS Safari rodo :active būseną tik tada, kai yra touchstart klausytojas */
  document.addEventListener("touchstart", () => {}, { passive: true });

  /* ---------- Antraštė ir mobilioji juosta (be scroll klausytojų) ---------- */
  const hdr = $("#hdr");
  const mbar = $("#mbar");
  const hero = $(".hero");
  const contact = $("#kontaktai");
  if ("IntersectionObserver" in window) {
    if (hdr) {
      const sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;";
      document.body.prepend(sentinel);
      new IntersectionObserver(([e]) => hdr.classList.toggle("is-scrolled", !e.isIntersecting)).observe(sentinel);
    }
    if (mbar && hero) {
      let heroIn = true, contactIn = false;
      const sync = () => mbar.classList.toggle("is-on", !heroIn && !contactIn);
      new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; sync(); }, { rootMargin: "0px 0px -30% 0px" }).observe(hero);
      contact && new IntersectionObserver(([e]) => { contactIn = e.isIntersecting; sync(); }, { threshold: 0.05 }).observe(contact);
    }
  }

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
  const scrollToForm = (focusId = "f-name") => {
    const form = $("#form");
    if (!form) return;
    form.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    const target = document.getElementById(focusId);
    target && setTimeout(() => target.focus({ preventScroll: true }), reduceMotion() ? 0 : 600);
  };
  const route = (hash) => {
    const m = /^#u-([a-z]+)$/.exec(hash || "");
    if (!m || !AB.forms) return false;
    const type = m[1];
    if (type === "biudzetas") { scrollToForm("f-budget"); return true; } /* „Nurodyti biudžetą“ */
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

  /* ---------- Atsiradimas slenkant: tik proceso žingsniai ir mozaikos nuotraukos, po vieną kartą ----------
     Kitas turinys sąmoningai nejuda. Elementai, kurie jau matomi įkėlus puslapį, nepaslepiami. */
  if (!reduceMotion() && "IntersectionObserver" in window) {
    const els = $$(".step, .mosaic .m, .joint").filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- DUK: sklandus atidarymas ir uždarymas ----------
     <details> išlaiko savo semantiką (ekrano skaitytuvai praneša „išskleista / suskleista“),
     JavaScript tik animuoja aukštį. Be JS arba su „sumažintu judesiu“ veikia įprastai. */
  $$(".qa").forEach((d) => {
    const sum = $("summary", d);
    const body = $(".qa__a", d);
    if (!sum || !body || !body.animate) return;
    let anim = null;
    const finish = () => { body.classList.remove("is-animating"); d.classList.remove("is-closing"); anim = null; };
    sum.addEventListener("click", (e) => {
      if (reduceMotion()) return;
      e.preventDefault();
      const wasClosing = d.classList.contains("is-closing");
      if (anim) anim.cancel();
      body.classList.add("is-animating");
      if (!d.open || wasClosing) {
        d.open = true;
        d.classList.remove("is-closing");
        const h = body.offsetHeight;
        anim = body.animate(
          [{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }],
          { duration: 340, easing: "cubic-bezier(.16, 1, .3, 1)" }
        );
        const a = anim; a.finished.then(() => { if (anim === a) finish(); }, () => {});
      } else {
        const h = body.offsetHeight;
        d.classList.add("is-closing");
        anim = body.animate(
          [{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 240, easing: "cubic-bezier(.4, 0, 1, 1)" }
        );
        const a = anim; a.finished.then(() => { if (anim === a) { d.open = false; finish(); } }, () => {});
      }
    });
  });

  /* ---------- Medienos rūšių pasirinkimas (WAI-ARIA skirtukai) ----------
     Rodyklės keičia rūšį iškart, Home / End – pirmą ir paskutinę.
     Be JavaScript mygtukai paslėpti, o visi aprašymai matomi iš eilės. */
  const woodx = $("#woodx");
  if (woodx) {
    const tablist = $(".woodx__tabs", woodx);
    const tabs = $$(".wtab", woodx);
    const panels = $$(".wpanel", woodx);
    const layers = $$(".woodx__layer", woodx);
    const stage = $(".woodx__stage", woodx);
    const pick = $(".wcmp-pick", woodx);
    const opts = $$(".wcmp-opt", woodx);
    const cmp = $("#wcmp");
    let current = null;   /* pasirinkta rūšis */
    let other = null;     /* rūšis, su kuria lyginama (arba null) */

    /* aprašymų duomenys paimami iš jau esamų skydelių, kad tekstas būtų vienoje vietoje */
    const info = (key) => {
      const p = panels.find((x) => x.dataset.wood === key);
      const rows = {};
      $$(".wpanel__dl > div", p).forEach((d) => { rows[$("dt", d).textContent] = $("dd", d).textContent; });
      return { name: $(".wpanel__name", p).textContent, rows };
    };
    const animateIn = (el) => {
      if (!reduceMotion() && el.animate) el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 280, easing: "ease-out" });
    };
    const render = () => {
      const comparing = !!other;
      /* vaizdas: viena rūšis arba padalytas per pusę į dvi */
      stage.classList.toggle("is-split", comparing);
      layers.forEach((l) => {
        const w = l.dataset.wood;
        l.classList.toggle("is-on", w === current || w === other);
        l.classList.toggle("is-left", comparing && w === current);
        l.classList.toggle("is-right", comparing && w === other);
      });
      /* palyginimo mygtukai: dabartinė rūšis paslepiama */
      opts.forEach((o) => {
        o.hidden = o.dataset.wood === current;
        o.setAttribute("aria-pressed", String(o.dataset.wood === other));
      });
      /* aprašymas arba palyginimas */
      panels.forEach((p) => { p.hidden = comparing || p.dataset.wood !== current; });
      cmp.hidden = !comparing;
      if (comparing) {
        const a = info(current), b = info(other);
        const labels = Object.keys(a.rows);
        cmp.innerHTML =
          `<table class="wcmp__table"><caption class="sr-only">${AB.esc(a.name)} ir ${AB.esc(b.name)}: palyginimas</caption>` +
          `<thead><tr><th scope="col">${AB.esc(a.name)}</th><th scope="col">${AB.esc(b.name)}</th></tr></thead><tbody>` +
          labels.map((l) => `<tr class="wcmp__lbl"><th colspan="2" scope="colgroup">${AB.esc(l)}</th></tr><tr><td>${AB.esc(a.rows[l] || "")}</td><td>${AB.esc(b.rows[l] || "")}</td></tr>`).join("") +
          `</tbody></table><button type="button" class="wcmp__close">Baigti palyginimą</button>`;
        $(".wcmp__close", cmp).addEventListener("click", () => {
          const back = opts.find((o) => o.dataset.wood === other);
          other = null;
          render();
          back && back.focus();
        });
        animateIn(cmp);
      } else {
        const p = panels.find((x) => x.dataset.wood === current);
        p && animateIn(p);
      }
    };
    const select = (tab, focus) => {
      current = tab.dataset.wood;
      if (other === current) other = null;
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      render();
      if (focus) tab.focus();
    };
    opts.forEach((o) => o.addEventListener("click", () => {
      other = other === o.dataset.wood ? null : o.dataset.wood; /* antras paspaudimas palyginimą išjungia */
      render();
    }));
    tablist.hidden = false;
    if (pick) pick.hidden = false;
    woodx.classList.add("is-ready");
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0], false);
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t, false));
      t.addEventListener("keydown", (e) => {
        const n = tabs.length;
        const map = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        select(tabs[(map[e.key] + n) % n], true);
      });
    });
  }
})();
