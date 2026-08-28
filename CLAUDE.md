# Dictator — Ritimban Republic

## Nykyinen tila

Päivitetty: elokuu 2026

- **Infrastruktuuri:** Git-repo pystytetty, GitHub-yhteys toimii, push/pull toimii
- **GDD:** `docs/GDD.md` luotu suoraan `docs/Dictator_GDD_V11.docx`:stä — toimii projektin ykköslähteenä
- **Materiaali:** `materiaali/`-kansiossa mainoskuva ja voittomarssi (myöhempää web-mainontaa varten)
- **Pelikoodi:** kohdat 1–11 valmiit JA GDD 4:n täysi 8-vaiheinen kuukausikierros + GDD 12:n poliisiraportti rakennettu. Runko, kassajärjestelmä, ryhmät/mittarit, audienssijärjestelmä (42 korttia), presidentin päätökset (19 korttia), uutisvaihe (48 korttia), sota, vallankumous/kaappaus/kapina, attentaatti, pako ja pisteytys sekä UI-kiillotus (GDD 1.5: swipe-audienssit, 44px-napit, mobiilioptimointi) toimivat selaimessa. Yksinkertaistettu kuukausikierto on nyt korvattu oikealla vaihekoneella (`js/moottori/kuukausikierros.js`): pelaaja etenee vaihe kerrallaan 1→8, vaihe-indikaattori näkyy ruudulla, ja ehdolliset kassaraporttivaiheet 4 ja 6 ajetaan vain jos audienssilla/päätöksellä oli kassavaikutus.
- **Testaus:** `node --test testit/*.test.js` (tai `npm test`) — 137 testiä kattaa kassaraportin, mittarien rajauksen, audienssit, presidentin päätökset, uutisvaiheen, sodan, kriisit, attentaatin, paon, pisteytyksen, kuukausikierroksen vaihejärjestyksen ja poliisiraportin, kaikki vihreää. UI-vuorovaikutus (swipe, vaiheiden napit, paneelien näkyvyys) testataan Playwrightilla selaimessa, ei Node-testeissä.
- **KAIKKI avoimet KYSYTTÄVÄ SASULTA -kohdat on nyt käyty läpi ja ratkaistu (elokuu 2026)** — ks. muistiinpanot alla jokaisen päätöksen yksityiskohdista (A3:n satunnaisväli, N3/N4/N5/N12:n uudet säännöt, REV STR:n rooli ja käyrä, kriisin ja vuoristopaon todennäköisyyspohjainen taistelu, attentaatin 90%-katto).
- **Seuraava askel:** koko GDD:n mekaniikkapuoli on toteutettu. Jäljellä on Sasun oma pelitestaus selaimessa sekä yksi hänelle esitetty avoin suunnittelukysymys (pisteytystittelin kuvaus kuolemantapauksessa) — ks. muistiinpanot alla.

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
- **VALMIS (elokuu 2026) — GDD 4:n 8-vaiheinen kuukausikierros:** Aiempi yksinkertaistettu "Seuraava kuukausi" -kierto on korvattu `js/moottori/kuukausikierros.js`:n vaihekoneella. Moduuli hoitaa vain vaiheiden JÄRJESTYKSEN ja ehdollisten vaiheiden ohituksen; vaiheiden sisältö on omissa moottorimoduuleissaan ja niiden ajaminen `js/paa.js`:n `suoritaVaihe`-funktiossa. Yleinen nappi vaihtaa tekstiä ("Aloita kuukausi N" / "Jatka") ja menee lukkoon kun vaihe odottaa pelaajan omaa valintaa (audienssi, päätös, raportin osto) tai kun kriisi on käynnissä. Vaiheet 4 ja 6 ajetaan vain jos edellinen vaihe muutti kassaa TAI kuukausikuluja (GDD 3.2: kulumuutokset astuvat voimaan heti, joten nekin lasketaan kassavaikutukseksi).
- **VALMIS (elokuu 2026) — GDD 12:n poliisiraportti:** `js/moottori/poliisiraportti.js`. Ensimmäinen raportti ilmainen, sen jälkeen 1 000/kpl (`pelitila.poliisiraporttiOstettu`). Ei saatavilla kun sal.pol. suosio ≤ 2, voima = 0, tai kassa ei riitä — GDD 3.6:n "pelaaja sokeutuu" näkyy ruudulla syytekstinä eikä paneelin piilottamisena, koska sokeutuminen on GDD:n mukaan tarkoituksellinen dramaattinen hetki. Uhkaindikaattorit (GDD 2.4) johdetaan olemassa olevista säännöistä, ei uusista: "A" = `onkoAttentaattiuhka` (attentaatti.js), numero = `laskeTyytymattomyys` kun se ylittää kriisi.js:n kynnyksen. Merkki näytetään vain ryhmille jotka oikeasti voivat toimia uhkana (sissit/Leftoto/suurvallat eivät saa merkkiä vaikka kaavat täyttyisivät).
- **Arkkitehtuurivalinta — kriisitarkistus joka vaiheen jälkeen, attentaatti kerran kuussa:** GDD 4 sanoo että kriisit ja attentaatti "voivat laueta missä vaiheessa tahansa ja ketjuuntua". `tarkistaKriisi` on deterministinen (ei noppaa), joten sen ajaminen jokaisen tilaa muuttavan vaiheen jälkeen EI muuta kriisien kokonaismäärää — kriisi vain laukeaa heti sen teon jälkeen joka kaatoi kupin, ei vasta kuun lopussa. Attentaatti sen sijaan on satunnainen (D3/kk per A-ryhmä), joten se heitetään tasan kerran kuukaudessa uutisvaiheessa kuten GDD 10 määrää. Kriisin voittaminen kesken kuukauden palauttaa pelaajan siihen vaiheeseen josta kriisi keskeytti (`jatkaKierrosta`), ja ketjuuntuminen toimii: armahdus jättää voimat pystyyn → uusi kriisi laukeaa heti (GDD 9.6: "Nähtään heikkoutena").
- **Löydetty ja korjattu bugi (oli jo HEAD:ssä, syntyi kohdassa 11):** Audienssin Hyväksy/Hylkää-napit eivät toimineet oikeilla klikkauksilla lainkaan sen jälkeen kun swipe lisättiin. Syy: `pointerdown` kortin päällä kutsui `audienssiEl.setPointerCapture(...)`, joka ohjaa pointer-tapahtumat korttiin — jolloin napin `click`-tapahtumaa ei koskaan synny. Korjattu ohittamalla swipen aloitus kun `e.target.closest("button")`. Bugi jäi aiemmin huomaamatta koska swipe testattiin, mutta nappeja ei testattu uudelleen swipen lisäämisen jälkeen. **Muistutus: kun kortin päälle lisätään elettä, testaa AINA myös sen sisällä olevat napit oikealla `page.click`:llä.**
- **Toistunut ansa — `var`-tuonti törmää selaimen globaaliin:** `js/moottori/poliisiraportti.js`:ään yritettiin ensin `var { laskeTyytymattomyys, TYYTYMATTOMYYS_KYNNYS } = require("./kriisi.js")`. Selaimessa `var TYYTYMATTOMYYS_KYNNYS` törmää kriisi.js:n `const`-määrittelyyn → SyntaxError, joka kaataa KOKO tiedoston hiljaa (Node-testit menivät silti läpi). Sama ansa kuin sota.js:n `uutiskortit` aiemmin. Ratkaisu on aina sama: erinimiset paikalliset viittaukset (`tyytymattomyysFn`, `tyytymattomyysKynnys`, `attentaattiuhkaFn`). Tarkista tämä aina kun uusi moottorimoduuli tuo toisen moduulin nimiä.
- **RATKAISTU (Sasu, elokuu 2026) — tilannekuva vain raportista:** "Tilannekuvan saa ostaa salaisen poliisin raportissa." Yläpalkin "Ryhmät"-lista näyttää nyt vain ryhmien NIMET; suosio ja voima näkyvät ainoastaan ostetussa poliisiraportissa, ja raportti katoaa näkyvistä kun vaihe vaihtuu. Tämä on GDD 9.5:n puolustusvalinnan ("pelaaja valitsee MUISTINSA varassa", "jos säästit nuo tuhannet, taistelet sokkona") koko jännitteen edellytys. Toteutettu `piirraRyhmat`-funktiossa.
- **RATKAISTU (Sasu, elokuu 2026) — sokeus on väliaikainen, mutta rahasta kiinni:** "Kun pelaaja menettää näkyvyyden raporttiin salaisen poliisin suosion ollessa liian alhainen → se oli siinä. Suosio palautuu hiljalleen ja rapsa tulee näkyviin muutaman vuoron jälkeen. Mutta tämä edellyttää että kassassa on rahaa. Mikäli kassa tyhjä ei sitä rapsaa saa silloinkaan." Toteutettu `palautaSalaisenPoliisinSuosio`-funktiolla (`poliisiraportti.js`), joka ajetaan kuukausikierroksen vaiheessa 1: salaisen poliisin suosio nousee +1/kk VAIN niin kauan kuin se on näkyvyyskynnyksen (3) alapuolella, joten nollasta raportti palaa kolmessa kuukaudessa eikä palautuminen ole ilmainen tie takaisin poliisin suosioon. **Palautusnopeus (+1/kk) ja katto (kynnys 3) ovat valintoja, eivät GDD:stä — helposti säädettävissä `NAKYVYYSKYNNYS`-vakiolla jos pelitestaus osoittaa sokeuden liian lyhyeksi tai pitkäksi.** Palautus koskee vain suosiota, ei voimaa — siksi GDD 13:n D9/D10-strategia toimii yhä: D9 nollaa myös voiman, ja voima = 0 pitää raportin lukossa kunnes D10 vahvistaa poliisin takaisin.
- **AVOIN SASULLE — pisteytystitteli kuolemantapauksessa:** GDD 14:n titteliraja-taulukko on puhtaasti pistepohjainen, joten kuolemaan päättynyt peli voi saada tittelin "Kunniakas pako — Selvisit hengissä ja varakkaana". Toteutus noudattaa GDD:tä kirjaimellisesti eikä sitä muutettu. Jos kuvauksen halutaan riippuvan lopputavasta (kuolema vs. pako), se on GDD-muutos.
- **RATKAISTU (Sasu, elokuu 2026) — N4:** "Armeijan voima romahtaa" = puolitetaan (pyöristys alas), mutta ei koskaan alle 1:n. Toteutettu `js/moottori/uutiset.js`:n `N4_ARMEIJA_PUOLITA`-haarassa.
- **RATKAISTU (Sasu, elokuu 2026) — N5:** "Kassatulot laskevat" = maanomistajien suosio puolitetaan (pyöristys alas) ja kuukausikulut nousevat pysyvästi 5000:lla (simuloi menetettyä verotuloa). Toteutettu `js/moottori/uutiset.js`:n `N5_BANAANIT`-haarassa.
- **RATKAISTU (Sasu, elokuu 2026) — N12:** GDD:n "−5k/kk (til.)" oli täysin uusi, ei-simuloitu kortti. Tarkoitus oli aina kertaluontoinen 1 kk:n 5000:n kustannus ("pikainen pieni huono uutinen"), ei pysyvä kuukausikulu. Korjattu käyttämään `kertaluontoinen: -5000` pysyvän `kuukausikulutMuutos`-kentän sijaan.
- **Kohta 7 (Sota) valmis:** A1:n *PIKASOTA ja P1/D16:n *ESKALAATIO laukaisevat sodan (`js/moottori/sota.js`).
- **RATKAISTU (Sasu, elokuu 2026) — N3:** Vahvistettu että N3 ("Leftoto hyökkää!") on TARKOITUKSELLA mahdollinen myös suoralla, tavallisella uutispakan nostolla ilman A1/P1/D16-reittiä — "naapuri on arvaamaton", harvinainen mutta todellinen yllätyssota. Toteutettu `js/paa.js`:n `kasitteleUutinen`-funktiossa: kun normaalisti nostettu kortti on N3, kutsutaan `suoritaPikasota`-funktiota samoilla säännöillä kuin A1:llä (ei N1-puskuria, ei velkaa, mutta voiton jälkitila — Leftoton puolitus + REV STR-piikki — soveltuu normaalisti).
- **RATKAISTU (Sasu, elokuu 2026) — REV STR:n paluukäyrä:** Muutettu tasaisesta lineaarisesta paluusta nopeutuva-hidastuvaksi ("olis realistisempi näin: nopeampi alussa, sitten hitaampi"). Kolmiolukupainotus `js/moottori/sota.js`:ssä: kuukausi 1 poistaa 3/6 alkuperäisestä piikistä, kuukausi 2 poistaa 2/6, kuukausi 3 loput 1/6 (asetetaan suoraan perustasoon pyöristysvirheiden välttämiseksi). Esimerkki piikistä 18: 18 → 14 → 11,33 → 10.
- **RATKAISTU (Sasu, elokuu 2026) — vallankumousvoima (REV STR) on "vaan rapsa":** Se on pelaajalle näytettävä varoituslukema (GDD 12: STRENGTH FOR REVOLUTION poliisiraportissa, ei vielä rakennettu), EI osa todellista taistelulaskentaa — `js/moottori/kriisi.js`:n `ratkaisePuolustus` käyttää edelleen GDD 9.5:n omaa täsmällistä kaavaa (käynnistäjä+liittolainen+sissit), eikä sitä muutettu. Toteutettu `laskeVallankumousvoimanPerustaso`-funktiolla (`js/moottori/kriisi.js`): perustaso 10 + kriisikykyisten ryhmien (armeija/talonpojat/maanomistajat) tyytymättömyyksien (voima−suosio, floor 0) summa, päivittyy joka kuukausi `js/paa.js`:ssä paitsi kun sodanjälkeinen piikki+palautuminen (edellinen kohta) on kesken.
- **Arkkitehtuurivalinta — GDD 9.2:n laukaisuehto muokattu yhdessä Sasun kanssa:** GDD 9.2:n kirjaimellinen kaava "suosio + voima ≥ 7" todettiin toimivan väärään suuntaan (ks. `js/moottori/kriisi.js`:n alun kommentti) — aloitusarvoilla jokainen ryhmä ylittäisi sen heti. Käytetään sen sijaan `voima − suosio ≥ 3` (kynnysarvo 3 on arvaus, ei simuloitu). GDD.md:n tekstiä ei ole muutettu, koodi ja tämä muistiinpano ovat toistaiseksi ainoa totuudenlähde tälle poikkeamalle kunnes Sasu päivittää docx:n.
- **RATKAISTU (Sasu, elokuu 2026) — GDD 9.6:n "~25% (D4, tulos 4)":** Alkuperäinen deterministinen tulkinta oli väärä. Sasu: "kaikki on sattumaa silloin kun aseet puhuu" — taistelu pitää olla oikeasti satunnainen, ei pelkkä voimavertailu. `js/moottori/kriisi.js`:n `ratkaisePuolustus` laskee nyt voittotodennäköisyyden pelaajan osuutena yhteisvoimasta (`pelaajanVoima / (pelaajanVoima + vihollisenVoima)`) ja heittää sen mukaan — jopa reilusti ylivoimainen puolustus voi hävitä epäonnekkaalla heitolla, eikä täysin alivoimainenkaan ole täysin toivoton. GDD 9.6:n "~25%" on tämän kaavan tyypillinen keskiarvo eri tilanteissa, ei erillinen sääntö. Osio 8:n sodan ratkaisu (`js/moottori/sota.js`:n `ratkaiseSota`) pysyy deterministisenä — GDD 8.3 antaa sille täsmälliset esimerkkiluvut, joten sitä ei muutettu.
- **Löydetty ja korjattu bugi:** kriisi-paneelin alavaiheiden (uhka/vaatimus/puolustus/rangaistus-napit) näkyvyys yritettiin ensin toteuttaa `element.style.display = ""`, mikä ei kumoa CSS-tiedoston `display:none`-sääntöä (vain tyhjentää inline-tyylin). Napit eivät siis oikeasti näkyneet vaikka ohjelmalliset testiklikkaukset toimivat. Korjattu käyttämään samaa `piilossa`-luokkamallia kuin muut paneelit. Muistutus: aina kun UI-elementille lisätään CSS-oletus `display:none`, näkyvyys pitää testata Playwrightin `page.click`/`isVisible`-metodeilla (jotka kunnioittavat todellista näkyvyyttä), ei `page.evaluate`-sisäisillä `.click()`-kutsuilla jotka ohittavat sen.
- **Kohta 9 (Attentaatti) valmis:** GDD 10:n suosio+voima≤3-kaava on suoraan käyttökelpoinen sellaisenaan (toisin kuin 9.2) — vahvistaa sinun kuvaamasi periaatteen: voimattomat (matala suosio JA voima) turvautuvat attentaattiin, voimakkaat-mutta-epäsuositut (osio 9) kaappaukseen/kapinaan/vallankumoukseen. A-ryhmät rajattu kotimaan tyyppisiin (armeija, talonpojat, maanomistajat, salainen poliisi) — sissit/Leftoto/suurvallat eivät voi laueta tätä kautta.
- **VAHVISTETTU (Sasu, elokuu 2026) — selviytymistaulukko yli 8:n henkivartijavoiman:** 90 % on kova katto — "90% yli ei tarvi mennä vaikka mitä olis investoitu omaan selviytymiseen". Nykyinen toteutus (`js/moottori/attentaatti.js`, käyttää 90%:a kaikelle voima≥8:lle) oli jo oikein, ei muutosta. Se, mitä epäonnistuneelle attentaattiyritykselle seuraa (vaikuttaako se yrittäjäryhmän suosioon/voimaan?), on silti yhä avoin — GDD ei mainitse sitä, koodissa ei muuteta mitään.
- **Kohta 10 (Pako ja pisteytys) valmis:** "Pakene"-nappi lisätty puolustusvalinnan rinnalle (`js/moottori/pako.js`) — saatavilla kaikissa kriisityypeissä, vaikka GDD 11 mainitsee sen nimenomaisesti vain "ainoana järkevänä valintana" vallankumoukselle (kaappaus/kapina voi myös voittaa, mutta pako ei ole kiellettykään niissä). Pelin päättyessä (mistä tahansa syystä — sota, kriisi, attentaatti, pako) lasketaan ja näytetään pisteet (`js/moottori/pisteytys.js`) GDD 14:n mukaan; Swiss-bonus lasketaan vain jos peliOhi laukesi onnistuneen paon kautta. `peliOhi`-näkymä ei vieläkään ole GDD 11:n täysi pako-VALINTA-ruutu (helikopteri/vuoristo valittavaksi ennen yritystä) — pakoreitti valitaan automaattisesti `pelitila.helikopteriOstettu`-lipun perusteella.
- **RATKAISTU (Sasu, elokuu 2026) — vuoristopaon sissiraja:** Muutettu todennäköisyydeksi terävän rajan sijaan, samaan tapaan kuin kriisin taistelu: "voiman määrä tulee korreloimaan kiinni jäämisen riskiä... kun sissien voima on suuri jää aina kiinni". Kaava (`js/moottori/pako.js`, `vuoristopaonTodennakoisyys`): `1 - sissienVoima/9` — voima 0 → aina onnistuu, voima 9 → aina kiinni, siltä väliltä lineaarinen.
- **Kohta 11 (UI-kiillotus) valmis — koko toteutusjärjestys käyty läpi:** Swipe lisätty audiensseihin `pointerdown/pointermove/pointerup`-tapahtumilla (toimii sekä hiirellä että kosketuksella, testattu molemmilla Playwrightissa). Kynnys 80px, alle jäävä veto snapsahtaa takaisin. Napit ja pudotusvalikot korotettu 44px:n minimikorkeuteen kosketusystävällisyyden vuoksi. Tietoisesti EI tehty: GDD 1.5:n "jokainen kuukausivaihe on oma näyttönsä" -periaatetta ei toteutettu täytenä ruutu-per-vaihe-navigointina — kassaraportti+ryhmät pysyvät pysyvänä yläpalkkina ja aktiiviset vaiheet (audienssi/päätös/uutiset/kriisi/attentaatti) pinoutuvat sen alle näkyviin skrollattavaksi. Täysi yksi-ruutu-kerrallaan-kokemus olisi ollut isompi rakennemuutos kuin "kiillotus", ja nykyinen pino toimii mobiilissa kohtuullisesti (testattu 390×844-viewportilla).
