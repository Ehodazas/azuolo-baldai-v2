/* =========================================================
   Svetainės nustatymai (naršyklės pusė)
   ---------------------------------------------------------
   formEndpoint — adresas, kuriuo forma siunčia užklausas.
   Įkėlus svetainę į PHP palaikantį serverį, įrašykite:
       formEndpoint: "api/uzklausa.php"
   Kol reikšmė tuščia, forma nieko nesiunčia, rodo aiškią
   klaidą, o įvesti duomenys lieka formoje.

   Čia NEDĖKITE slaptų raktų ar slaptažodžių: šis failas
   matomas kiekvienam lankytojui. Gavėjo el. paštas laikomas
   serverio aplinkos kintamuosiuose (žr. INTEGRACIJA.md).
   ========================================================= */
/* social – tikri įmonės profilių adresai. Kol tušti, ikonos nerodomos.
   Pvz.: facebook: "https://www.facebook.com/jusu-puslapis" */
window.AB_CONFIG = {
  formEndpoint: "",
  social: { facebook: "", instagram: "" },
  maxFileSizeMB: 10,
  maxFiles: 5,
  maxTotalMB: 20
};
