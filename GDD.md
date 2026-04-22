DICTATOR
The Ritimban Republic
MOBIILI / SELAINVERSIO
Pelisuunnitteludokumentti V11
Huhtikuu 2026
Alkuperäinen peli: Don Priestley & Andy French
DKTronics, 1983 | Commodore 64, ZX Spectrum

# Muutosloki V10 → V11
Tämä versio konkretisoi V10:n avoimet säännöt pelattavaan muotoon. Suurin osa muutoksista koskee sotaa, suurvalta-apua, kriisinhallintaa ja taloutta.
## Vahvistetut säännöt
N1-eskalaatiokierre: tarkat todennäköisyydet ja velkavaihe määritelty
Leftoton perääntyminen lisätty (n. 10 % peleistä)
Sodan voimalaskenta: Ritimban puolelta ryhmät joiden suosio ≥ 4
Sodan jälkivelka: N1_kerrat × −1 suosio kotimaan ryhmille (kasautuu)
Suurvalta-apu lukittu kertakäyttöiseksi, summat porrastettu (0/50/130/200/270/330k)
Audienssin pakkalogiikka: tyhjälle ryhmälle uusi D3-heitto
Vallankumouksen puolustusvalinta: 1 ryhmä, ei numeroita näkyvissä
Sissien dynamiikka: 6 uutta ehdollista uutiskorttia (N43–N48)
Kuukausikulut 60 000 → 45 000 (tasapainosimulaation perusteella)
Pelin pituus: ei kovaa rajaa — kassakriisi hoitaa lopun luonnollisesti

# 1. Yleiskatsaus
## 1.1 Pelin konsepti
Dictator on vuoropohjainen strateginen selviytymispeli, jossa pelaaja on Ritimban tasavallan diktaattori 1960–70-luvun Latinalaisessa Amerikassa. Peli sijoittuu kylmän sodan aikakaudelle. Pelaaja navigoi suurvaltapolitiikan, sisäisten ristiriitojen ja väistämättömän tuhon välissä.
Pelin ydinfilosofia: diktatuuri päättyy aina huonosti. Kysymys ei ole voitatko, vaan kuinka pitkään selviyät.
## 1.2 Tekijätiedot
Suunnittelu: Don Priestley. Ohjelmointi: Andy French. Julkaisija: DKTronics, 1983. Alustat: Commodore 64, ZX Spectrum.
## 1.3 Kohdealusta
HTML/JS-selainpeli, pelattavissa mobiilissa ja työpöydällä. Jaellaan URL:n kautta. Vuoropohjainen mekaniikka, nopeat 10–20 minuutin pelikerrat.
## 1.4 Tekninen stack
HTML/JS, ei frameworkeja. Pelin tila puhtaana JavaScript-objektina (gameState.js). Korttidata JSON-rakenteessa. localStorage highscoren tallennukseen. Hosting: GitHub Pages / Netlify / Cloudflare Pages.
## 1.5 Mobiili-UI-periaatteet
Vaihe-vaiheelta -navigointi: pelaaja etenee aina eteenpäin. Jokainen kuukausivaihe on oma näyttönsä. Swipe-mekaniikka audiensseissa (oikealle = kyllä, vasemmalle = ei). Värikoodaus: vihreä = kassaraportti, sininen = poliisiraportti, kultainen = audienssi/päätös, punainen = kriisi.

# 2. Ryhmät ja mittarit
## 2.1 Mittarijärjestelmä
Jokaisella ryhmällä on kaksi mittaria asteikolla 0–9: Suosio ja Voima. Yliraja 9 — yli menevät bonukset valuvat hukkaan.
## 2.2 Ryhmät ja aloitusarvot

| # | Ryhmä | C64-nimi | Tyyppi | Suosio | Voima | Rooli |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Armeija | ARMY | Kotimaa | 7 | 6 | Sotilaallinen voima. Vallankaappausuhka. |
| 2 | Talonpojat | PEASANTS | Kotimaa | 7 | 6 | Työväestö/kansa. Riistettyjä. |
| 3 | Maanomistajat | LANDOWNERS | Kotimaa | 7 | 6 | Talouseliitti. USA:n suosikki. |
| 4 | Sissit | GUERILLAS | Ulkopuol. | 0* | 6 | Kapinalliset vuoristossa. Suosio pysyvästi 0. Voima vaihtelee korttien ja N2:n kautta. |
| 5 | Leftoto | LEFTOTANS | Ulkopuol. | 7 | 6 | Neukku-blokin naapurimaa. Voi hyökätä. Pysyy pelissä koko ajan. |
| 6 | Salainen poliisi | SECRET POLICE | Kotimaa | 7 | 6 | Myy tiedusteluraportteja (1 000/kpl). |
| — | Venäjä | RUSSIANS | Suurvalta | 7 | 0 | Itäblokki. Ei voimavaikutusta. |
| — | Yhdysvallat | AMERICANS | Suurvalta | 7 | 0 | Länsiblokki. Ei voimavaikutusta. |

* Sissien suosio lukittu pysyvästi 0:aan. Sissien voima ei käytännössä laske nollaan — N2 Kuuba-buusti voi tulla milloin tahansa, ja uudet N43–N48 -uutiskortit (osio 7.4) muokkaavat sissien voimaa pelaajan päätösten perusteella.
## 2.3 Henkivartijat
Aina uskollinen. Voima = YOUR STRENGTH (alkuarvo 4). Nousee +2 per vahvistuskerta (hinta 40 000). Suojaa attentaateilta ja taistelee vallankumouksessa, kaappauksessa ja kapinassa.
🆕 V11: Henkivartijat EIVÄT osallistu sotaan Leftotoa vastaan. Heidän roolinsa on sisäinen suoja palatsissa, ei rajasota.
## 2.4 Uhkaindikaattorit

| Merkki | Ehto | Uhka |
| --- | --- | --- |
| Numero | Korkea voima + matala suosio | Vallankumous / Kaappaus / Kapina |
| Kirjain A | Suosio + voima ≤ 3 | Attentaatti — D3-heitto joka kuukausi (~33 %) |

# 3. Talousjärjestelmä
## 3.1 Aloitustilanne

| Mittari | Alkuarvo |
| --- | --- |
| Valtion kassa | 1 000 000 |
| Kuukausikulut | 45 000 (V11: laskettu 60 000 → 45 000) |
| Kassan elinikä ilman tuloja | ~22 kuukautta (V11: oli 16 kk) |
| Sveitsiläinen tili | 0 |
| Henkivartijoiden voima | 4 |
| Vallankumousvoima | 10 |

