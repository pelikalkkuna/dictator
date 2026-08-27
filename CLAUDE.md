# Dictator — Ritimban Republic

## Nykyinen tila

Päivitetty: elokuu 2026

- **Infrastruktuuri:** Git-repo pystytetty, GitHub-yhteys toimii, push/pull toimii
- **GDD:** `docs/GDD.md` luotu suoraan `docs/Dictator_GDD_V11.docx`:stä — toimii projektin ykköslähteenä
- **Materiaali:** `materiaali/`-kansiossa mainoskuva ja voittomarssi (myöhempää web-mainontaa varten)
- **Pelikoodi:** kohdat 1–3 valmiit — runko, kassajärjestelmä (kassaraportti, kuukausikulut 45k/kk, kassakriisi-tila) ja ryhmät/mittarit (8 ryhmää GDD 2.2:n aloitusarvoin, mittarien 0–9 rajaus) toimivat selaimessa. "Seuraava kuukausi" -nappi testauksen ajaksi, korvataan varsinaisella kuukausikierroksella myöhemmässä vaiheessa.
- **Testaus:** `node --test testit/*.test.js` (tai `npm test`) — 7 testiä kattaa kassaraportin laskennan ja mittarien rajauksen, kaikki vihreää
- **Seuraava askel:** kohta 4 toteutusjärjestyksestä — audienssijärjestelmä (D3, kortit, hyväksy/hylkää)

## Projektin kuvaus

Vuoropohjainen selviytymisstrategia, jossa pelaaja on 1960–70-lukujen latinalaisamerikkalaisen Ritimban tasavallan diktaattori. Pohjautuu Don Priestleyn ja Andy Frenchin peliin (DKTronics, 1983 — Commodore 64 / ZX Spectrum). Tämä on selainpohjainen moderni remake.

**Ydinfilosofia:** Diktatuuri päättyy aina huonosti. Kysymys ei ole voitatko, vaan kuinka pitkään selviät.

Peli on reverse-engineeröity pelaamalla alkuperäistä C64-versiota ja sääntöjä on mietitty ja tasapainotettu GDD:ssä. Aiempaa koodia ei ole olemassa — tämä on ensimmäinen toteutus.

## Tekninen stack

- **Kieli:** vanilla HTML / CSS / JavaScript — ei frameworkeja
- **Pelin tila:** puhdas JavaScript-objekti (`pelitila.js`)
- **Korttidata:** JSON-rakenteessa
- **Pysyvä tallennus:** localStorage (vain highscoret)
- **Alustat:** selain mobiilissa ja työpöydällä
- **Hosting:** GitHub Pages / Netlify / Cloudflare Pages
- **Versionhallinta:** Git + GitHub (linkattu projektikansioon)

## Kansio- ja tiedostorakenne

```
dictator/
├── index.html              (minimaalinen runko)
├── css/
│   └── tyyli.css
├── js/
│   ├── pelitila.js         (pelin tila: ryhmät, kassa, kuukausi)
│   ├── data/
│   │   ├── audienssit.js   (42 audienssikorttia)
│   │   ├── paatokset.js    (19 presidentin päätöstä)
│   │   └── uutiset.js      (48 uutiskorttia)
│   ├── moottori/
│   │   ├── kuukausikierros.js  (vaiheet 1–8)
│   │   ├── sota.js             (sota, kriisit, puolustusvalinta)
│   │   ├── talous.js           (kassa, Sveitsin tili, suurvalta-apu)
│   │   └── uhat.js             (attentaatti, uhkaindikaattorit)
│   ├── nakyma/
│   │   └── piirto.js           (näkymän piirto — yksinkertainen alkuun)
│   └── paa.js              (käynnistys, sitoo kaiken yhteen)
└── docs/
    ├── Dictator_GDD_V11.docx   (alkuperäinen, Sasu muokkaa)
    └── GDD.md                  (minun nopealukuinen kopio, Claude ylläpitää)
```

Huom: tiedostonimet suomeksi, ääkköset korvattu (`paatokset` eikä `päätökset`, `nakyma` eikä `näkymä`).

## GDD — pelin sääntöjen lähde

**GDD (Game Design Document) on tämän projektin ehdottomasti tärkein dokumentti.** Se on täynnä numeerisia sääntöjä, taulukoita ja tasapainotuksia joita ei saa tulkita vapaasti.

- Alkuperäinen: `docs/Dictator_GDD_V11.docx` — Sasu muokkaa Wordilla / Google Docsilla
- Markdown-kopio: `docs/GDD.md` — Claudella nopea luettavuus, sama sisältö eri muodossa

**Työnkulku GDD:n päivittämisessä:**
1. Sasu päivittää docx-version (esim. V11 → V12)
2. Sasu kertoo Claudelle että GDD on päivitetty
3. Claude luo uuden markdown-version docx:stä
4. Claude tekee committin "GDD päivitetty V12:een"

**Sääntöjen käsittelyn periaate:** Jos GDD sanoo että suosio laskee 3:lla, se laskee tasan 3:lla. Ei 2, ei 4. Numerot ovat tasapainosimuloitu. Jos säännössä on epäselvyyttä, kysy Sasulta — älä tulkitse itse.

