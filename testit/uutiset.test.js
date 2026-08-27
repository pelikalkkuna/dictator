const test = require("node:test");
const assert = require("node:assert/strict");
const { uutiskortit } = require("../js/data/uutiset.js");
const {
  luoUutispakka,
  nostaUutinen,
  sovellaUutinen,
  etsiUutinen
} = require("../js/moottori/uutiset.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kuukausikulut: 45000,
    ryhmat: {
      armeija: { suosio: 7, voima: 6 },
      talonpojat: { suosio: 7, voima: 6 },
      maanomistajat: { suosio: 7, voima: 6 },
      sissit: { suosio: 0, voima: 6 },
      leftoto: { suosio: 7, voima: 6 },
      salainenPoliisi: { suosio: 7, voima: 6 },
      venaja: { suosio: 7, voima: 0 },
      usa: { suosio: 7, voima: 0 }
    },
    uutispakka: luoUutispakka(uutiskortit)
  }, yliajot);
}

test("uutiskortteja on GDD:n mukaiset 48 (7 isoa + 35 pientä + 6 ehdollista)", () => {
  assert.equal(uutiskortit.isot.length, 7);
  assert.equal(uutiskortit.pienet.length, 35);
  assert.equal(uutiskortit.ehdolliset.length, 6);
  const kaikki = uutiskortit.isot.length + uutiskortit.pienet.length + uutiskortit.ehdolliset.length;
  assert.equal(kaikki, 48);
});

test("N1 nostaa kotimaan ryhmien suosiota ja palaa pakkaan", () => {
  const tila = uusiTila();
  const n1 = etsiUutinen(uutiskortit, "N1");
  sovellaUutinen(tila, n1);
  assert.equal(tila.ryhmat.armeija.suosio, 8);
  assert.equal(tila.ryhmat.talonpojat.suosio, 8);
  assert.equal(tila.ryhmat.maanomistajat.suosio, 8);
  assert.equal(tila.ryhmat.leftoto.suosio, 7); // ei muutu
});

test("N2 asettaa sissien voiman suoraan 9:ään", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 2;
  const n2 = etsiUutinen(uutiskortit, "N2");
  sovellaUutinen(tila, n2);
  assert.equal(tila.ryhmat.sissit.voima, 9);
});

test("N6 nollaa salaisen poliisin suosion ja voiman", () => {
  const tila = uusiTila();
  const n6 = etsiUutinen(uutiskortit, "N6");
  sovellaUutinen(tila, n6);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, 0);
  assert.equal(tila.ryhmat.salainenPoliisi.voima, 0);
});

test("N7 puolittaa Leftoton voiman pyöristäen alas", () => {
  const tila = uusiTila();
  tila.ryhmat.leftoto.voima = 7;
  const n7 = etsiUutinen(uutiskortit, "N7");
  sovellaUutinen(tila, n7);
  assert.equal(tila.ryhmat.leftoto.voima, 3); // floor(7/2)
});

test("N3/N5 eivät vielä tee mitään (odottavat sotaa / Sasun vahvistusta)", () => {
  const tila = uusiTila();
  const alkuperainenKassa = tila.kassa;
  for (const id of ["N3", "N5"]) {
    sovellaUutinen(tila, etsiUutinen(uutiskortit, id));
  }
  assert.equal(tila.kassa, alkuperainenKassa);
  assert.equal(tila.ryhmat.armeija.voima, 6);
});

test("N4 puolittaa armeijan voiman pyöristäen alas", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.voima = 7;
  sovellaUutinen(tila, etsiUutinen(uutiskortit, "N4"));
  assert.equal(tila.ryhmat.armeija.voima, 3); // floor(7/2)
});

test("N4 ei koskaan puolita alle 1:n", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.voima = 1;
  sovellaUutinen(tila, etsiUutinen(uutiskortit, "N4"));
  assert.equal(tila.ryhmat.armeija.voima, 1); // floor(1/2)=0, mutta pidetään 1:ssä
});