🆕 V11: Kuukausikulut laskettu 60k → 45k tasapainosimulaation perusteella. Mediaanikassakriisi siirtyi kuukaudesta 12 kuukauteen 15. Tämä antaa pelaajalle 15 kk strategista peliaikaa ennen pakkohuonoja päätöksiä, ja viimeinen 3. on aitoa kriisinhallintaa.
## 3.2 Kassaraportti
Näytetään ilmaiseksi jokaisen kuukauden alussa. Kulut vähennetään ennen kaikkea muuta. Kulumuutokset astuvat voimaan heti ja kumuloituvat.
## 3.3 Sveitsiläinen pankkitili
Siirtomaksu 2 000 vähennetään aina siirrosta
Puolet kassasta tilille, pyöristys alas lähimpään tuhanteen, miinus 2 000
Jos kassa ≤ 2 000 → siirto estyy: "Pankkikulut estävät siirron"
Swiss-bonus pisteisiin: saldo / 10 000 (vain jos pakenee hengissä)
## 3.4 Suurvalta-apu (V11: täysin uudistettu)
🆕 V11: Suurvalta-apu on nyt KERTAKÄYTTÖINEN presidentin päätös, ei toistuva. D14 (Venäjä) ja D15 (USA) voi pelata kerran kumpikin koko pelin aikana. Pelaajan strateginen ydin: ajoita käyttö maksimisuosioeron hetkeen.
Mekaniikka:
D14: pyydetään Venäjältä → suosioero = Venäjä − USA
D15: pyydetään USA:lta → suosioero = USA − Venäjä
Apu maksetaan portaittain suosioeron mukaan (taulukko alla)
Kortti kuluu joka tapauksessa, vaikka apu olisi 0
Suurvalta-avun summataulukko:

| Suosioero | Apu | Reaktio |
| --- | --- | --- |
| 0 tai negatiivinen | 0 | "NJET!" / "NO!" — kortti käytetty turhaan |
| 1–3 | 50 000 | "Hmm, ystävyyden nimissä..." — pelaaja: harmittaa |
| 4 | 130 000 | "Hyvä ystävämme!" |
| 5–6 | 200 000 | Lämmin diplomaattinen vastaanotto |
| 7–8 | 270 000 | Strateginen kumppanuus |
| 9 | 330 000 | "Veljellinen tuki imperialisteja vastaan!" / "Bulwark against communism!" |

## 3.5 Pakohelikopteri
Hinta 120 000. Kertakäyttöinen. Helikopteri voi olla rikki (25 %). Kaikki ryhmät suuttuvat ostohetkellä.
## 3.6 Kassan kuivuminen
Rahalliset audienssivaatimukset → pakko-EI
Rahalliset presidentin päätökset → lukittu (harmaat)
Pakko-EI:t laskevat suosioita → ketjureaktio
Salaisen poliisin raporttia ei voi ostaa → pelaaja sokeutuu
Kassakriisi ei suoraan päätä peliä, mutta käynnistää negatiivisen ketjureaktion. Tyypillisesti 3–5 kk kassakriisistä peli päättyy kapinaan, vallankumoukseen tai attentaattiin.

# 4. Kuukausikierros
Jokainen vuoro edustaa yhtä kuukautta. Kuukausi etenee vaiheittain:

| Vaihe | Tapahtuma | Huomio |
| --- | --- | --- |
| 1 | KASSARAPORTTI | Ilmainen, kulut vähennetään. Velkavaihe tässä jos sodan jälkeen. |
| 2 | POLIISIRAPORTTI | Ensimmäisellä vuorolla ilmainen, sitten 1 000. Vapaaehtoinen. |
| 3 | AUDIENSSI | D3 määrää kumpi ryhmä saapuu, sitten arvotaan kortti pakasta. Kertakäyttöinen. |
| 4 | KASSARAPORTTI | Jos audienssin päätöksellä oli kassavaikutus |
| 5 | PRESIDENTIN PÄÄTÖS | Yksi per vuoro. Rahalliset lukittuvat kassan kuivuessa. |
| 6 | KASSARAPORTTI | Jos päätöksellä oli kassavaikutus |
| 7 | UUTISVAIHE | Pakollinen. Arvotaan kortti uutispakasta. 48 korttia (V11). |
| 8 | POLIISIRAPORTTI | Ostomahdollisuus 1 000 |

ATTENTAATTI ja VALLANKUMOUS / KAAPPAUS / KAPINA voivat laueta missä vaiheessa tahansa ja ketjuuntua.
## 4.1 Audienssin mekaniikka (V11: tarkennettu)
Vain armeija, talonpojat ja maanomistajat voivat pyytää audienssia. D3: 1 = armeija, 2 = talonpojat, 3 = maanomistajat. Kortti arvotaan satunnaisesti ryhmän pakasta. Kertakäyttöinen — käytetty kortti ei palaa pakkaan.
Hyväksy: Kaikki vaikutukset toteutuvat + talousvaikutus.
Hyljää: Esittäjä saa saman suuruisen suosio-miinuksen. Ei talousvaikutusta.
Kassan ollessa tyhjä: rahalliset vaatimukset muuttuvat automaattisesti pakko-EI:ksi.
🆕 V11: Pakkalogiikka: jos D3 osoittaa ryhmään jonka pakka on tyhjä, heitetään D3 uudelleen. Jos kaikkien kolmen ryhmän pakat ovat tyhjät, audienssia ei pidetä tässä kuussa — kuukausi etenee suoraan presidentin päätökseen. Audienssikortit ovat satunnaisessa järjestyksessä, mikä luo sessioiden välistä vaihtelua (joku peli saa raskaita kortteja, toinen löysiä).
## 4.2 Uutisvaihe (V11: 48 korttia)
Pakollinen joka kuukausi. Arvotaan yksi kortti yhteisestä uutispakasta (48 korttia, V10:ssä 42). Isot tapahtumat (sodat, sissien boostit) ja pienet tapahtumat (lehmät, papukaijat) ovat samassa pakassa — pelaaja ei tiedä mitä on tulossa. Kun pakka loppuu, se sekoitetaan uudelleen.
🆕 V11: V11 lisää 6 uutta ehdollista sissi-uutiskorttia (N43–N48). Ehdolliset kortit eivät kulu pakasta — jos ehto ei täyty nostohetkellä, kortti palaa pakkaan ja nostetaan seuraava.

# 5. Audienssikorttitaulukot
42 audienssikorttia: 15 armeijalle, 13 talonpojille, 14 maanomistajille.
## 5.1 Armeijan audienssit (15 korttia)

