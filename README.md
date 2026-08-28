# Dictator — Ritimban Tasavalta

Vuoropohjainen selviytymisstrategia, jossa pelaaja on 1960–70-luvun latinalaisamerikkalaisen
Ritimban tasavallan diktaattori. Selainpohjainen moderni remake Don Priestleyn ja Andy Frenchin
pelistä *Dictator* (DKTronics, 1983 — Commodore 64 / ZX Spectrum).

**Pelaa: https://pelikalkkuna.github.io/dictator/**

> Diktatuuri päättyy aina huonosti. Kysymys ei ole voitatko, vaan kuinka pitkään selviät.

## Pelistä

Jokainen vuoro on yksi kuukausi, joka etenee kuudessa vaiheessa: kassaraportti, poliisiraportti,
audienssi, presidentin päätös, uutiset ja poliisiraportti. Kahdeksan ryhmää — armeija, talonpojat,
maanomistajat, sissit, Leftoto, salainen poliisi, Venäjä ja Yhdysvallat — seuraavat tekojasi
suosio- ja voimamittareilla.

Et näe mittareita ilmaiseksi. Tilannekuvan saa vain ostamalla salaisen poliisin raportin, ja jos
poliisin suosio romahtaa tai kassa kuivuu, sokeudut. Kun vallankumous sitten laukeaa, valitset
puolustajasi muistisi varassa.

Sisältö: 42 audienssikorttia, 19 presidentin päätöstä, 48 uutistapahtumaa, sota Leftotoa vastaan,
vallankumous / kaappaus / kapina, attentaatit, pakohelikopteri ja Sveitsin pankkitili.

## Tekniikka

Vanilla HTML / CSS / JavaScript, ei frameworkeja eikä riippuvuuksia. Pelin tila on yksi
JavaScript-objekti, korttidata erillään pelilogiikasta, ja jokainen moottorimoduuli toimii sekä
selaimessa että Node-testeissä samalla tiedostolla.

```
js/pelitila.js      pelin tila
js/data/            korttidata (audienssit, päätökset, uutiset, kriisikortit)
js/moottori/        sääntölogiikka moduuleittain
js/nakyma/          piirto, äänet, kuvat
js/paa.js           käynnistys ja tapahtumankäsittely
```

## Kehitys

Peli on staattinen sivusto — avaa `index.html` selaimessa tai aja paikallinen palvelin:

```sh
python3 -m http.server 8000
```

Testit (Node.js:n sisäänrakennettu testikehys, ei ulkoisia kirjastoja):

```sh
node --test testit/*.test.js
```

Testit vahtivat pelin numeerisia sääntöjä — kassalaskentaa, mittarien rajausta, korttien
vaikutuksia, sodan ja kriisien ratkaisua, pisteytystä. Ne ajetaan automaattisesti ennen jokaista
julkaisua, eikä peli mene tuotantoon jos jokin niistä hajoaa.

Työkalut:

```sh
node tyokalut/luo-kuvaluettelo.js   # päivittää kuvat/LUETTELO.md
python3 tyokalut/paketoi.py         # kokoaa pelin yhdeksi HTML-tiedostoksi
```

## Dokumentaatio

- `docs/GDD.md` — pelisuunnitteludokumentti, pelin sääntöjen lähde
- `CLAUDE.md` — projektin työtavat ja sessioiden väliset muistiinpanot
- `kuvat/LUETTELO.md` — tapahtumakuvien tarkistuslista ja koot
