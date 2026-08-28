const test = require("node:test");
const assert = require("node:assert/strict");
const {
  POLIISIRAPORTTI_HINTA,
  NAKYVYYSKYNNYS,
  palautaSalaisenPoliisinSuosio,
  uhkaindikaattori,
  poliisiraportinSaatavuus,
  luoPoliisiraportti,
  ostaPoliisiraportti
} = require("../js/moottori/poliisiraportti.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kassakriisi: false,
    henkivartijoidenVoima: 4,
    vallankumousvoima: 10,
    poliisiraporttiOstettu: false,
    ryhmat: {
      armeija: { nimi: "Armeija", suosio: 7, voima: 6 },
      talonpojat: { nimi: "Talonpojat", suosio: 7, voima: 6 },
      maanomistajat: { nimi: "Maanomistajat", suosio: 7, voima: 6 },
      sissit: { nimi: "Sissit", suosio: 0, voima: 6 },
      leftoto: { nimi: "Leftoto", suosio: 7, voima: 6 },
      salainenPoliisi: { nimi: "Salainen poliisi", suosio: 7, voima: 6 },
      venaja: { nimi: "Venäjä", suosio: 7, voima: 0 },
      usa: { nimi: "Yhdysvallat", suosio: 7, voima: 0 }
    }
  }, yliajot);
}

test("GDD 12: ensimmäinen raportti on ilmainen, seuraavat maksavat 1 000", () => {
  const tila = uusiTila();
  const eka = poliisiraportinSaatavuus(tila);
  assert.equal(eka.saatavilla, true);
  assert.equal(eka.ilmainen, true);
  assert.equal(eka.hinta, 0);

  ostaPoliisiraportti(tila);
  assert.equal(tila.kassa, 1000000); // ilmainen ei veloita

  const toka = poliisiraportinSaatavuus(tila);
  assert.equal(toka.ilmainen, false);
  assert.equal(toka.hinta, POLIISIRAPORTTI_HINTA);

  ostaPoliisiraportti(tila);
  assert.equal(tila.kassa, 999000);
});

test("GDD 12: raportti ei ole saatavilla kun salaisen poliisin suosio <= 2", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.suosio = 2;
  const saatavuus = poliisiraportinSaatavuus(tila);
  assert.equal(saatavuus.saatavilla, false);
  assert.ok(saatavuus.syy);
  assert.equal(ostaPoliisiraportti(tila), null);
});

test("GDD 12: raportti ei ole saatavilla kun salaisen poliisin voima = 0", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.voima = 0;
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);
});

test("GDD 3.6: kassakriisi estää raportin oston - pelaaja sokeutuu", () => {
  const tila = uusiTila({ poliisiraporttiOstettu: true, kassakriisi: true, kassa: -5000 });
  const saatavuus = poliisiraportinSaatavuus(tila);
  assert.equal(saatavuus.saatavilla, false);
  assert.equal(ostaPoliisiraportti(tila), null);
});

test("kassakriisi ei estä vielä käyttämätöntä ilmaista raporttia", () => {
  const tila = uusiTila({ kassakriisi: true, kassa: -5000 });
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, true);
});

test("liian pieni kassa estää maksullisen raportin", () => {
  const tila = uusiTila({ poliisiraporttiOstettu: true, kassa: 500 });
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);
});

test("GDD 12: raportti näyttää kaikki ryhmät, YOUR STRENGTH ja REV STR", () => {
  const tila = uusiTila({ henkivartijoidenVoima: 8, vallankumousvoima: 14 });
  const raportti = luoPoliisiraportti(tila);
  assert.equal(raportti.rivit.length, 8);
  assert.equal(raportti.omaVoima, 8);
  assert.equal(raportti.vallankumousvoima, 14);
  const armeija = raportti.rivit.find(r => r.avain === "armeija");
  assert.equal(armeija.suosio, 7);
  assert.equal(armeija.voima, 6);
});

test("GDD 2.4: aloitusarvoilla yksikään ryhmä ei saa uhkamerkkiä", () => {
  const tila = uusiTila();
  for (const avain in tila.ryhmat) {
    assert.equal(uhkaindikaattori(tila, avain), null, avain);
  }
});

test("GDD 2.4: kirjain A kun suosio + voima <= 3", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1;
  tila.ryhmat.armeija.voima = 2;
  assert.equal(uhkaindikaattori(tila, "armeija"), "A");
});

