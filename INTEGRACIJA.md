# Užklausų siuntimo prijungimas

Užklausos forma paruošta siųsti duomenis serveriui. Kol siuntimas neprijungtas, forma **nieko nesiunčia**,
rodo aiškią klaidą ir palieka įvestus duomenis.

| Dalis | Failas | Ką daro |
|---|---|---|
| Naršyklės pusė | `js/forms.js` | Tikrina laukus, el. paštą, telefoną, vizito datą, failų tipą (JPG, PNG, PDF) ir dydį (iki 10 MB kiekvienas, iki 5 failų, iš viso iki 20 MB). Sėkmę rodo tik po teigiamo serverio atsakymo. |
| Nustatymai | `config.js` | `formEndpoint` – adresas, kuriuo siunčiamos užklausos. Dabar tuščias. |
| Serverio pusė | `api/uzklausa.php` | Dar kartą tikrina laukus ir failus (tikrą failo tipą pagal turinį), saugo nuo brukalo, siunčia laišką su priedais. |
| Įkėlimo ribos | `api/.user.ini` | Padidina PHP failų įkėlimo ribas (jei talpinimo paslauga leidžia). |

Brukalo apsauga: paslėptas laukas robotams, minimalus formos pildymo laikas (3 s), ne daugiau kaip 5 užklausos per 10 min. iš vieno IP adreso.

## Kaip prijungti

1. Pasirinkite talpinimo paslaugą su PHP 7.4 ar naujesne ir veikiančia `mail()` funkcija. GitHub Pages PHP nevykdo.
2. Talpinimo valdymo skydelyje nustatykite aplinkos kintamuosius (arba `.htaccess` faile su `SetEnv`, jei serveris Apache):

   ```
   AB_MAIL_TO=jusu@pastas.lt
   AB_MAIL_FROM=svetaine@jusu-domenas.lt
   AB_ALLOWED_ORIGIN=https://jusu-domenas.lt
   ```

   Šių reikšmių **nerašykite** į `config.js` ar kitus viešus failus.
3. `config.js` faile įrašykite `formEndpoint: "api/uzklausa.php"`.
4. Išbandykite formą siųsdami laišką **į savo** adresą: ar laiškas atėjo, ar matosi priedai, ar nepateko į brukalą.

Jei paslauga `mail()` neleidžia, `api/uzklausa.php` reikės pakeisti siuntimu per SMTP (pvz., PHPMailer),
o SMTP duomenis laikyti tik aplinkos kintamuosiuose.

## Persikeliant į savo domeną

Pakeiskite `https://ehodazas.github.io/azuolo-baldai-v2/` adresą `index.html` (`canonical`, `og:image`), `sitemap.xml` ir `robots.txt`.

## Nuotraukos

Kiekviena `img/photo-*.jpg` nuotrauka (1600 px) turi lengvesnę kopiją `*-800.jpg`, kurią naršyklė telefone parenka automatiškai.
Pridėdami naują nuotrauką, sukurkite ir 800 px pločio kopiją su `-800` gale.

## Vietinė peržiūra

`powershell -ExecutionPolicy Bypass -File .claude/serve.ps1 -Root . -Port 5501` ir atidarykite http://localhost:5501.
Šis serveris PHP nevykdo, todėl forma kompiuteryje visada rodys, kad siuntimas neprijungtas.

## Užklausos krepšelis ir įsiminti gaminiai

- Duomenys: `js/catalog.js` (6 gaminių kategorijos su pastoviais ID ir tipais). Iš čia imama paieška, įsiminti gaminiai, krepšelis ir formos tipai.
  Serveryje tipų sąrašas pakartotas `api/uzklausa.php` (`$detailLabels`), nes serveris priima tik žinomas reikšmes – pridėjus tipą, įrašykite jį abiejose vietose.
- Logika: `js/inquiry.js`. Krepšelis saugomas naršyklėje (`localStorage`, raktas `ab2-inquiry`, versija 1), įsiminti – `ab2-favorites`.
  Sugadinti ar nebeegzistuojantys įrašai išmetami įkeliant.
- Krepšelis nėra pirkimas. Jis siunčiamas su užklausos forma lauku `cart` (tekstu), laiške rodomas bloku „Užklausos krepšelis“.
  Krepšelis išvalomas tik gavus patvirtintą serverio atsakymą `{"ok": true}`.

## Orientacinės kainos

Svetainėje kainų nėra, nes jos nepatvirtintos (V1 kainos buvo pavyzdinės). Kai įmonė patvirtins kainas, įrašykite jas `js/catalog.js`, pvz.:

```js
price: { from: 1200, unit: "vnt.", verified: true },
```

Kaina rodoma tik kai `verified: true`. Formulės skaičiuoklei nėra, todėl skaičiuoklės nedarykite, kol jos nepatvirtins įmonė.

## Socialiniai tinklai

`config.js` faile įrašykite tikrus adresus:

```js
social: { facebook: "https://www.facebook.com/...", instagram: "https://www.instagram.com/..." },
```

Ikonos poraštėje atsiras tik su galiojančiu `https://` adresu atitinkamame domene. Tušti laukai – jokių ikonų.