test("N4 jättää voiman 0:aan jos se on jo 0", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.voima = 0;
  sovellaUutinen(tila, etsiUutinen(uutiskortit, "N4"));
  assert.equal(tila.ryhmat.armeija.voima, 0);
});

test("tavallinen pieni uutinen (N8) soveltaa suosion ja talouden", () => {
  const tila = uusiTila();
  const n8 = etsiUutinen(uutiskortit, "N8");
  sovellaUutinen(tila, n8);
  assert.equal(tila.ryhmat.talonpojat.suosio, 9);
  assert.equal(tila.ryhmat.leftoto.suosio, 6);
  assert.equal(tila.kassa, 1000000 - 10000);
});

test("N43 laukeaa vain kun ehto (talonpojat suosio <= 2) täyttyy", () => {
  const tila = uusiTila();
  tila.ryhmat.talonpojat.suosio = 5;
  tila.uutispakka = []; // vain toistuvat jäljellä, pakotetaan N43 nostettavaksi
  // heittoFn joka valitsee aina ensimmäisen toistuvan (N1) kunnes N43 löytyy manuaalisesti testataan sovellalla suoraan
  const n43 = etsiUutinen(uutiskortit, "N43");
  assert.equal(n43.ehto(tila), false);
  tila.ryhmat.talonpojat.suosio = 2;
  assert.equal(n43.ehto(tila), true);
  sovellaUutinen(tila, n43);
  assert.equal(tila.ryhmat.sissit.voima, 8);
  assert.equal(tila.ryhmat.talonpojat.voima, 5);
});

test("nostaUutinen ohittaa ehdollisen kortin jonka ehto ei täyty ja nostaa toisen", () => {
  const tila = uusiTila(); // uutispakka täynnä (41 kertakäyttöistä), suosiot oletusarvoissa (7)
  // N48:n ehto (talonp. suosio <= 3 JA maanomist. suosio <= 3) ei täyty oletusarvoilla (7, 7).
  // Pooli on 41 + 7 toistuvaa = 48. Indeksi 47 osuu viimeiseen toistuvaan (N48, järjestyksessä
  // N1, N43, N44, N45, N46, N47, N48). Ensimmäinen heitto osuu siihen; toinen heitto (0) osuu
  // pakan ensimmäiseen kertakäyttöiseen korttiin (N2), koska N48 ei kuluttanut mitään pakasta.
  let kutsu = 0;
  const heittoFn = () => {
    kutsu += 1;
    return kutsu === 1 ? (47 / 48 + 0.0001) : 0;
  };
  const kortti = nostaUutinen(tila, uutiskortit, heittoFn);
  assert.notEqual(kortti.id, "N48");
  assert.equal(kortti.id, "N2");
  assert.equal(kutsu, 2);
});

test("nostaUutinen kuluttaa kertakäyttöisen kortin pakasta", () => {
  const tila = uusiTila();
  const alkuperainenMaara = tila.uutispakka.length;
  const kortti = nostaUutinen(tila, uutiskortit, () => 0); // indeksi 0 -> ensimmäinen pakan kortti
  assert.equal(tila.uutispakka.length, alkuperainenMaara - 1);
  assert.equal(tila.uutispakka.includes(kortti.id), false);
});

test("nostaUutinen täyttää pakan uudelleen kun kertakäyttöiset loppuvat", () => {
  const tila = uusiTila();
  tila.uutispakka = []; // simuloi tyhjentynyttä pakkaa
  const kertakayttoistenMaara = uutiskortit.isot.filter(k => !k.toistuva).length + uutiskortit.pienet.length;
  nostaUutinen(tila, uutiskortit, () => 0); // indeksi 0 -> täytön jälkeen ensimmäinen kortti kuluu
  assert.equal(tila.uutispakka.length, kertakayttoistenMaara - 1);
});