| # | Vaatimus | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| A1 | Hyökkää sissien tukikohtiin Leftotossa | Armeija +3, Talonp. −1, Leftoto −4, Venäjä −1 | Armeija +1, Maanomist. +1, Sissit −2 | −80k *PIKASOTA |
| A2 | Hyökkää kaikkiin sissitukikohtiin | Armeija +3, Talonp. +1, Maanomist. +1, Leftoto −1, Venäjä −1 | Armeija +1, Maanomist. +1, Sissit −4 | −100k |
| A3 | Osta lisää aseita ja ammuksia | Armeija +4, Talonp. −1, Maanomist. −1, Leftoto −1, Sal.pol. −1 | Armeija +3, Sissit −1/−2, Leftoto −1 | −120k |
| A4 | Korota sotilaiden palkkoja | Armeija +3, Talonp. −1, Maanomist. −1 | Armeija +2 | +5k/kk |
| A5 | Karkota venäläiset sotilasneuvonantajat | Armeija +3, Venäjä −4, USA +2 | — | — |
| A6 | Pakkovärväys armeijaan | Armeija +3, Talonp. −1, Maanomist. −1 | Armeija +1, Sissit −1 | — |
| A7 | Pakko-ota maata harjoituskäyttöön | Armeija +3, Talonp. −1, Maanomist. −2 | Armeija +1 | — |
| A8 | Erota maanomistajia hallinnosta | Armeija +3, Maanomist. −3, Talonp. +1 | — | — |
| A9 | Vangitse salaisen poliisin päällikkö | Armeija +3, Sal.pol. −3 | Sal.pol. −2 | — |
| A10 | Hanki uusi radiolaitteisto USA:sta | Armeija +3, USA +2, Venäjä −3 | Armeija +1 | −40k |
| A11 | Jaa viljelysmaata veteraaneille | Armeija +3, Maanomist. −3, Talonp. +1 | Armeija +1, Maanomist. −1 | — |
| A12 | Järjestä suuri sotilasparaati | Armeija +2, Talonp. +1, Leftoto −1 | — | −30k |
| A13 | Puhdista epäillyt vasemmistolaiset upseeristosta | Armeija +3, Leftoto −2, Venäjä −2 | Armeija −1, Sissit +1 | — |
| A14 | Yhteiset viidakkosotaharjoitukset USA:n kanssa | Armeija +2, Talonp. −1, USA +3, Venäjä −3 | Armeija +1 | −15k |
| A15 | Tukahduta opiskelijoiden mielenosoitukset voimalla | Armeija +3, Talonp. −4, Maanomist. +1 | Armeija +1, Talonp. −1 | −5k |

## 5.2 Talonpoikien audienssit (13 korttia)

| # | Vaatimus | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| P1 | Lopeta Leftoton siirtotyöläiset | Talonp. +3, Maanomist. −2, Leftoto −2 | Talonp. +2, Maanomist. −2 | — *ESKALAATIO |
| P2 | Laillistakaa ammattiliitot | Armeija +1, Talonp. +4, Maanomist. −3, Leftoto +1, Sal.pol. −1, Venäjä +1 | Talonp. +3, Maanomist. −3, Sal.pol. −1 | — |
| P3 | Ilmainen koulutus kaikille | Armeija −1, Talonp. +4, Maanomist. −3, Leftoto +2, Sal.pol. −1, Venäjä +1 | Talonp. +1, Maanomist. −1, Sissit −1 | −100k, +8k/kk |
| P4 | Vapauttakaa vangittu johtajamme | Armeija −1, Talonp. +4, Maanomist. −2, Leftoto +1, Sal.pol. −1 | Talonp. +2, Maanomist. −1, Sissit −1 | — |
| P5 | Korottakaa minimipalkkaa | Talonp. +4, Maanomist. −1, Leftoto +1 | Maanomist. −1 | — |
| P6 | Perustakaa julkinen terveydenhuolto | Talonp. +4, Maanomist. −2, Venäjä +1 | Sissit −1 | −80k, +5k/kk |
| P7 | Rajoittakaa salaisen poliisin valtaa | Talonp. +3, Armeija +1, Maanomist. +1, Sal.pol. −3 | Sal.pol. −2 | −3k/kk |
| P8 | Pakkolunasta joutomaita osuuskunnille | Talonp. +4, Maanomist. −4, USA −1 | Talonp. +1, Maanomist. −1 | — |
| P9 | Hintakatto perustarvikkeille | Talonp. +3, Maanomist. −2 | — | −5k/kk |
| P10 | Kansallinen lukutaitokampanja | Talonp. +3, Maanomist. −1 | Sissit −1 | −40k |
| P11 | Valtion tuet pientilallisten lannoitteisiin | Talonp. +3, Maanomist. −1 | Talonp. +1 | −25k |
| P12 | Salli Leftoton pakolaisten asettua rajakyliin | Talonp. +2, Armeija −2, Maanomist. −2, Leftoto +3 | Talonp. +1, Leftoto −1 | — |
| P13 | Kansallista ulkomainen vesiyhtiö | Talonp. +4, Maanomist. −1, USA −3 | Talonp. +1 | +15k |

## 5.3 Maanomistajien audienssit (14 korttia)

| # | Vaatimus | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| M1 | Tuontitulli Leftoton tavaroille | Maanomist. +3, Leftoto −3, Venäjä −1 | Talonp. +1, Maanomist. +2, Leftoto −1 | −5k/kk |
| M2 | Kansallista amerikkalaisten yritykset | Maanomist. +3, Leftoto +1, Venäjä +2, USA −4 | Maanomist. +1 | +100k, +5k/kk |
| M3 | Vapauta sotilaita peltotöihin | Armeija −2, Talonp. −1, Maanomist. +3 | Armeija −1, Talonp. −1, Maanomist. +1, Sissit +1 | — |
| M4 | Lopeta maan sotilaallinen käyttö | Armeija −2, Maanomist. +3 | Armeija −1 | — |
| M5 | Leikkaa salaisen poliisin rahoitusta | Armeija +1, Talonp. +1, Maanomist. +3, Sal.pol. −4 | Armeija +1, Maanomist. +1, Sissit +1, Sal.pol. −2 | −4k/kk |
| M6 | Kevennä maaverotusta | Maanomist. +4 | Maanomist. +2 | +5k/kk |
| M7 | Rakenna suuri kastelujärjestelmä | Maanomist. +3, Leftoto +1, Venäjä +1 | Maanomist. +1 | −120k, +10k/kk |
| M8 | Alenna minimipalkkaa | Maanomist. +3, Talonp. −2, Leftoto −1 | Maanomist. +1, Talonp. −1 | — |
| M9 | Laajenna banaaniviljelmiä sademetsään | Maanomist. +3, Talonp. −2, Leftoto −1 | Maanomist. +1 | +8k/kk |
| M10 | Myy kahvimonopoli yhdysvaltalaisille | Maanomist. +2, Talonp. −2, USA +3, Venäjä −3 | — | +80k |
| M11 | Tukahduta tehtaiden lakot voimalla | Maanomist. +3, Talonp. −3, Sal.pol. +1 | Maanomist. +1, Talonp. −1 | — |
| M12 | Tuhoa sissien salakuljetusreitit mailtamme | Maanomist. +3, Armeija −1 | Maanomist. +1, Sissit −2 | −20k |
| M13 | Verohelpotuksia ulkomaisille maataloussijoittajille | Maanomist. +3, Talonp. −2, USA +2 | Maanomist. +1 | −8k/kk |
| M14 | Karkota ammattiyhdistysjohtajat maasta | Maanomist. +3, Talonp. −3, Leftoto −2 | Maanomist. +1, Talonp. −1 | — |

