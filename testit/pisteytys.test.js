const test = require("node:test");
const assert = require("node:assert/strict");
const {
  laskeKokonaissuosio,
  laskeKuukausibonus,
  laskeSwissBonus,
  laskeTitteli,
  laskePisteet
} = require("../js/moottori/pisteytys.js");

function uusiTila(yliajot) {
  return Object.assign({
    kuukausi: 10,
    sveitsinTili: 0,
    ryhmat: {
      armeija: { suosio: 7, voima: 6 },
      talonpojat: { suosio: 7, voima: 6 },
      maanomistajat: { suosio: 7, voima: 6 },
      sissit: { suosio: 0, voima: 6 },
      leftoto: { suosio: 7, voima: 6 },
      salainenPoliisi: { suosio: 7, voima: 6 },
      venaja: { suosio: 7, voima: 0 },
      usa: { suosio: 7, voima: 0 }
    }
  }, yliajot);
}

test("laskeKokonaissuosio summaa kaikkien 8 ryhmän suosion", () => {
  const tila = uusiTila();
  assert.equal(laskeKokonaissuosio(tila), 7 * 7); // 7 ryhmää suosiolla 7, sissit 0
});

test("laskeKokonaissuosio maksimi on 72 (8x9)", () => {
  const tila = uusiTila();
  for (const avain in tila.ryhmat) tila.ryhmat[avain].suosio = 9;
  assert.equal(laskeKokonaissuosio(tila), 72);
});

test("laskeKuukausibonus on kuukaudet kertaa kolme", () => {
  const tila = uusiTila({ kuukausi: 15 });
  assert.equal(laskeKuukausibonus(tila), 45);
});

test("laskeSwissBonus on nolla jos ei paennut hengissä", () => {
  const tila = uusiTila({ sveitsinTili: 500000 });
  assert.equal(laskeSwissBonus(tila, false), 0);
});

test("laskeSwissBonus on saldo/10000 jos pakeni hengissä", () => {
  const tila = uusiTila({ sveitsinTili: 498000 });
  assert.equal(laskeSwissBonus(tila, true), 49.8);
});

test("laskeTitteli GDD 14:n rajojen mukaan", () => {
  assert.equal(laskeTitteli(0).titteli, "Katastrofaalinen");
  assert.equal(laskeTitteli(20).titteli, "Katastrofaalinen");
  assert.equal(laskeTitteli(21).titteli, "Lyhyt valtakausi");
  assert.equal(laskeTitteli(40).titteli, "Lyhyt valtakausi");
  assert.equal(laskeTitteli(41).titteli, "Kunniakas pako");
  assert.equal(laskeTitteli(65).titteli, "Kunniakas pako");
  assert.equal(laskeTitteli(66).titteli, "Taitava diktaattori");
  assert.equal(laskeTitteli(90).titteli, "Taitava diktaattori");
  assert.equal(laskeTitteli(91).titteli, "Legenda");
  assert.equal(laskeTitteli(200).titteli, "Legenda");
});

test("laskePisteet yhdistää kaikki komponentit oikein", () => {
  const tila = uusiTila({ kuukausi: 20, sveitsinTili: 200000 });
  const pisteet = laskePisteet(tila, true);
  assert.equal(pisteet.suosio, 49); // 7*7
  assert.equal(pisteet.kuukaudet, 60); // 20*3
  assert.equal(pisteet.swiss, 20); // 200000/10000
  assert.equal(pisteet.yhteensa, 129);
  assert.equal(pisteet.titteli.titteli, "Legenda");
});

test("laskePisteet ilman hengissä pakoa jättää swiss-bonuksen pois", () => {
  const tila = uusiTila({ kuukausi: 20, sveitsinTili: 200000 });
  const pisteet = laskePisteet(tila, false);
  assert.equal(pisteet.swiss, 0);
  assert.equal(pisteet.yhteensa, 109); // 49 + 60
});
