# Dictator — Ritimban Republic

## Nykyinen tila

Päivitetty: elokuu 2026

- **Infrastruktuuri:** Git-repo pystytetty, GitHub-yhteys toimii, push/pull toimii
- **GDD:** `docs/GDD.md` luotu suoraan `docs/Dictator_GDD_V11.docx`:stä — toimii projektin ykköslähteenä
- **Materiaali:** `materiaali/`-kansiossa mainoskuva ja voittomarssi (myöhempää web-mainontaa varten)
- **Pelikoodi:** kohdat 1–11 valmiit — KOKO toteutusjärjestys on nyt käyty läpi. Runko, kassajärjestelmä, ryhmät/mittarit, audienssijärjestelmä (42 korttia), presidentin päätökset (19 korttia), uutisvaihe (48 korttia), sota, vallankumous/kaappaus/kapina, attentaatti, pako ja pisteytys sekä UI-kiillotus (GDD 1.5: swipe-audienssit oikealle/vasemmalle Pointer Eventeillä hiirelle ja kosketukselle, kosketusystävälliset 44px-napit, pieni mobiiliviewport-optimointi) toimivat selaimessa. "Seuraava kuukausi" -nappi ajaa yksinkertaistetun kuukausikierron edelleen — GDD 4. luvun täysi 8-vaiheinen kierros (poliisiraportti, useat kassaraportit) on jäljellä oleva rakennelaajennus, ei uusi mekaniikka.
- **Testaus:** `node --test testit/*.test.js` (tai `npm test`) — 95 testiä kattaa kassaraportin, mittarien rajauksen, audienssit, presidentin päätökset, uutisvaiheen, sodan, kriisit, attentaatin, paon ja pisteytyksen, kaikki vihreää. Swipe-eleet testattu selaimessa (hiiri, aito kosketus, snap-back) mutta ei Node-testeissä (UI-vuorovaikutusta, ei sääntölogiikkaa).
- **Seuraava askel:** ei enää yksittäistä "seuraavaa kohtaa" — toteutusjärjestys on käyty läpi. Jäljellä: `docs/GDD.md`:ssä listatut avoimet KYSYTTÄVÄ SASULTA -kohdat alla, poliisiraportti + täysi 8-vaiheinen kuukausikierros, sekä Sasun oma pelitestaus selaimessa nyt kun kaikki mekaniikat ovat koossa.

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