# 6. Presidentin päätökset
Kertakäyttöisiä ellei merkitty tähdellä (*). Rahalliset päätökset lukittuvat kassan kuivuessa.
## 6.1 Miellytä ryhmää (6 korttia)

| # | Päätös | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| D1 | Nimitä armeijan komentaja varapresidentiksi | Armeija +4, Talonp. −1, Maanomist. −1, Sal.pol. −1 | Armeija +1, Sissit −1, Sal.pol. −1 | — |
| D2 | Perusta ilmaisia klinikoita työläisille | Armeija −1, Talonp. +4, Maanomist. −1, Leftoto +2, Venäjä +1 | Sissit −1 | −10k, +4k/kk |
| D3 | Anna maanomistajille alueellista valtaa | Armeija −1, Talonp. −2, Maanomist. +4, Sal.pol. −1, Venäjä −1 | Armeija −1, Talonp. −1, Maanomist. +2, Sal.pol. −1 | — |
| D4 | Myy USA:n aseita Leftotolle | Armeija −2, Leftoto +4, Venäjä −2, USA +1 | Armeija −1, Maanomist. +1, Sissit −1, Leftoto +3 | +50k |
| D5 | Myy kaivoskaupat USA:lle | Maanomist. −1, Leftoto −1, Venäjä −2, USA +3 | — | +120k |
| D6 | Vuokraa Venäjälle laivastotukikohta | Armeija −2, Venäjä +3, USA −3 | Leftoto +1 | −10k/kk |

## 6.2 Miellytä kaikkia (3 korttia)

| # | Päätös | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| D7 | Laske yleistä verotusta | Armeija +1, Talonp. +3, Maanomist. +3 | Armeija −1, Sissit −1 | +8k/kk |
| D8 | Järjestä suuri suosiokampanja | Armeija +3, Talonp. +3, Maanomist. +3 | Sissit −1 | −80k |
| D9 | Lakkauta salainen poliisi kokonaan | Armeija +3, Talonp. +3, Maanomist. +3, Sal.pol. −9 | Armeija +2, Talonp. +1, Maanomist. +1, Sissit +1, Sal.pol. −9 | −8k/kk |

## 6.3 Paranna mahdollisuuksiasi (4 korttia)

| # | Päätös | Toist.? | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- | --- |
| D10 | Vahvista salaista poliisia merkittävästi | Ei | Armeija −3, Talonp. −3, Maanomist. −3, Sal.pol. +8 | Armeija −1, Talonp. −1, Maanomist. −1, Sissit −1, Sal.pol. +8 | +6k/kk |
| D11 | Vahvista henkivartijoita | KYLLÄ* | Armeija −2, Talonp. −1, Maanomist. −1, Sal.pol. −1 | Armeija −2, Sal.pol. −1, Henkiv. +2 | −40k |
| D12 | Osta pakohelikopteri | Ei | Armeija −4, Talonp. −1, Maanomist. −3, Sal.pol. −2 | — | −120k |
| D13 | Siirrä rahaa Sveitsin tilille | KYLLÄ* | — | — | Puolet kassasta tilille, miinus 2k. Estyy jos kassa ≤ 2k. |

## 6.4 Hanki rahaa (3 korttia, V11: D14/D15 uudistettu)
🆕 V11: D14 (Venäjä-apu) ja D15 (USA-apu) ovat nyt kertakäyttöisiä, ei toistuvia. Summa määräytyy suosioeron mukaan (ks. osio 3.4). Ei aikarajoituksia — kortti voi kulua heti pelin alussa, mutta huono ajoitus johtaa pieneen tai olemattomaan apuun.

| # | Päätös | Suosiovaikutukset | Talous |
| --- | --- | --- | --- |
| D14 | Pyydä Venäjältä "lainaa" | Ei näkyviä | Suosioero (Venäjä − USA) → 0/50/130/200/270/330k |
| D15 | Pyydä USA:lta "apua" | Ei näkyviä | Suosioero (USA − Venäjä) → 0/50/130/200/270/330k |
| D16 | Kansallista Leftoton yritykset | Armeija +1, Talonp. +1, Maanomist. +3, Leftoto −5, Venäjä −2 | +130k *ESKALAATIO |

## 6.5 Vahvista ryhmää (3 korttia)

| # | Päätös | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| D17 | Osta raskas tykistö armeijalle | Armeija +3, Leftoto −3, Venäjä −1 | Armeija +5, Sissit −2, Leftoto −2, Sal.pol. −1 | −50k |
| D18 | Salli talonpoikien vapaa liikkuvuus | Talonp. +3, Maanomist. −1, Sal.pol. −1 | Talonp. +5, Maanomist. −1, Sissit +3, Sal.pol. −1 | — |
| D19 | Salli maanomistajien yksityismilitia | Armeija −1, Talonp. −1, Maanomist. +3, Sal.pol. −1 | Armeija −1, Talonp. −1, Maanomist. +5, Sissit −1, Sal.pol. −1 | — |

# 7. Uutistapahtumat (Newsflash)
## 7.1 Mekaniikka
Pakollinen vaihe joka kuukausi presidentin päätöksen jälkeen. Arvotaan yksi kortti yhteisestä pakasta (48 korttia, V11). Isot ja pienet tapahtumat ovat samassa pakassa — pelaaja ei tiedä mitä on tulossa. Kun pakka loppuu, sekoitetaan uudelleen.
N1 (Leftoton sotauhka) on toistuva — palaa pakkaan käytön jälkeen. Lisäksi N43–N48 ovat ehdollisia ja toistuvia. Muut kortit ovat kertakäyttöisiä.
🆕 V11: Ehdollisten korttien (N43–N48) mekaniikka: Jos kortin ehto ei täyty nostohetkellä, kortti palaa pakkaan ja nostetaan seuraava. Tämä takaa että jokainen kuukausi saa "oikean" uutisen, ja sissien dynaamiset uutiset realisoituvat vain kun pelaajan päätökset niitä laukaisevat.
## 7.2 Isot tapahtumat (N1–N7)