## UI-periaatteet (GDD 1.5)

- Vaihe vaiheelta -navigointi: pelaaja etenee aina eteenpäin
- Jokainen kuukausivaihe on oma näyttönsä
- Swipe-mekaniikka audiensseissa: oikealle = kyllä, vasemmalle = ei
- Värikoodaus:
  - **Vihreä** = kassaraportti
  - **Sininen** = poliisiraportti
  - **Kultainen** = audienssi / presidentin päätös
  - **Punainen** = kriisi
- Kaikki pelaajan näkemät tekstit suomeksi

## Toteutusjärjestys

Rakennetaan kerros kerrokselta, ei pystysuuntaisina viipaleina. Jokainen vaihe käsittää yhden toimivan kokonaisuuden jonka jälkeen testataan selaimessa ja tehdään committi.

Suunniteltu järjestys (voi elää matkan varrella):

1. Minimaalinen runko: `index.html`, tyhjä pelitila-objekti, yksi näyttö
2. Kassajärjestelmä: kassaraportti, kuukausikulut, kassan kuivuminen
3. Ryhmät ja mittarit: suosio / voima / uhkaindikaattorit
4. Audienssijärjestelmä (D3, kortit, hyväksy/hylkää)
5. Presidentin päätökset
6. Uutisvaihe (48 korttia)
7. Sota ja N1-eskalaatiokierre
8. Vallankumous / kaappaus / kapina + puolustusvalinta
9. Attentaatti
10. Sveitsin tili, pakohelikopteri, pisteytys
11. UI-kiillotus ja mobiilioptimointi

Tämä järjestys ei ole lukittu — muutetaan jos matkan varrella näyttää järkevältä.

## Testaus

Pelissä on valtavasti numeerisia sääntöjä joita on helppo rikkoa vahingossa. Automaattitestit vahtivat näitä sääntöjä.

**Testauksen taso:** Testataan **kriittiset numeeriset säännöt**, ei UI-yksityiskohtia.

Esimerkkejä testattavista asioista:
- Audienssikorttien suosio- ja voimavaikutukset toteutuvat oikein
- Kassan laskenta kulujen ja tulojen jälkeen on oikein
- Suurvalta-avun summataulukko palauttaa oikeat arvat suosioeroista
- N1-eskalaatiokierteen todennäköisyydet ja velkavaihe toimivat
- Mittarit rajautuvat 0–9 (yli menevät bonukset eivät kerry)

Ei testata: värit, animaatiot, napinpainallukset, layout.

Testausratkaisu valitaan ensimmäisessä vaiheessa. Alkuun käytetään yksinkertaista Node.js-pohjaista ratkaisua ilman isoja kirjastoja.

Sasu testaa itse pelattavuutta selaimessa jokaisen valmiin osan jälkeen.

## Commit-rytmi

- Committi aina kun looginen kokonaisuus toimii
- Viestit suomeksi, lyhyt ja kuvaava: "lisätty kassaraportti", "audienssijärjestelmä toimii", "korjattu N1-eskalaation todennäköisyys"
- Ei committia keskeneräisestä työstä ellei Sasu erikseen pyydä

## Tärkeät termit pelistä

(Näitä termejä käytetään koodissa ja keskustelussa. Suomenkielisiä vastineita voi käyttää koodimuuttujissa.)

- **Ryhmä** = pelin osapuoli (armeija, talonpojat, maanomistajat, sissit, Leftoto, salainen poliisi, Venäjä, USA)
- **Suosio** = ryhmän mielipide pelaajasta (0–9)
- **Voima** = ryhmän sotilaallinen/poliittinen painoarvo (0–9)
- **Audienssi** = ryhmän tapaaminen jossa esitetään vaatimus
- **Presidentin päätös** = pelaajan oma-aloitteinen toiminto
- **Uutisvaihe** = pakollinen kortin nosto uutispakasta
- **N1–N48** = uutiskorttien numerointi
- **A1–A15, P1–P13, M1–M14** = audienssikorttien numerointi
- **D1–D19** = presidentin päätöskorttien numerointi
- **Kassakriisi** = tilanne kun kassa tyhjä, rahalliset toiminnot lukkiutuvat
- **Puolustusvalinta** = kaappauksen / kapinan aikainen ryhmien asettelu
- **Swiss** = Sveitsin pankkitili pakoa varten
- **Leftoto** = naapurimaa, Neuvostoliiton liittolainen

## Mitä EI tehdä

- Ei muuteta GDD:n numeroita itse — ne ovat tasapainosimuloitu
- Ei lisätä pelimekaniikoita joita ei ole GDD:ssä
- Ei asenneta frameworkeja (React, Vue, Angular) — vanilla JS on tietoinen valinta
- Ei käytetä ääkkösiä tiedostonimissä tai HTML id:issä
- Ei committia jos koodi ei toimi selaimessa

## Muistiinpanot sessioiden välillä

(Tähän osioon Claude kirjaa asioita joita sessioiden välillä on hyvä muistaa — esim. keskeneräiset ongelmat, tehdyt arkkitehtuurivalinnat joita GDD ei määrää, todetut bugit joita ei ole vielä korjattu.)

- (tyhjä — täytetään matkan varrella)