- **RATKAISTU (Sasu, elokuu 2026) — A3:n "−1/−2":** Alkuperäistä C64-peliä ei ollut lähdeaineistona, vain emulaattoripelaamiseen perustuva tulkinta, joten tarkkaa arvoa ei koskaan saatu selville testipeleistä. Päätetty: arvotaan −1 tai −2 tasaisesti jokaisella käyttökerralla. Toteutettu geneerisenä `{ min, max }`-mekanismina (`js/moottori/audienssit.js`:n `sovellaMittarimuutokset`/`satunnaisKokonaisluku`), uudelleenkäytettävissä muille korteille jos vastaavia epäselviä välejä löytyy myöhemmin.
- **Arkkitehtuurivalinta — talousmerkintöjen etumerkki:** GDD:n "X/kk"-merkinnät (esim. audienssien Talous-sarake) tulkitaan suoraan kuukausikulut-muuttujan muutokseksi ilman etumerkin kääntöä — sama konventio kuin GDD:n omassa D9/D10-esimerkissä (osio 13): "kulut −8k/kk" ja "kulut +6k/kk" ovat suoria lukuja. Eli "+5k/kk" audienssikortilla TARKOITTAA kulut nousevat 5000 (ei säästöä), vaikka narratiivisesti joskus tuntuisi päinvastaiselta (esim. M9 banaaniviljelmät). Ei tulkittu kortti kerrallaan uudelleen.
- **Väliaikainen ratkaisu:** "Seuraava kuukausi" -nappi ajaa kassaraportin, audienssin, presidentin päätöksen ja uutisvaiheen yksinkertaistetussa järjestyksessä (ei GDD 4. luvun täyttä 8-vaiheista kuukausikierrosta, esim. poliisiraportti ja kassaraportin toistot audienssin/päätöksen jälkeen puuttuvat). Korvataan `js/moottori/kuukausikierros.js`:llä myöhemmin.
- **RATKAISTU (Sasu, elokuu 2026) — N4:** "Armeijan voima romahtaa" = puolitetaan (pyöristys alas), mutta ei koskaan alle 1:n. Toteutettu `js/moottori/uutiset.js`:n `N4_ARMEIJA_PUOLITA`-haarassa.
- **RATKAISTU (Sasu, elokuu 2026) — N5:** "Kassatulot laskevat" = maanomistajien suosio puolitetaan (pyöristys alas) ja kuukausikulut nousevat pysyvästi 5000:lla (simuloi menetettyä verotuloa). Toteutettu `js/moottori/uutiset.js`:n `N5_BANAANIT`-haarassa.
- **KYSYTTÄVÄ SASULTA — N12:n "(til.)"-merkintä:** Uutiskortti N12 ("Rankkasateet viivästyttävät kahvisatoa") talous on "−5k/kk (til.)" — "til." viittaa ilmeisesti tilapäisyyteen mutta kestoa ei ole määritelty. Toteutettu toistaiseksi pysyvänä kuukausikulutMuutoksena (+5000, ei koskaan poistu). Pitää selvittää kesto Sasulta jos tarkoitus on eri.
- **Kohta 7 (Sota) valmis:** A1:n *PIKASOTA ja P1/D16:n *ESKALAATIO laukaisevat nyt oikeasti sodan (`js/moottori/sota.js`). Uutiskortti N3 ("Leftoto hyökkää!") jää edelleen omaksi erikoinen-arvokseen (`N3_SOTA_TODO`, ei tee mitään) koska normaalilla satunnaisnostolla se ei GDD:n mukaan koskaan pitäisi laueta itsenäisesti — sota laukeaa aina joko A1:n kautta tai N1-eskalaatiokierteen kautta, ei suoralla N3-nostolla. Jos tämä oletus on väärä (esim. N3 voi laueta myös ihan tavallisella uutispakan nostolla ilman P1/D16:ta), pitää tarkistaa Sasulta ja kytkeä N3 kutsumaan `ratkaiseSota`-funktiota.
- **KYSYTTÄVÄ SASULTA — REV STR:n paluukäyrä:** GDD 8.4 sanoo "REV STR piikkaa Ritimban sotavoiman tasolle ja palautuu 3 kk:ssa" mutta ei anna kaavaa. Koodissa (`js/moottori/sota.js`, `kasitteleVallankumousvoimanPalautuminen`) toteutettu tasaisena lineaarisena paluuna kolmen kuukauden yli (esim. piikki 19 → kolme kk myöhemmin tasan 10).
- **KYSYTTÄVÄ SASULTA — vallankumousvoima (REV STR) on edelleen kytkemättä mihinkään:** Nyt kun kohta 8 (vallankumous/kaappaus/kapina) on rakennettu, `pelitila.vallankumousvoima` ei silti ohjaa siinä mitään — GDD 9. luvun tekstissä ei mainita "vallankumousvoima"/"REV STR" -termiä kertaakaan, joten kriisi.js laskee vihollisen voiman suoraan käynnistäjä+liittolainen(+sissit)-ryhmien todellisista voima-arvoista (ks. alla). GDD 12 kuitenkin mainitsee poliisiraportissa näytettävän "STRENGTH FOR REVOLUTION" omana lukunaan — eli tämä stat on ilmeisesti TARKOITETTU vallankumouksen vihollisvoimaksi (ainakin osittain), mutta osio 9 ei koskaan sano niin suoraan enkä halunnut arvata. Pitää kysyä Sasulta: pitäisikö `vallankumousvoima` korvata tai yhdistää kriisi.js:n `kaynnistaja.voima + liittolainen.voima (+ sissit.voima)` -laskennan kanssa?
- **Arkkitehtuurivalinta — GDD 9.2:n laukaisuehto muokattu yhdessä Sasun kanssa:** GDD 9.2:n kirjaimellinen kaava "suosio + voima ≥ 7" todettiin toimivan väärään suuntaan (ks. `js/moottori/kriisi.js`:n alun kommentti) — aloitusarvoilla jokainen ryhmä ylittäisi sen heti. Käytetään sen sijaan `voima − suosio ≥ 3` (kynnysarvo 3 on arvaus, ei simuloitu). GDD.md:n tekstiä ei ole muutettu, koodi ja tämä muistiinpano ovat toistaiseksi ainoa totuudenlähde tälle poikkeamalle kunnes Sasu päivittää docx:n.
- **KYSYTTÄVÄ SASULTA — GDD 9.6:n "~25% (D4, tulos 4)":** Tulkittu tilastolliseksi kuvaukseksi 9.5:n deterministisen voimavertailun lopputulemasta, ei erilliseksi nopanheitoksi. Jos taistelun pitäisi sisältää myös oma satunnaisuutensa voimavertailun päälle, `ratkaisePuolustus`-funktio pitää muuttaa.
- **Löydetty ja korjattu bugi:** kriisi-paneelin alavaiheiden (uhka/vaatimus/puolustus/rangaistus-napit) näkyvyys yritettiin ensin toteuttaa `element.style.display = ""`, mikä ei kumoa CSS-tiedoston `display:none`-sääntöä (vain tyhjentää inline-tyylin). Napit eivät siis oikeasti näkyneet vaikka ohjelmalliset testiklikkaukset toimivat. Korjattu käyttämään samaa `piilossa`-luokkamallia kuin muut paneelit. Muistutus: aina kun UI-elementille lisätään CSS-oletus `display:none`, näkyvyys pitää testata Playwrightin `page.click`/`isVisible`-metodeilla (jotka kunnioittavat todellista näkyvyyttä), ei `page.evaluate`-sisäisillä `.click()`-kutsuilla jotka ohittavat sen.
- **Kohta 9 (Attentaatti) valmis:** GDD 10:n suosio+voima≤3-kaava on suoraan käyttökelpoinen sellaisenaan (toisin kuin 9.2) — vahvistaa sinun kuvaamasi periaatteen: voimattomat (matala suosio JA voima) turvautuvat attentaattiin, voimakkaat-mutta-epäsuositut (osio 9) kaappaukseen/kapinaan/vallankumoukseen. A-ryhmät rajattu kotimaan tyyppisiin (armeija, talonpojat, maanomistajat, salainen poliisi) — sissit/Leftoto/suurvallat eivät voi laueta tätä kautta.
- **KYSYTTÄVÄ SASULTA — selviytymistaulukko yli 8:n henkivartijavoiman:** GDD 10 antaa vain kolme pistettä (4→50%, 6→75%, 8→90%), mutta D11 ("Vahvista henkivartijoita") on toistuva eli voima voi nousta yli 8:n (10, 12...). Koodissa (`js/moottori/attentaatti.js`) käytetty 90%:a myös kaiken yli 8:n voiman kohdalla, ei ekstrapoloitu uutta käyrää. Myöskään sitä, mitä epäonnistuneelle attentaattiyritykselle seuraa (vaikuttaako se yrittäjäryhmän suosioon/voimaan?), GDD ei mainitse — koodissa ei muuteta mitään, vain viesti näytetään.
- **Kohta 10 (Pako ja pisteytys) valmis:** "Pakene"-nappi lisätty puolustusvalinnan rinnalle (`js/moottori/pako.js`) — saatavilla kaikissa kriisityypeissä, vaikka GDD 11 mainitsee sen nimenomaisesti vain "ainoana järkevänä valintana" vallankumoukselle (kaappaus/kapina voi myös voittaa, mutta pako ei ole kiellettykään niissä). Pelin päättyessä (mistä tahansa syystä — sota, kriisi, attentaatti, pako) lasketaan ja näytetään pisteet (`js/moottori/pisteytys.js`) GDD 14:n mukaan; Swiss-bonus lasketaan vain jos peliOhi laukesi onnistuneen paon kautta. `peliOhi`-näkymä ei vieläkään ole GDD 11:n täysi pako-VALINTA-ruutu (helikopteri/vuoristo valittavaksi ennen yritystä) — pakoreitti valitaan automaattisesti `pelitila.helikopteriOstettu`-lipun perusteella.
- **KYSYTTÄVÄ SASULTA — vuoristopaon "matala/korkea" sissien voima -raja:** GDD 11 ei anna tarkkaa lukua. Koodissa (`js/moottori/pako.js`) käytetty raja ≤2 (sissit alkavat voimalla 6, joten pako onnistuu vain merkittävän heikennyksen jälkeen — vastaa GDD:n huomiota "sissit käytännössä aina uhka"). Pitää vahvistaa Sasulta, samoin se onko kyseessä deterministinen raja vai pitäisikö olla todennäköisyyskäyrä.
- **Kohta 11 (UI-kiillotus) valmis — koko toteutusjärjestys käyty läpi:** Swipe lisätty audiensseihin `pointerdown/pointermove/pointerup`-tapahtumilla (toimii sekä hiirellä että kosketuksella, testattu molemmilla Playwrightissa). Kynnys 80px, alle jäävä veto snapsahtaa takaisin. Napit ja pudotusvalikot korotettu 44px:n minimikorkeuteen kosketusystävällisyyden vuoksi. Tietoisesti EI tehty: GDD 1.5:n "jokainen kuukausivaihe on oma näyttönsä" -periaatetta ei toteutettu täytenä ruutu-per-vaihe-navigointina — kassaraportti+ryhmät pysyvät pysyvänä yläpalkkina ja aktiiviset vaiheet (audienssi/päätös/uutiset/kriisi/attentaatti) pinoutuvat sen alle näkyviin skrollattavaksi. Täysi yksi-ruutu-kerrallaan-kokemus olisi ollut isompi rakennemuutos kuin "kiillotus", ja nykyinen pino toimii mobiilissa kohtuullisesti (testattu 390×844-viewportilla).