| # | Tapahtuma | Tyyppi | Vaikutus | Talous |
| --- | --- | --- | --- | --- |
| N1 | Leftoton sotauhka | Eskalaatio / toistuva | Kotimaan ryhmien (Armeija, Talonpojat, Maanomistajat) suosio +1. Voi laukaista N3:n. Ks. osio 8. | — |
| N2 | Kuubalaiset aseistivat sissit | Negatiivinen / kerta | Sissien voima → 9 välittömästi. | — |
| N3 | Leftoto hyökkää! | Sota / kerta | Sota laukeaa. Ks. osio 8. | — |
| N4 | Armeijan asevarasto räjähti | Negatiivinen / kerta | Armeijan voima romahtaa. | — |
| N5 | Banaanien hinta romahtaa | Negatiivinen / kerta | Kassatulot laskevat. | −tuloja |
| N6 | Presidentti hukkasi poliisin kansiot | Negatiivinen / kerta | Sal.pol. suosio JA voima → 0. Raportti katoaa. | — |
| N7 | Maanjäristys Leftotossa | Positiivinen / kerta | Leftoton voima puolitetaan. | — |

## 7.3 Pienet tapahtumat (N8–N42)

| # | Tapahtuma | Tyyppi | Vaikutus | Talous |
| --- | --- | --- | --- | --- |
| N8 | Ritimba voittaa Leftoton jalkapallossa! | Positiivinen | Talonp. +2, Leftoto −1 | −10k |
| N9 | Laaja sähkökatko pääkaupungissa | Negatiivinen | Maanomist. −1, Sal.pol. voima −1 | — |
| N10 | Yhdysvaltalainen filmitähti vierailee | Suurvaltaväri | USA +2, Venäjä −2, Maanomist. +1 | −15k |
| N11 | Kenraali kiinni sikarien salakuljetuksesta | Skandaali | Armeija −1, Talonp. +1 | +20k |
| N12 | Rankkasateet viivästyttävät kahvisatoa | Negatiivinen | Talonp. −1, Maanomist. −1 | −5k/kk (til.) |
| N13 | Neuvostoliiton valtionbaletti esiintyy | Suurvaltaväri | Venäjä +2, USA −2, Leftoto +1 | — |
| N14 | Mysteerisukellusvene havaittu rannikolla | Kylmän sodan paranoia | Armeija +1, USA +1, Venäjä −2 | — |
| N15 | Kultainen patsas presidentistä valmistuu | Egon pönkitys | Maanomist. +1, Talonp. −2 | −25k |
| N16 | Uusi saippuaooppera pysäyttää koko maan arjen | Häiriötekijä | Talonp. +2, Sissit voima −1 | −5k |
| N17 | Kansallislotto paljastuu valtion huijaukseksi | Skandaali / Korruptio | Talonp. −2, Sal.pol. +1 | +30k |
| N18 | Leftoton johtaja pilkkaa presidenttiä radiossa | Diplomaattinen selkkaus | Armeija +1, Talonp. +1, Maanomist. +1, Leftoto −3 | — |
| N19 | Yhdysvaltalainen risteilyalus vierailee satamassa | Turismibuusti | USA +2, Venäjä −1, Sissit voima +1 | +15k |
| N20 | Kansallinen vapaapäivä presidentin koiralle | Egon pönkitys | Talonp. +1, Maanomist. −1 | −2k |
| N21 | Sissit töhrivät palatsin muurin yöllä | Kiusanteko | Sissit voima +1, Sal.pol. suosio −1 | — |
| N22 | Neuvostoliittolainen shakkimestari häviää paikalliselle | Suurvaltaviihde | Venäjä −1, USA +1, Talonp. +1 | — |
| N23 | Amerikkalainen viskilasti "katoaa" satamassa | Korruptio | USA −1, Armeija suosio +1 | +5k |
| N24 | Leftoton lehmälauma eksyy rajan yli | Rajavälikohtaus | Leftoto −1, Maanomist. +1 | — |
| N25 | Pieni maanjäristys rikkoo astioita | Luonnonilmiö | Talonp. −1, Armeija suosio +1 | — |
| N26 | Yhdysvaltain suurlähettiläs valittaa hotellin aamiaisesta | Diplomaattinen nillitys | USA −1, Talonp. +1 | — |
| N27 | Armeijan uudet univormut kutistuvat pesussa | Sotilaallinen farssi | Armeija suosio −1, Sissit voima +1 | −2k |
| N28 | Neuvostoliitto lahjoittaa presidentille karhunpennun | Suurvaltalahja | Venäjä +1, USA −1 | −1k |
| N29 | Kansallislintu rauhoitetaan lailla | Näennäispolitiikka | Talonp. suosio +1, Maanomist. suosio −1 | — |
| N30 | Salainen poliisi pidättää vahingossa postimiehen | Inkompetenssi | Sal.pol. suosio −1, Armeija suosio +1 | — |
| N31 | Presidentin serkku voittaa "yllättäen" kauneuskilpailun | Nepotismi | Maanomist. suosio +1, Talonp. suosio −1 | −5k |
| N32 | Maan ainoa juna suistuu raiteilta lehmän takia | Infran rapistuminen | Talonp. −1, Maanomist. −1 | −2k |
| N33 | Neuvostoliiton diplomaatti laulaa kännissä USA:n kansallislaulun | Diplomaattinen farssi | Venäjä −1, USA +1 | — |
| N34 | Uusien postimerkkien liima maistuu valkosipulilta | Sabotaasi-epäily | Talonp. suosio −1, Sal.pol. suosio +1 | — |
| N35 | Presidentti julistautuu "tieteiden tohtoriksi" unensa perusteella | Henkilökultti | Maanomist. −1, Talonp. +1 | — |
| N36 | Sissit räjäyttävät vahingossa oman rommivarastonsa | Kapinallisten tunarointi | Sissit voima −1, Armeija suosio +1 | — |
| N37 | Leftoto väittää Ritimban kansallisruokaa omakseen | Kansallinen loukkaus | Leftoto −2, Talonp. +1, Maanomist. +1 | — |
| N38 | Kenraalin papukaija karkaa ja huutelee valtiosalaisuuksia torilla | Tietoturvariski | Armeija −1, Sal.pol. +1 | — |
| N39 | CIA pudottaa vahingossa propagandalehtisensä mereen | Kylmä sota | USA −1, Sal.pol. +1 | — |
| N40 | Maatalousministeriö "kadotti" budjettinsa Monacon kasinolle | Eliitin korruptio | Talonp. −2, Maanomist. +1 | −5k |
| N41 | Pääkaupunkiin iskee valtavien viidakkosammakoiden vitsaus | Luonnonilmiö | Talonp. −1, Armeija suosio +1 | — |
| N42 | Valtion radio soittaa vahingossa sissien taistelulaulun | Inkompetenssi | Sissit voima +1, Sal.pol. suosio −1 | — |