test("GDD 2.4: numeromerkki kun voima on suosiota korkeampi kynnyksen verran", () => {
  const tila = uusiTila();
  tila.ryhmat.talonpojat.suosio = 2;
  tila.ryhmat.talonpojat.voima = 7; // tyytymättömyys 5 >= kynnys 3
  assert.equal(uhkaindikaattori(tila, "talonpojat"), "5");
});

test("attentaattiuhka (A) menee kriisiuhan (numero) edelle", () => {
  const tila = uusiTila();
  tila.ryhmat.maanomistajat.suosio = 0;
  tila.ryhmat.maanomistajat.voima = 3; // suosio+voima = 3 -> A, mutta myös tyytymättömyys 3
  assert.equal(uhkaindikaattori(tila, "maanomistajat"), "A");
});

test("uhkamerkkiä ei anneta ryhmille jotka eivät voi laukaista kriisiä tai attentaattia", () => {
  const tila = uusiTila();
  // Sissien suosio on pysyvästi 0, joten ne täyttäisivät kaavat mutta eivät voi toimia uhkana.
  tila.ryhmat.sissit.voima = 2; // suosio+voima = 2
  assert.equal(uhkaindikaattori(tila, "sissit"), null);
  tila.ryhmat.leftoto.suosio = 0;
  tila.ryhmat.leftoto.voima = 9;
  assert.equal(uhkaindikaattori(tila, "leftoto"), null);
});

test("salainen poliisi voi saada A-merkin muttei numeromerkkiä", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.suosio = 1;
  tila.ryhmat.salainenPoliisi.voima = 1;
  assert.equal(uhkaindikaattori(tila, "salainenPoliisi"), "A");

  const tila2 = uusiTila();
  tila2.ryhmat.salainenPoliisi.suosio = 3;
  tila2.ryhmat.salainenPoliisi.voima = 9; // tyytymättömyys 6, mutta ei kriisikykyinen
  assert.equal(uhkaindikaattori(tila2, "salainenPoliisi"), null);
});

test("salaisen poliisin suosio palautuu +1/kk kunnes raportti on taas saatavilla", () => {
  const tila = uusiTila({ poliisiraporttiOstettu: true });
  tila.ryhmat.salainenPoliisi.suosio = 0;
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);

  // Nollasta kolmeen kuukauteen: "rapsa tulee näkyviin muutaman vuoron jälkeen".
  assert.equal(palautaSalaisenPoliisinSuosio(tila), true);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, 1);
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);

  palautaSalaisenPoliisinSuosio(tila);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, 2);
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);

  palautaSalaisenPoliisinSuosio(tila);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, NAKYVYYSKYNNYS);
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, true);
});

test("palautuminen pysähtyy näkyvyyskynnykseen eikä nosta suosiota sen yli", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.suosio = NAKYVYYSKYNNYS;
  assert.equal(palautaSalaisenPoliisinSuosio(tila), false);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, NAKYVYYSKYNNYS);

  tila.ryhmat.salainenPoliisi.suosio = 7;
  assert.equal(palautaSalaisenPoliisinSuosio(tila), false);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, 7);
});

test("palautuminen ei koske voimaa - D9:n lakkautus pitää raportin lukossa (GDD 13)", () => {
  const tila = uusiTila({ poliisiraporttiOstettu: true });
  tila.ryhmat.salainenPoliisi.suosio = 0;
  tila.ryhmat.salainenPoliisi.voima = 0; // D9 lakkauttaa: 0/0

  for (let kk = 0; kk < 10; kk++) palautaSalaisenPoliisinSuosio(tila);

  assert.equal(tila.ryhmat.salainenPoliisi.voima, 0);
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);
});

test("toipunut poliisi ei silti anna raporttia jos kassa on tyhjä", () => {
  const tila = uusiTila({ poliisiraporttiOstettu: true, kassakriisi: true, kassa: 0 });
  tila.ryhmat.salainenPoliisi.suosio = NAKYVYYSKYNNYS;
  assert.equal(poliisiraportinSaatavuus(tila).saatavilla, false);
  assert.equal(poliisiraportinSaatavuus(tila).syy, "Kassa ei riitä raportin ostoon.");
});

test("ostettu raportti merkitsee lipun eikä toinen osto ole enää ilmainen", () => {
  const tila = uusiTila();
  const raportti = ostaPoliisiraportti(tila);
  assert.ok(raportti);
  assert.equal(tila.poliisiraporttiOstettu, true);
});
