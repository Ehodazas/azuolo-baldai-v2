/* =========================================================
   Ąžuolo baldai – užklausos krepšelis, įsiminti gaminiai, paieška
   ---------------------------------------------------------
   - Duomenys: window.AB_CATALOG (js/catalog.js), pastovūs ID.
   - Saugoma tik lankytojo naršyklėje (localStorage), su versija.
     Jei saugykla neprieinama, viskas veikia iki puslapio uždarymo.
   - Krepšelis nėra pirkimas: jis prisegamas prie užklausos formos
     ir siunčiamas tuo pačiu keliu (laukas „cart“).
   ========================================================= */
(() => {
  const CAT = window.AB_CATALOG;
  if (!CAT || !window.AB) return;
  const { $, $$, esc, plural, reduceMotion } = window.AB;

  const BASKET_KEY = "ab2-inquiry";
  const FAVS_KEY = "ab2-favorites";
  const VERSION = 1;
  const MAX_ITEMS = 12;

  /* ---------- Saugykla ---------- */
  const storage = {
    read(key) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
      catch { return null; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; } /* privatus režimas, pilna saugykla ir pan. */
    },
  };

  const woodIds = CAT.woods.map((w) => w[0]);
  const finishIds = CAT.finishes.map((f) => f[0]);
  const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");

  /* nežinomi ar pašalinti gaminiai išmetami, laukai apkarpomi */
  const cleanItem = (raw) => {
    const cat = raw && CAT.byId(raw.id);
    if (!cat) return null;
    const subIds = cat.subtypes.map((s) => s[0]);
    const qty = Math.min(50, Math.max(1, parseInt(raw.qty, 10) || 1));
    return {
      id: cat.id,
      details: Array.isArray(raw.details) ? [...new Set(raw.details.filter((d) => subIds.includes(d)))] : [],
      wood: woodIds.includes(raw.wood) ? raw.wood : "",
      finish: finishIds.includes(raw.finish) ? raw.finish : "",
      size: str(raw.size, 120),
      qty,
      note: str(raw.note, 500),
    };
  };

  let dropped = 0;
  const loadBasket = () => {
    const data = storage.read(BASKET_KEY);
    if (!data || data.v !== VERSION || !Array.isArray(data.items)) return { items: [], include: true };
    const items = [];
    data.items.forEach((r) => {
      const it = cleanItem(r);
      if (it && !items.some((x) => x.id === it.id)) items.push(it); else dropped++;
    });
    return { items: items.slice(0, MAX_ITEMS), include: data.include !== false };
  };
  const loadFavs = () => {
    const data = storage.read(FAVS_KEY);
    if (!data || data.v !== VERSION || !Array.isArray(data.ids)) return [];
    const ids = [...new Set(data.ids.filter((id) => CAT.byId(id)))];
    dropped += data.ids.length - ids.length;
    return ids;
  };

  let basket = loadBasket();
  let favs = loadFavs();

  let saveTimer = null;
  const saveBasket = (now) => {
    clearTimeout(saveTimer);
    const run = () => storage.write(BASKET_KEY, { v: VERSION, items: basket.items, include: basket.include });
    if (now) run(); else saveTimer = setTimeout(run, 300); /* pastabų rašymas nerašo į saugyklą po kiekvieno ženklo */
  };
  const saveFavs = () => storage.write(FAVS_KEY, { v: VERSION, ids: favs });

  /* ---------- Pranešimai ---------- */
  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.hidden = true;
  document.body.appendChild(toast);
  let toastTimer = null;
  const announce = (text, action) => {
    live.textContent = "";
    setTimeout(() => (live.textContent = text), 30);
    toast.innerHTML = `<span>${esc(text)}</span>` + (action ? `<button type="button" class="toast__btn">${esc(action.label)}</button>` : "");
    toast.hidden = false;
    toast.classList.remove("is-in");
    void toast.offsetWidth;
    toast.classList.add("is-in");
    if (action) $(".toast__btn", toast).addEventListener("click", () => { toast.hidden = true; action.run(); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 4500);
  };

  /* ---------- Krepšelio API ---------- */
  const inBasket = (id) => basket.items.some((x) => x.id === id);
  const itemText = (it) => {
    const cat = CAT.byId(it.id);
    const parts = [];
    if (it.details.length) parts.push("tipas: " + it.details.map((d) => (cat.subtypes.find((s) => s[0] === d) || [, d])[1]).join(", "));
    if (it.wood) parts.push("mediena: " + CAT.woods.find((w) => w[0] === it.wood)[1]);
    if (it.finish) parts.push("apdaila: " + CAT.finishes.find((f) => f[0] === it.finish)[1]);
    if (it.size) parts.push("matmenys: " + it.size);
    if (it.qty > 1) parts.push("kiekis: " + it.qty);
    if (it.note) parts.push("pastabos: " + it.note.replace(/\s+/g, " "));
    return cat.title + (parts.length ? " – " + parts.join("; ") : "");
  };
  const AB_BASKET = {
    items: () => basket.items.slice(),
    count: () => basket.items.length,
    has: inBasket,
    included: () => basket.include && basket.items.length > 0,
    setIncluded(on) { basket.include = !!on; saveBasket(true); emit(); },
    add(id) {
      const cat = CAT.byId(id);
      if (!cat) return false;
      if (inBasket(id)) { announce(`${cat.title} jau yra užklausoje.`, { label: "Peržiūrėti", run: () => openDrawer("basket") }); return false; }
      if (basket.items.length >= MAX_ITEMS) { announce(`Užklausoje gali būti ne daugiau kaip ${MAX_ITEMS} gaminių.`); return false; }
      basket.items.push(cleanItem({ id }));
      basket.include = true;
      saveBasket(true); emit();
      announce(`${cat.title}: įtraukta į užklausą.`, { label: "Peržiūrėti", run: () => openDrawer("basket") });
      return true;
    },
    remove(id) {
      const cat = CAT.byId(id);
      basket.items = basket.items.filter((x) => x.id !== id);
      saveBasket(true); emit();
      cat && announce(`${cat.title}: pašalinta iš užklausos.`);
    },
    update(id, patch) {
      const i = basket.items.findIndex((x) => x.id === id);
      if (i < 0) return;
      basket.items[i] = cleanItem(Object.assign({}, basket.items[i], patch));
      saveBasket(false); emit({ quiet: true });
    },
    clear() { basket.items = []; basket.include = true; saveBasket(true); emit(); },
    /* tekstas, kuris įrašomas į užklausos lauką „cart“ */
    payload() {
      if (!AB_BASKET.included()) return "";
      return basket.items.map((it, i) => `${i + 1}. ${itemText(it)}`).join("\n");
    },
    summaryText: itemText,
  };
  const AB_FAVS = {
    ids: () => favs.slice(),
    has: (id) => favs.includes(id),
    toggle(id) {
      const cat = CAT.byId(id);
      if (!cat) return;
      const on = !favs.includes(id);
      favs = on ? [...favs, id] : favs.filter((x) => x !== id);
      saveFavs(); emit();
      announce(on ? `${cat.title}: įsiminta.` : `${cat.title}: pašalinta iš įsimintų.`, on ? { label: "Peržiūrėti", run: () => openDrawer("favs") } : null);
    },
  };
  window.AB.basket = AB_BASKET;
  window.AB.favs = AB_FAVS;

  /* ---------- Atnaujinimai ---------- */
  const listeners = [];
  const onChange = (fn) => listeners.push(fn);
  const emit = (opts = {}) => {
    listeners.forEach((fn) => fn(opts));
    document.dispatchEvent(new CustomEvent("ab:basket")); /* užklausos forma atnaujina santrauką */
  };
  /* kitoje kortelėje atlikti pakeitimai */
  window.addEventListener("storage", (e) => {
    if (e.key === BASKET_KEY) basket = loadBasket();
    else if (e.key === FAVS_KEY) favs = loadFavs();
    else return;
    emit();
  });

  /* ---------- Antraštės mygtukai ---------- */
  const hdrIn = $(".hdr__in");
  let favBtn = null, bagBtn = null;
  if (hdrIn) {
    const tools = document.createElement("div");
    tools.className = "hdr__tools";
    tools.innerHTML =
      `<button type="button" class="tool" data-open-drawer="favs"><svg aria-hidden="true"><use href="#i-heart"/></svg><span class="tool__label">Įsiminti</span><span class="tool__n" aria-hidden="true"></span></button>` +
      `<button type="button" class="tool" data-open-drawer="basket"><svg aria-hidden="true"><use href="#i-bag"/></svg><span class="tool__label">Mano užklausa</span><span class="tool__n" aria-hidden="true"></span></button>`;
    const before = $(".hdr__cta", hdrIn) || $(".menu-btn", hdrIn);
    hdrIn.insertBefore(tools, before);
    [favBtn, bagBtn] = $$(".tool", tools);
  }
  const bump = (el) => {
    if (!el || reduceMotion() || !el.animate) return;
    el.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
  };
  let lastCounts = [favs.length, basket.items.length];
  const renderTools = () => {
    const f = favs.length, b = basket.items.length;
    if (favBtn) {
      $(".tool__n", favBtn).textContent = f || "";
      favBtn.setAttribute("aria-label", f ? `Įsiminti gaminiai: ${f}` : "Įsiminti gaminiai: nėra");
      if (f !== lastCounts[0]) bump($(".tool__n", favBtn));
    }
    if (bagBtn) {
      $(".tool__n", bagBtn).textContent = b || "";
      bagBtn.setAttribute("aria-label", b ? `Mano užklausa: ${b} ${plural(b, "gaminys", "gaminiai", "gaminių")}` : "Mano užklausa: tuščia");
      if (b !== lastCounts[1]) bump($(".tool__n", bagBtn));
    }
    lastCounts = [f, b];
  };

  /* ---------- Gaminių eilutės: širdelė ir „Į užklausą“ ---------- */
  const rows = $$(".prow");
  rows.forEach((row) => {
    const link = $(".prow__link", row);
    const id = link && link.dataset.type;
    const cat = CAT.byId(id);
    if (!cat) return;
    row.dataset.id = id;
    /* tipų sąrašas imamas iš bendrų duomenų */
    const tags = $(".prow__tags", row);
    if (tags) tags.textContent = cat.subtypes.map((s) => s[1]).join(" · ");
    /* patvirtinta orientacinė kaina (jei kada bus įrašyta catalog.js) */
    if (cat.price && cat.price.verified && cat.price.from) {
      const p = document.createElement("span");
      p.className = "prow__price";
      p.textContent = `Orientacinė kaina nuo ${Number(cat.price.from).toLocaleString("lt-LT")} €${cat.price.unit ? " / " + cat.price.unit : ""}`;
      $(".prow__body", row).appendChild(p);
    }
    const actions = document.createElement("div");
    actions.className = "prow__actions";
    actions.innerHTML =
      `<button type="button" class="fav" data-fav="${id}" aria-pressed="false"><svg aria-hidden="true"><use href="#i-heart"/></svg><span class="sr-only">Įsiminti: ${esc(cat.title)}</span></button>` +
      `<button type="button" class="addq" data-add="${id}"><svg aria-hidden="true"><use href="#i-plus"/></svg><span class="addq__t">Į užklausą</span></button>`;
    row.appendChild(actions);
  });
  const renderRows = () => {
    $$("[data-fav]").forEach((b) => {
      const on = AB_FAVS.has(b.dataset.fav);
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-on", on);
    });
    $$("[data-add]").forEach((b) => {
      const on = AB_BASKET.has(b.dataset.add);
      b.classList.toggle("is-in", on);
      const t = $(".addq__t", b);
      if (t) t.textContent = on ? "Užklausoje" : "Į užklausą";
      $("use", b).setAttribute("href", on ? "#i-check" : "#i-plus");
      const cat = CAT.byId(b.dataset.add);
      b.setAttribute("aria-label", on ? `${cat.title} jau užklausoje. Peržiūrėti užklausą` : `Įtraukti į užklausą: ${cat.title}`);
    });
  };
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-fav]");
    if (f) { AB_FAVS.toggle(f.dataset.fav); return; }
    const a = e.target.closest("[data-add]");
    if (a) {
      if (AB_BASKET.has(a.dataset.add)) openDrawer("basket", a.dataset.add);
      else AB_BASKET.add(a.dataset.add);
      return;
    }
    const o = e.target.closest("[data-open-drawer]");
    if (o) openDrawer(o.dataset.openDrawer);
  });

  /* ---------- Šoninis skydelis (dialog) ---------- */
  const drawer = document.createElement("dialog");
  drawer.className = "drawer";
  drawer.setAttribute("aria-labelledby", "drawerTitle");
  drawer.innerHTML = `
    <div class="drawer__top">
      <h2 class="drawer__title" id="drawerTitle"></h2>
      <button type="button" class="icon-btn drawer__close" aria-label="Uždaryti"><svg><use href="#i-close"/></svg></button>
    </div>
    <div class="drawer__switch" role="group" aria-label="Rodyti">
      <button type="button" data-mode="basket" aria-pressed="false">Mano užklausa <span data-n="basket"></span></button>
      <button type="button" data-mode="favs" aria-pressed="false">Įsiminti <span data-n="favs"></span></button>
    </div>
    <div class="drawer__body" id="drawerBody"></div>
    <div class="drawer__foot" id="drawerFoot"></div>`;
  document.body.appendChild(drawer);
  let mode = "basket";
  let opener = null;
  const formHere = () => !!$("#form");

  const optList = (arr, sel, empty) => `<option value="">${empty}</option>` + arr.map(([v, l]) => `<option value="${v}"${v === sel ? " selected" : ""}>${esc(l)}</option>`).join("");
  const renderBasket = () => {
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!basket.items.length) {
      body.innerHTML = `<div class="drawer__empty">
        <p class="drawer__empty-h">Užklausa kol kas tuščia</p>
        <p>Skiltyje „Ką gaminame“ spauskite „Į užklausą“ prie dominančių gaminių. Čia galėsite nurodyti matmenis, medieną ir pastabas, o tada pateikti vieną bendrą užklausą.</p>
        <p>Galite ir tiesiog parašyti mums be krepšelio.</p></div>`;
      foot.innerHTML = `<a href="${formHere() ? "#gaminiai" : "./#gaminiai"}" class="btn btn--block" data-close-drawer>Peržiūrėti gaminius</a>
        <a href="${formHere() ? "#kontaktai" : "./#kontaktai"}" class="btn btn--line btn--block" data-close-drawer>Rašyti be krepšelio</a>`;
      return;
    }
    body.innerHTML = `<p class="drawer__lead">Tai ne užsakymas. Pagal šią užklausą parengsime individualų pasiūlymą. Visi laukai neprivalomi.</p><ul class="bitems">` +
      basket.items.map((it) => {
        const cat = CAT.byId(it.id);
        const uid = "b-" + it.id;
        return `<li class="bitem" data-id="${it.id}">
          <div class="bitem__head">
            <img src="${cat.image}" alt="" width="64" height="64" loading="lazy" decoding="async">
            <div class="bitem__t"><h3>${esc(cat.title)}</h3><p class="bitem__sum">${esc(itemText(it).replace(cat.title, "").replace(/^ – /, "") || "Dar nepatikslinta")}</p></div>
            <button type="button" class="bitem__rm" data-rm="${it.id}" aria-label="Pašalinti iš užklausos: ${esc(cat.title)}"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
          </div>
          <details class="bitem__edit">
            <summary>Patikslinti</summary>
            <fieldset class="bitem__f"><legend>Kas tiksliau domina?</legend><div class="details__opts">` +
              cat.subtypes.map(([k, l]) => `<label class="chk"><input type="checkbox" data-k="details" value="${k}"${it.details.includes(k) ? " checked" : ""}><span>${esc(l)}</span></label>`).join("") +
            `</div></fieldset>
            <div class="bitem__grid">
              <div class="field"><label for="${uid}-wood">Mediena</label><select id="${uid}-wood" data-k="wood">${optList(CAT.woods, it.wood, "Dar nežinau")}</select></div>
              <div class="field"><label for="${uid}-finish">Apdaila</label><select id="${uid}-finish" data-k="finish">${optList(CAT.finishes, it.finish, "Dar nežinau")}</select></div>
              <div class="field"><label for="${uid}-size">Apytiksliai matmenys</label><input id="${uid}-size" data-k="size" maxlength="120" value="${esc(it.size)}" placeholder="pvz. 180 × 90 cm"></div>
              <div class="field"><label for="${uid}-qty">Kiekis</label><input id="${uid}-qty" data-k="qty" type="number" inputmode="numeric" min="1" max="50" value="${it.qty}"></div>
              <div class="field bitem__full"><label for="${uid}-note">Pastabos</label><textarea id="${uid}-note" data-k="note" rows="2" maxlength="500">${esc(it.note)}</textarea></div>
            </div>
          </details>
        </li>`;
      }).join("") + `</ul>`;
    foot.innerHTML = `<button type="button" class="btn btn--block" data-submit-basket>Pateikti bendrą užklausą</button>
      <button type="button" class="drawer__clear" data-clear-basket>Išvalyti užklausą</button>`;
  };
  const renderFavsList = () => {
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!favs.length) {
      body.innerHTML = `<div class="drawer__empty"><p class="drawer__empty-h">Įsimintų gaminių dar nėra</p>
        <p>Paspauskite širdelę prie gaminio skiltyje „Ką gaminame“, jei norite prie jo grįžti vėliau. Įsiminti gaminiai saugomi tik šioje naršyklėje.</p></div>`;
      foot.innerHTML = `<a href="${formHere() ? "#gaminiai" : "./#gaminiai"}" class="btn btn--block" data-close-drawer>Peržiūrėti gaminius</a>`;
      return;
    }
    body.innerHTML = `<ul class="bitems">` + favs.map((id) => {
      const cat = CAT.byId(id);
      const inB = AB_BASKET.has(id);
      return `<li class="bitem"><div class="bitem__head">
          <img src="${cat.image}" alt="" width="64" height="64" loading="lazy" decoding="async">
          <div class="bitem__t"><h3>${esc(cat.title)}</h3><p class="bitem__sum">${esc(cat.summary)}</p></div>
          <button type="button" class="bitem__rm" data-unfav="${id}" aria-label="Pašalinti iš įsimintų: ${esc(cat.title)}"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
        </div>
        <div class="bitem__acts">${inB
          ? `<button type="button" class="addq is-in" data-goto-basket aria-label="${esc(cat.title)} jau užklausoje. Peržiūrėti užklausą"><svg aria-hidden="true"><use href="#i-check"/></svg><span>Užklausoje</span></button>`
          : `<button type="button" class="addq" data-fav-add="${id}"><svg aria-hidden="true"><use href="#i-plus"/></svg><span>Į užklausą</span></button>`}</div></li>`;
    }).join("") + `</ul>`;
    foot.innerHTML = basket.items.length ? `<button type="button" class="btn btn--line btn--block" data-goto-basket>Peržiūrėti užklausą (${basket.items.length})</button>` : "";
  };
  const renderDrawer = () => {
    $("#drawerTitle").textContent = mode === "basket" ? "Mano užklausa" : "Įsiminti gaminiai";
    $$(".drawer__switch button", drawer).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    $('[data-n="basket"]', drawer).textContent = basket.items.length ? `(${basket.items.length})` : "";
    $('[data-n="favs"]', drawer).textContent = favs.length ? `(${favs.length})` : "";
    mode === "basket" ? renderBasket() : renderFavsList();
  };
  function openDrawer(m, focusId) {
    mode = m === "favs" ? "favs" : "basket";
    toast.hidden = true; /* pranešimas nebereikalingas, kai skydelis atidarytas */
    opener = document.activeElement;
    renderDrawer();
    if (typeof drawer.showModal === "function" && !drawer.open) drawer.showModal();
    const target = focusId && $(`.bitem[data-id="${focusId}"]`, drawer);
    if (target) { const d = $("details", target); d.open = true; $("summary", target).focus(); }
  }
  const closeDrawer = () => drawer.open && drawer.close();
  drawer.addEventListener("close", () => { opener && document.contains(opener) && opener.focus(); });
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) return closeDrawer(); /* paspaudimas šalia skydelio */
    const t = e.target;
    if (t.closest(".drawer__close")) return closeDrawer();
    const cl = t.closest("[data-close-drawer]");
    if (cl) {
      /* modalinis langas blokuoja slinkimą: uždarome ir slenkame patys */
      const href = cl.getAttribute("href") || "";
      const target = href.startsWith("#") && document.getElementById(href.slice(1));
      closeDrawer();
      if (target) {
        e.preventDefault();
        history.pushState(null, "", href);
        target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
      }
      return;
    }
    const sw = t.closest(".drawer__switch button");
    if (sw) { mode = sw.dataset.mode; renderDrawer(); return; }
    const rm = t.closest("[data-rm]");
    if (rm) {
      const items = $$(".bitem", drawer); const idx = items.findIndex((x) => x.contains(rm));
      AB_BASKET.remove(rm.dataset.rm); renderDrawer();
      const next = $$(".bitem__rm", drawer)[Math.min(idx, $$(".bitem__rm", drawer).length - 1)];
      (next || $(".drawer__close", drawer)).focus();
      return;
    }
    const uf = t.closest("[data-unfav]");
    if (uf) { AB_FAVS.toggle(uf.dataset.unfav); renderDrawer(); ($(".bitem__rm", drawer) || $(".drawer__close", drawer)).focus(); return; }
    const fa = t.closest("[data-fav-add]");
    if (fa) { AB_BASKET.add(fa.dataset.favAdd); renderDrawer(); const b = $(`[data-goto-basket]`, drawer); b && b.focus(); return; }
    if (t.closest("[data-goto-basket]")) { mode = "basket"; renderDrawer(); $(".drawer__close", drawer).focus(); return; }
    if (t.closest("[data-clear-basket]")) {
      if (window.confirm("Išvalyti visą užklausos krepšelį?")) { AB_BASKET.clear(); renderDrawer(); $(".drawer__close", drawer).focus(); }
      return;
    }
    if (t.closest("[data-submit-basket]")) {
      closeDrawer();
      if (formHere() && AB.route) { AB_BASKET.setIncluded(true); AB.route("#u-krepselis"); }
      else location.href = "./#u-krepselis";
    }
  });
  /* patikslinimų laukai: įrašoma iškart, santrauka atnaujinama be viso sąrašo perpiešimo (fokusas lieka) */
  const onEdit = (e) => {
    const el = e.target;
    const li = el.closest(".bitem[data-id]");
    if (!li || !el.dataset.k) return;
    const id = li.dataset.id;
    let value;
    if (el.dataset.k === "details") value = $$('input[data-k="details"]:checked', li).map((c) => c.value);
    else value = el.value;
    AB_BASKET.update(id, { [el.dataset.k]: value });
    const it = basket.items.find((x) => x.id === id);
    const cat = CAT.byId(id);
    $(".bitem__sum", li).textContent = itemText(it).replace(cat.title, "").replace(/^ – /, "") || "Dar nepatikslinta";
  };
  drawer.addEventListener("input", onEdit);
  drawer.addEventListener("change", onEdit);

  /* ---------- Paieška tarp gaminių ---------- */
  const plist = $("#plist");
  if (plist && rows.length) {
    const norm = (s) => s.toLocaleLowerCase("lt").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
    const index = rows.map((row) => {
      const cat = CAT.byId(row.dataset.id);
      return { row, cat, text: norm([cat.title, cat.summary, ...cat.subtypes.map((s) => s[1])].join(" ")) };
    });
    const box = document.createElement("div");
    box.className = "psearch";
    box.setAttribute("role", "search");
    box.innerHTML = `<label class="sr-only" for="psearch">Ieškoti tarp gaminių</label>
      <svg aria-hidden="true" class="psearch__i"><use href="#i-search"/></svg>
      <input id="psearch" type="search" autocomplete="off" placeholder="Ieškoti, pvz. komoda" aria-describedby="psearchStatus">
      <button type="button" class="psearch__clear" aria-label="Išvalyti paiešką" hidden><svg aria-hidden="true"><use href="#i-close"/></svg></button>`;
    const status = document.createElement("p");
    status.className = "psearch__status";
    status.id = "psearchStatus";
    status.setAttribute("aria-live", "polite");
    const empty = document.createElement("li");
    empty.className = "psearch__empty";
    empty.hidden = true;
    /* paieška ir sąrašas apgaubiami vienu bloku, kad kompiuterio tinklelyje liktų vienoje kolonoje */
    const col = document.createElement("div");
    col.className = "products__col";
    plist.parentNode.insertBefore(col, plist);
    col.append(box, status, plist);
    plist.appendChild(empty);
    const input = $("input", box), clear = $(".psearch__clear", box);
    const run = () => {
      const q = norm(input.value);
      clear.hidden = !q;
      if (!q) {
        index.forEach((x) => (x.row.hidden = false));
        empty.hidden = true; status.textContent = "";
        return;
      }
      const words = q.split(" ");
      const hits = index.filter((x) => words.every((w) => x.text.includes(w)));
      index.forEach((x) => (x.row.hidden = !hits.includes(x)));
      if (hits.length) {
        empty.hidden = true;
        status.textContent = `Rasta: ${hits.length} ${plural(hits.length, "kategorija", "kategorijos", "kategorijų")}`;
        hits[0].row.dispatchEvent(new Event("mouseenter")); /* kompiuteryje parodoma pirmo rezultato nuotrauka */
      } else {
        status.textContent = "Nieko neradome";
        empty.hidden = false;
        empty.innerHTML = `<p>Pagal „${esc(input.value.trim())}“ tarp mūsų gaminių kategorijų nieko neradome.</p><p>Gaminame ir kitokius baldus pagal užsakymą. <a href="#u-kita" class="link">Aprašykite, ko ieškote</a></p>`;
      }
    };
    input.addEventListener("input", run);
    input.addEventListener("keydown", (e) => { if (e.key === "Escape" && input.value) { e.preventDefault(); input.value = ""; run(); } });
    clear.addEventListener("click", () => { input.value = ""; run(); input.focus(); });
  }

  /* ---------- Pradinis atvaizdavimas ---------- */
  onChange((o) => { renderTools(); renderRows(); if (drawer.open && !o.quiet) renderDrawer(); });
  renderTools();
  renderRows();
  if (dropped > 0) {
    /* išsaugoti duomenys pataisyti (pvz., gaminys pašalintas iš svetainės) */
    saveBasket(true); saveFavs();
    setTimeout(() => announce("Kai kurių anksčiau pasirinktų gaminių nebėra, todėl jie pašalinti."), 600);
  }
})();