## 7.4 Sissien dynaamiset uutiskortit (N43–N48) — UUSI V11
🆕 V11: Nämä kortit muuttavat sissien voiman dynaamiseksi seuraukseksi pelaajan päätöksistä, ei staattiseksi luvuksi. Ehto tarkistetaan nostohetkellä — jos ehto ei täyty, kortti palaa pakkaan eikä kulu. Toistuvia: sama tilanne voi laukaista saman uutisen useita kertoja peräkkäin.

| # | Tapahtuma | Ehto (nostohetkellä) | Vaikutus |
| --- | --- | --- | --- |
| N43 | Tyytymättömät talonpojat pakenevat viidakkoon | Talonp. suosio ≤ 2 | Sissit voima +2, Talonp. voima −1 |
| N44 | Nuoret pojat värväytyvät kapinallisiin | Talonp. suosio ≤ 3 JA Maanomist. suosio ≥ 6 | Sissit voima +1, Maanomist. suosio −1 |
| N45 | Armeija nappaa sissipartion vuoristossa | Armeija voima ≥ 7 JA Armeija suosio ≥ 5 | Sissit voima −2, Armeija suosio +1 |
| N46 | Salainen poliisi paljastaa sissien soluverkoston | Sal.pol. voima ≥ 7 | Sissit voima −1, Sal.pol. suosio +1 |
| N47 | Sissit saavat amerikkalaisia aseita salaa | USA suosio ≤ 2 JA Venäjä suosio ≥ 5 | Sissit voima +2, USA suosio −1 |
| N48 | Kirkonmies tuomitsee diktatuurin saarnassaan | Talonp. suosio ≤ 3 JA Maanomist. suosio ≤ 3 | Sissit voima +1, Talonp. suosio −1 |

Symmetria: 4 korttia kasvattaa sissejä, 2 heikentää. Tämä heijastaa pelin filosofiaa — diktaattorin on helppo ärsyttää kansaa, vaikeampi pitää sitä tyytyväisenä. Sissit kasvavat luonnollisemmin kuin vähenevät.

# 8. Sota (V11: täysin uudistettu)
## 8.1 Sodan laukaisijat
Reitti 1 — Pikasota (A1):
A1 "Hyökkää sissien tukikohtiin Leftotossa" hyväksytään → Leftoto vastaa välittömästi. Ritimba on tässä se ensin ampuva osapuoli. Sota laukeaa SAMAN kuukauden uutisvaiheessa.
🆕 V11: A1-pikasota: ei N1-puskuria, ei velkaa. Kortin omat suosio- ja voimavaikutukset toteutuvat normaalisti, sitten sota ratkaistaan välittömästi. "Ei nostetta — ei laskua". A1 on armeijan operaatio joka aiheuttaa salama-vastareaktion.
Reitti 2 — Eskalaatio (P1 tai D16):
P1 "Lopeta Leftoton siirtotyöläiset" tai D16 "Kansallista Leftoton yritykset" hyväksytään → N1-eskalaatiokierre alkaa SAMAN kuukauden uutisvaiheesta.
Narratiivi: Leftotalaiset tulevat Ritimbaan maatöihin nälänhädän takia. P1 on moraalikysymys — kyse on konkreettisesta ihmisvirrasta. D16 puolestaan on suoraan provokaatio Leftoton talouseliittiä vastaan.
## 8.2 N1-eskalaatiokierre (V11: uusi)
Kun P1/D16 hyväksytään, N1 korvaa normaalin uutiskortin joka kuukausi kunnes sota syttyy tai Leftoto perääntyy. Joka N1-kierroksella tapahtuu järjestyksessä:
1. N1-uutinen näytetään: Armeija, Talonpojat ja Maanomistajat saavat kukin +1 suosiota. Pelaajalle näytetään dramaattinen viesti Leftoton uhasta.
2. Eskalaatio-heitto: Laukeaako sota tässä kuussa?
3. Perääntymisheitto: Jos sota ei lauennut, perääntyykö Leftoto?
4. Jos ei kumpaakaan: kierre jatkuu seuraavaan kuukauteen.
Eskalaatio-todennäköisyydet:

| N1-kierros | Sodan todennäköisyys | Perääntymisen todennäköisyys (jos ei sotaa) |
| --- | --- | --- |
| 1. | 40 % | 10 % |
| 2. | 60 % | 15 % |
| 3. | 85 % | 20 % |
| 4. | 100 % (pakko) | — |

Lopputulosjakauma:

| Lopputulos | Todennäköisyys | Pelaajan kokemus |
| --- | --- | --- |
| Sota syttyy (1.–4. N1) | ~90 % | Tavallisin reitti — pelaaja saa puskurin mutta velka tulee perään |
| Leftoto perääntyy (1.–3. N1) | ~10 % | Harvinainen ja muistettava — pelaaja saa pysyvän suosionnousun |

Perääntymisestä pelaajalle: "Leftoton johto perääntyy! Diplomaattiset lähteet kertovat että presidenttisi karismaattinen radiopuhe sai naapurimaan epäröimään. Kansa juhlii — diktaattori on osoittanut voimansa ilman verenvuodatusta!"
## 8.3 Sodan ratkaisu
🆕 V11: Ritimban puolella taistelevat KAIKKI ne ryhmät joiden suosio on vähintään 4. Henkivartijat eivät osallistu sotaan. Kunkin osallistuvan ryhmän voima lasketaan yhteen → Ritimban kokonaisvoima.
Voimalaskenta:
Ritimba: Σ (ryhmän voima) jokaisesta kotimaan ryhmästä jonka suosio ≥ 4
Leftoto: Leftoton voima + Sissien voima (sissit liittyvät aina mukaan)
Henkivartijat: EIVÄT mukana (sisäinen suoja, ei rajasota)
Lopputulos:
Ritimba ≥ Leftoto + Sissit → VOITTO
Leftoto + Sissit > Ritimba → TAPPIO → likvidaatio, peli päättyy
Esimerkki tasapainoisesta tilanteesta:
Lähtötilanne (Armeija 6, Talonpojat 6, Maanomistajat 6, kaikki suosio ≥ 4) → Ritimba 18 vs. Leftoto 6 + Sissit 6 = 12. Ritimba voittaa selvästi.
Esimerkki rapautuneesta tilanteesta:
Talonpoikien suosio 2 (ulos), Armeijalla ja Maanomistajilla voima 4 → Ritimba 8 vs. Leftoto 6 + Sissit 9 (Kuuba-buustin jälkeen) = 15. Ritimba häviää.
## 8.4 Sodan jälkitila ja velkavaihe (V11: uusi)
🆕 V11: Voitetun sodan jälkeen: Leftoton voima puolitetaan (pysyvä), REV STR piikkaa Ritimban sotavoiman tasolle ja palautuu 3 kk:ssa. LISÄKSI N1-kierre velka maksetaan: N1_kerrat kuukautta peräkkäin Armeija, Talonpojat ja Maanomistajat saavat −1 suosio per kk. Tämä mekaniikka pätee VAIN reitin 2 sotaan, ei A1-pikasotaan.
Velkavaiheen säännöt:
Aktivoituu vain kun N1-kierre laukaisi sodan ja Ritimba voitti
Kestää N1_kerrat kuukautta (esim. 2 N1:ä ennen sotaa → 2 kk velkaa)
Vaikutus: Armeija, Talonpojat, Maanomistajat suosio −1 per kk (kuukauden alussa, ennen kassaraporttia)
Pelaajan päätökset eivät pysäytä velkavaihetta — se on automaattinen taustamekaniikka
Jos toinen N1-kierre käynnistyy velkavaiheen aikana, velkalaskurit kasautuvat (vanha velka jatkuu, uusi puskuri kerääntyy)
Reittien vertailu:

