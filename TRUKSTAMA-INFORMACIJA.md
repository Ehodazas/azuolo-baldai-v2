# Ko trūksta, kad svetainė atitiktų tikrą verslą

Šioje versijoje sąmoningai **nėra** išgalvotų faktų. Žemiau išvardyta, ką reikia gauti iš įmonės.
Kai informacija bus, ją galima įrašyti į svetainę.

## Būtina prieš skelbiant

| Kas | Kur bus naudojama | Dabar |
|---|---|---|
| Tikras telefonas, el. paštas, adresas | Antraštė, pradžia, kontaktai, poraštė, `index.html` struktūriniai duomenys (JSON-LD) | Pavyzdiniai: +370 600 00000, info@azuolobaldai.lt, Pramonės pr. 00, Kaunas |
| Tikras darbo laikas | Pradžia, kontaktai, vizito laikai formoje ir `api/uzklausa.php` | Pavyzdinis: I–V 8:00–17:00 |
| Įmonės rekvizitai (pavadinimas, kodas, buveinė) | `privatumas.html` | Geltonai pažymėti laukai |
| Talpinimo paslauga su PHP ir gavėjo el. paštas | Formos siuntimas (žr. INTEGRACIJA.md) | Forma rodo, kad siuntimas neprijungtas |
| Tikras adresas žemėlapiui | `index.html`, `data-src` ir „Atidaryti Google Maps“ nuoroda | Rodo tik „Kaunas“ |

## Labai sustiprintų svetainę

1. **Savų darbų nuotraukos.** Dabar visos nuotraukos yra iliustracinės (Unsplash) ir taip pažymėtos.
   Turint 6–8 tikrus darbus su trumpu aprašu (kas, kur, kokia mediena ir apdaila), galima vietoje
   skilties „Idėjoms ir pokalbiui apie stilių“ įdėti tikrų darbų skiltį.
2. **Dirbtuvės ir žmonių nuotraukos.** Pavyzdžiui, meistras prie darbo, lentų sandėlis, apdailos pavyzdžiai.
3. **Kas jūs esate:** kiek metų dirbate, kiek žmonių dirba, kas atvažiuoja matuoti. Svetainėje apie tai
   nerašyta, kol nėra tikrų duomenų.
4. **Kokias medžiagas tikrai naudojate.** Ar tik masyvą, ar ir faneruotas, dažytas MDF plokštes? Kokias
   medienos rūšis siūlote? Skiltis „Mediena ir apdaila“ dabar aprašo bendras medienos savybes, bet nežada,
   kad visos rūšys siūlomos.
5. **Darbo sąlygos:** ar matavimas mokamas, ar yra avansas, kokie įprasti terminai, kur važiuojate
   (Kaunas, Vilnius, visa Lietuva), kokia garantija. Kol tai nepatvirtinta, svetainėje šių pažadų nėra.
6. **Tikri klientų atsiliepimai** su leidimu juos skelbti arba nuoroda į „Google“ atsiliepimus.
7. **Socialinių tinklų paskyros**, jei jos yra.

## Kas pašalinta iš 1 versijos ir kodėl

| Pašalinta | Priežastis |
|---|---|
| Kainoraštis ir stalo skaičiuoklė | Kainos buvo išgalvotos |
| Krepšelis | Svetainė nieko neparduoda, krepšelis apsimetė parduotuve |
| Paskyros langas | Neturi serverio ir nieko nedaro |
| Atsiliepimai, įvertinimas 4,9/5, „180+ atsiliepimų“ | Išgalvoti |
| „Nuo 2009 m.“, „1240 gaminių“, „98 %“ | Išgalvoti faktai |
| 10 metų garantija, sertifikuoti miškai, nemokamas pristatymas, 40 % avansas | Nepatvirtinti pažadai |
| Tiekėjų pavadinimai (Blum, Hettich ir kt.) | Nepatvirtinta, kad jie naudojami |
| Projektų puslapiai ir filtrai | Projektai buvo iliustracinės nuotraukos, ne tikri darbai |
| Mėgstami, palyginimas, paieška | Mažai naudos vieno puslapio svetainėje |
| Slapukų juosta | Svetainė savo slapukų neturi, žemėlapis įkeliamas tik paspaudus |
| GSAP biblioteka | Nebereikalinga, judesys padarytas CSS priemonėmis |
