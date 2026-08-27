const test = require("node:test");
const assert = require("node:assert/strict");
const { paatoskortit } = require("../js/data/paatokset.js");
const {
  suurvaltaAvunSumma,
  onkoPaatosKaytettavissa,
  siirraSveitsinTilille,
  toteutaPaatos
} = require("../js/moottori/paatokset.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kuukausikulut: 45000,
    sveitsinTili: 0,
    kassakriisi: false,
    henkivartijoidenVoima: 4,
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
    kaytetytPaatokset: []
  }, yliajot);
}

test("päätöksiä on GDD:n mukainen 19 kappaletta", () => {
  assert.equal(paatoskortit.length, 19);
});

test("suurvalta-avun summataulukko GDD 3.4:n mukaisesti", () => {
  assert.equal(suurvaltaAvunSumma(0), 0);
  assert.equal(suurvaltaAvunSumma(-3), 0);
  assert.equal(suurvaltaAvunSumma(1), 50000);
  assert.equal(suurvaltaAvunSumma(3), 50000);
  assert.equal(suurvaltaAvunSumma(4), 130000);
  assert.equal(suurvaltaAvunSumma(5), 200000);
  assert.equal(suurvaltaAvunSumma(6), 200000);
  assert.equal(suurvaltaAvunSumma(7), 270000);
  assert.equal(suurvaltaAvunSumma(8), 270000);
  assert.equal(suurvaltaAvunSumma(9), 330000);
});

test("D14 Venäjä-apu käyttää suosioeroa venäjä - usa", () => {
  const tila = uusiTila();
  tila.ryhmat.venaja.suosio = 9;
  tila.ryhmat.usa.suosio = 4; // ero 5 -> 200000
  const d14 = paatoskortit.find(p => p.id === "D14");
  const tulos = toteutaPaatos(tila, d14);
  assert.equal(tulos.apu, 200000);
  assert.equal(tila.kassa, 1000000 + 200000);
  assert.equal(tila.kaytetytPaatokset.includes("D14"), true);
});

test("D15 USA-apu on 0 kun suosioero on väärään suuntaan", () => {
  const tila = uusiTila();
  tila.ryhmat.venaja.suosio = 9;
  tila.ryhmat.usa.suosio = 2;
  const d15 = paatoskortit.find(p => p.id === "D15");
  const tulos = toteutaPaatos(tila, d15);
  assert.equal(tulos.apu, 0);
  assert.equal(tila.kassa, 1000000);
});

test("D11 vahvistaa henkivartijoiden voimaa +2 ja on toistuva", () => {
  const tila = uusiTila();
  const d11 = paatoskortit.find(p => p.id === "D11");
  toteutaPaatos(tila, d11);
  assert.equal(tila.henkivartijoidenVoima, 6);
  assert.equal(tila.kassa, 1000000 - 40000);
  assert.equal(tila.kaytetytPaatokset.includes("D11"), false); // toistuva, ei merkitä käytetyksi
  assert.equal(onkoPaatosKaytettavissa(tila, d11), true); // voi käyttää uudelleen
});

test("D13 siirtää puolet kassasta Sveitsiin, pyöristys tuhansiin, miinus 2000", () => {
  const tila = uusiTila({ kassa: 101500 });
  const tulos = siirraSveitsinTilille(tila);
  // puoli = 50750, pyöristetty = 50000, netto = 48000
  assert.equal(tulos.onnistui, true);
  assert.equal(tulos.siirretty, 48000);
  assert.equal(tila.kassa, 101500 - 50000);
  assert.equal(tila.sveitsinTili, 48000);
});

test("D13 estyy kun kassa on 2000 tai alle", () => {
  const tila = uusiTila({ kassa: 2000 });
  const tulos = siirraSveitsinTilille(tila);
  assert.equal(tulos.onnistui, false);
  assert.equal(tila.kassa, 2000);
  assert.equal(tila.sveitsinTili, 0);
});

test("kertaluontoinen päätös kuluu käytössä eikä ole enää käytettävissä", () => {
  const tila = uusiTila();
  const d1 = paatoskortit.find(p => p.id === "D1");
  assert.equal(onkoPaatosKaytettavissa(tila, d1), true);
  toteutaPaatos(tila, d1);
  assert.equal(tila.ryhmat.armeija.suosio, 9); // 7+4 rajautuu 9:ään
  assert.equal(onkoPaatosKaytettavissa(tila, d1), false);
});

test("rahallinen päätös lukittuu kassakriisissä", () => {
  const tila = uusiTila({ kassakriisi: true });
  const d8 = paatoskortit.find(p => p.id === "D8"); // -80k
  const d7 = paatoskortit.find(p => p.id === "D7"); // ei kertaluontoista kulua
  assert.equal(onkoPaatosKaytettavissa(tila, d8), false);
  assert.equal(onkoPaatosKaytettavissa(tila, d7), true);
});

test("D9 lakkauttaa salaisen poliisin (suosio ja voima 0:aan asti rajautuen)", () => {
  const tila = uusiTila();
  const d9 = paatoskortit.find(p => p.id === "D9");
  toteutaPaatos(tila, d9);
  assert.equal(tila.ryhmat.salainenPoliisi.suosio, 0); // 7-9 rajautuu 0:aan
  assert.equal(tila.ryhmat.salainenPoliisi.voima, 0);
  assert.equal(tila.kuukausikulut, 45000 - 8000);
});
