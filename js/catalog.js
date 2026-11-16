/* =========================================================
   Ąžuolo baldai – bendri gaminių duomenys
   ---------------------------------------------------------
   Vienas šaltinis paieškai, mėgstamiems, užklausos krepšeliui
   ir užklausos formai. ID (pvz. „virtuve“) yra pastovūs: jie
   saugomi lankytojo naršyklėje, todėl jų nekeiskite.

   Tikrų atliktų darbų svetainėje dar nėra, todėl čia yra
   gaminių kategorijos ir jų tipai, o ne projektai.

   price – orientacinė kaina. Rodoma TIK kai verified: true.
   Pvz.: price: { from: 1200, unit: "vnt.", verified: true }
   Kol kaina nepatvirtinta, palikite null.

   Tipų sąrašas sutampa su api/uzklausa.php ($detailLabels):
   pridėjus naują tipą, įrašykite jį ir ten.
   ========================================================= */
window.AB_CATALOG = {
  version: 1,
  categories: [
    {
      id: "virtuve", title: "Virtuvės", formType: "virtuve",
      summary: "Fasadai, stalviršiai ir salos, suplanuoti pagal technikos, langų ir sienų matmenis.",
      image: "img/photo-1588854337236-6889d631faa8-800.jpg",
      subtypes: [["visa", "Visa virtuvė"], ["fasadai", "Tik fasadai"], ["stalvirsis", "Stalviršis"], ["sala", "Virtuvės sala"]],
      price: null,
    },
    {
      id: "spinta", title: "Spintos ir drabužinės", formType: "spinta",
      summary: "Įmontuotos spintos iki lubų, nišose ir palėpėse, kur standartinės netelpa.",
      image: "img/photo-1595428774223-ef52624120d2-800.jpg",
      subtypes: [["imontuota", "Įmontuota spinta"], ["stumdoma", "Spinta su stumdomomis durimis"], ["drabuzine", "Drabužinė"], ["prieskambaris", "Prieškambario baldai"]],
      price: null,
    },
    {
      id: "stalai", title: "Stalai ir kėdės", formType: "stalai",
      summary: "Valgomojo, darbo ir kavos stalai pagal reikiamą ilgį ir sėdimų vietų skaičių.",
      image: "img/photo-1615066390971-03e4e1c36ddf-800.jpg",
      subtypes: [["valgomojo", "Valgomojo stalas"], ["istraukiamas", "Ištraukiamas stalas"], ["kavos", "Kavos staliukas"], ["rasomasis", "Rašomasis stalas"], ["kedes", "Kėdės"], ["suoliukas", "Suoliukas"]],
      price: null,
    },
    {
      id: "miegamasis", title: "Miegamojo baldai", formType: "miegamasis",
      summary: "Lovos, komodos ir naktinės spintelės, suprojektuotos kaip vienas komplektas.",
      image: "img/photo-1505693416388-ac5ce068fe85-800.jpg",
      subtypes: [["lova", "Lova"], ["lova-deze", "Lova su patalynės dėže"], ["naktine", "Naktinė spintelė"], ["komoda", "Komoda"]],
      price: null,
    },
    {
      id: "svetaine", title: "Svetainės baldai", formType: "svetaine",
      summary: "Lentynos, knygų sienos, TV baldai ir kavos staliukai.",
      image: "img/photo-1586023492125-27b2c045efd7-800.jpg",
      subtypes: [["lentynos", "Lentynos ar knygų siena"], ["tv", "TV baldas"], ["staliukas", "Kavos staliukas"], ["indauja", "Komoda ar indauja"]],
      price: null,
    },
    {
      id: "restauravimas", title: "Restauravimas", formType: "restauravimas",
      summary: "Senų medinių baldų atnaujinimas: remontas, šlifavimas ir nauja apdaila.",
      image: "img/photo-1503602642458-232111445657-800.jpg",
      subtypes: [["stalas", "Stalas"], ["kedes", "Kėdės"], ["spinta", "Spinta ar komoda"], ["kita", "Kitas baldas"]],
      price: null,
    },
  ],
  /* medienos rūšys ir apdaila – tie patys, kurie aprašyti skiltyje „Mediena ir apdaila“ */
  woods: [["azuolas", "Ąžuolas"], ["uosis", "Uosis"], ["riesutmedis", "Riešutmedis"], ["berzas", "Beržas"]],
  finishes: [["alyva", "Alyva"], ["lakas", "Lakas"]],
};
window.AB_CATALOG.byId = (id) => window.AB_CATALOG.categories.find((c) => c.id === id) || null;