| Reitti | Mekaniikka | Puskuri | Velka | Riski |
| --- | --- | --- | --- | --- |
| A1 pikasota | Sota saman kk:n uutisvaiheessa | Ei | Ei | Korkea — ei valmistautumista |
| Reitti 2 sota (~90 %) | 1–4 kk N1-eskalaatio | +1…+4 | Sama määrä takaisin | Hallittu — mutta Leftoto puolittuu |
| Reitti 2 perääntyminen (~10 %) | 1–3 N1:n jälkeen Leftoto luopuu | +1…+3 (pysyvä) | Ei velkaa | Onnekas yllätys |
| Sodan tappio | Ritimba ei voi voittaa | — | — | Likvidaatio, peli päättyy |

# 9. Vallankumous, Kaappaus ja Kapina
## 9.1 Termit ja käynnistäjät

| Termi | Käynnistäjä | Liittolaiset | Neuvottelu? | Sissit mukana? | Logiikka |
| --- | --- | --- | --- | --- | --- |
| KAAPPAUS | Armeija | Toiseksi tyytymättömin | Kyllä | Ei | Kenraali haluaa vallan. Eliitti, neuvoteltavissa. |
| KAPINA | Maanomistajat | Toiseksi tyytymättömin | Kyllä | Ei | Eliitti haluaa kontrollin. Neuvoteltavissa. |
| VALLANKUMOUS | Talonpojat | Toiseksi tyytymättömin + SISSIT | EI | Kyllä, automaattisesti | Kansa polttaa systeemin. Kansan kanssa ei voi neuvotella. |

🆕 V11: Sisseiden rooli kriiseissä: Sissit eivät auta eliittiä eivätkä armeijaa. He liittyvät VAIN talonpoikien vallankumoukseen. Tämä tekee vallankumouksesta käytännössä voittamattoman kun sissien voima on korkea (esim. N2 Kuuba-buustin jälkeen tai pitkään jatkuneen kansan sorron seurauksena).
Pelaajalle ei kerrota suoraan että vallankumous on voittamaton — piilotettu sääntö. Pelaaja oppii sen kantapään kautta epäonnistuneista peleistä.
## 9.2 Laukaisuehdot
Vähintään 2 ryhmää tyytymättömiä (suosio + voima ≥ 7) JA yhteisvoima ylittää pelaajan voiman (henkivartiokaarti + suosiollisin ryhmä).
## 9.3 Neuvottelumekaniikka (vain Kaappaus ja Kapina)
Uhkavaatimus ensin. Pelaaja valitsee: neuvottelu (D2, 50/50) tai taistele.
Neuvottelu onnistuu → kovat vaatimukset (hyväksy tai taistele)
Neuvottelu epäonnistuu → suoraan taisteluun
Hyväksytty vaatimus: käynnistäjä +1 suosio, muut ryhmät laskevat
Vallankumouksessa EI ole neuvotteluvaihetta. Talonpojat eivät neuvottele — peli siirtyy suoraan puolustusvalintaan.
## 9.4 Neuvotteluvaatimuskortit
Kaappaus — armeija (D2):

| # | Vaatimus | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| C1 | Nimitä kenraali varapresidentiksi | Armeija +1 | Armeija +3 | +5k/kk |
| C2 | Anna armeijalle täysi autonomia | Armeija +1, Talonp. −1, Maanomist. −1 | Armeija +2, Sissit −1 | — |

Kapina — maanomistajat (D2):

| # | Vaatimus | Suosiovaikutukset | Voimavaikutukset | Talous |
| --- | --- | --- | --- | --- |
| E1 | Kevennä maaverotusta merkittävästi | Maanomist. +1, Talonp. −2 | Maanomist. +1 | +8k/kk kulut |
| E2 | Salli yksityismilitioiden laillistaminen | Maanomist. +1, Armeija −1, Talonp. −2 | Maanomist. +3, Sissit −1 | — |

## 9.5 Puolustusvalinta (V11: uusi mekaniikka)
🆕 V11: Kun kriisi laukeaa (kaappaus, kapina TAI vallankumous), pelaajalle näytetään tilanne ja kysytään: "Ketä kutsut puolustamaan palatsia?". Listassa näkyvät VAIN ne ryhmät joiden suosio on ≥ 4. Ei numeroita, ei voimia, ei vihollisten voimaa — pelaaja valitsee MUISTINSA varassa. Henkivartijat ovat aina mukana automaattisesti.
Mekaniikka:
Pelaaja valitsee 1 puolustavan ryhmän käytettävissä olevista (suosio ≥ 4)
Henkivartijat (YOUR STRENGTH) ovat aina mukana
Pelaajan voima = Henkivartijat + valittu ryhmän voima
Vihollisen voima = Käynnistäjä + toiseksi tyytymättömin (+ Sissit jos vallankumous)
Pelaaja voittaa jos Pelaajan voima ≥ Vihollisen voima
Edge case: yksikään ryhmä ei kelpaa.
Jos kaikkien kotimaan ryhmien suosio on ≤ 3, pelaajalla ei ole ketään kutsuttavaa. Pakkotaistelu pelkillä henkivartijoilla — käytännössä häviö, mutta vahvistetut henkivartijat (D11 × 2 = voima 8) antavat teoreettisen mahdollisuuden selvitä jos vallankumousvoima on matala. "Viimeinen seisova mies palatsin portilla."
Pelaajan kokemus:
Tämä mekaniikka tekee salaisen poliisin raportista (1k/kk) yhtäkkiä paljon arvokkaamman: jos sinulla on tuore raportti, sinulla on numerot mielessäsi. Jos säästit nuo tuhannet, taistelet sokkona. D9 + D10 -strategia (lakkauta + vahvista salainen poliisi) muuttuu riskialttiimmaksi: jos lakkautat poliisin etkä vahvista sitä takaisin ennen kriisiä, taistelet ilman tietoa.
## 9.6 Taistelumekaniikka ja rangaistusvaihe
Selviytyminen kaappauksesta/kapinasta: ~25 % (D4, tulos 4).

| Valinta | Suosio | Voima | Merkki | Seuraus |
| --- | --- | --- | --- | --- |
| Kyllä — rankaise | → 0 | → 0 | A-merkki | Attentaattiuhka. Muut pelkäävät. |
| Ei — armahda | → 0 | Säilyy | Numeromerkki | Uusi uhka tulossa. Nähtään heikkoutena. |

# 10. Attentaatti
Laukaisuehto: suosio + voima ≤ 3. Joka kuukausi A-ryhmä heittää D3 — tulos 3 = attentaatti (~33 %). Useampi A-ryhmä = useampi heitto.

| Henkivartijoiden voima | Selviytyminen | Kuolema |
| --- | --- | --- |
| 4 (alkuarvo) | 50 % | 50 % |
| 6 (yksi korotus) | 75 % | 25 % |
| 8 (kaksi korotusta) | 90 % | 10 % |

# 11. Pako
A) Helikopteripako (vaatii D12):
75 % onnistuu → pako, Swiss mukana
25 % rikki → vuoristopako
B) Vuoristopako (aina saatavilla):
Sissien voima matala → pako onnistui
Sissien voima korkea → kiinni, likvidoitu
Sissit käytännössä aina uhka — helikopteri kannattaa ostaa ajoissa
Vallankumouksessa taistelu on häviövarma — ainoa järkevä valinta on pako. Kaappaus ja kapina voi voittaa neuvottelulla tai taistelulla.
# 12. Poliisiraportti
1 000 per raportti, ensimmäinen ilmainen. Näyttää kaikkien ryhmien suosio- ja voimapalkit, YOUR STRENGTH, STRENGTH FOR REVOLUTION, uhkaindikaattorit.
Ei saatavilla kun salaisen poliisin suosio ≤ 2 tai voima = 0, eikä myöskään kun kassa on tyhjä.
V11-painotus: kun kassakriisi katkaisee raporttiostot, pelaaja sokeutuu juuri silloin kun puolustusvalinta voisi laueta missä tahansa kuussa. Tämä luo pelin loppuvaiheen aidon paniikin.
# 13. Salaisen poliisin kaksiosainen strategia
Vaihe 1: D9 Lakkauta → kotimaat +3, Sal.pol. 0/0, kulut −8k/kk.
Vaihe 2: D10 Vahvista → Sal.pol. +8/+8, kotimaat −3, kulut +6k/kk.
Nettovaikutus: kotimaat ±0, Sal.pol. 0→8/8, kulut −2k/kk. N6 voi laukaista vaiheen 1 automaattisesti.
V11-huomio: D10:n vahvistus aktivoi N46:n ehdon (Sal.pol. voima ≥ 7) → passiivinen sissien heikennys. Tämä on lisäperuste D10:lle, mutta hinta on kotimaan suosioiden romahdus väliaikaisesti.

# 14. Pisteytys

| Komponentti | Laskukaava | Huomio |
| --- | --- | --- |
| Kokonaissuosio | Kaikkien ryhmien suosiot yhteensä | Max 72 (8 × 9) |
| Kuukaudet vallassa | Kuukaudet × 3 | — |
| Swiss-bonus | Swiss-tilin saldo / 10 000 | Vain jos pakenee hengissä |
| YHTEISPISTEET | Suosio + Kuukaudet + Swiss-bonus | — |
| Pisteet | Titteli | Kuvaus |
| 0–20 | Katastrofaalinen | Historia unohtaa sinut nopeasti |
| 21–40 | Lyhyt valtakausi | Muistetaan varoittavana esimerkkinä |
| 41–65 | Kunniakas pako | Selvisit hengissä ja varakkaana |
| 66–90 | Taitava diktaattori | Ritimba muistaa sinua kaiholla |
| 91+ | Legenda | Patsas pystyssä — toistaiseksi |

# 15. Pelin pituus ja lopettaminen (V11: uusi luku)
🆕 V11: Pelillä ei ole kovaa aikarajaa. Peli päättyy luonnollisesti johonkin lopetustapaan. Tasapainosimulaation perusteella mediaanipeli päättyy kuukausien 15–20 välillä.
Pelin lopetustavat:
Vallankumous (taistelu hävitty) → likvidaatio
Kaappaus / Kapina (neuvottelu hylätty + taistelu hävitty) → likvidaatio
Attentaatti onnistui → kuolema
Sodan tappio → likvidaatio
Pakeneminen helikopterilla tai vuorilla → selviytyminen, pisteet lasketaan
Kassakriisi pelin lopettajana:
Kassakriisi ei suoraan päätä peliä, mutta käynnistää negatiivisen ketjureaktion: rahalliset audienssit muuttuvat pakko-EI:ksi → suosiot laskevat → useammat ryhmät tyytymättömiksi → vallankumous/kaappaus/kapina lähenee. Tyypillisesti 3–5 kk kassakriisistä peli päättyy.
Tasapainosimulaation tulokset (1000 peliä):

| Mittari | Arvo |
| --- | --- |
| Kassakriisin mediaanikuukausi | 15 |
| Kassakriisin esiintymistiheys (24 kk simulaatiossa) | 98 % |
| Loppukassan mediaani | −399 000 |
| Swiss-saldon mediaani | 184 000 |
| Pelejä joissa ainakin yksi sota | 71 % |
| Pakohelikopteri ostettu | 33 % |

Huom: simulaatio mallintaa vain kassakriisiä, ei muita lopetustapoja. Todellisissa peleissä monet päättyvät ennen kassakriisiä vallankumoukseen, attentaattiin tai vastaaviin uhkiin. Eliittipelaajat (jotka pitävät kassan terveenä eivätkä ärsytä ryhmiä) voivat venyttää pelin yli 24 kuukauteen.

— GDD V11 — Huhtikuu 2026 —
42 audienssikorttia | 48 uutistapahtumaa | 19 presidentin päätöstä | Valmis toteutukseen.