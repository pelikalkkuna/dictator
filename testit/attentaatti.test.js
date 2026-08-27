const test = require("node:test");
const assert = require("node:assert/strict");
const {
  onkoAttentaattiuhka,
  laskeAUhkaRyhmat,
  selviytymistodennakoisyys,
  tarkistaAttentaattiyritys,
  ratkaiseAttentaatti
} = require("../js/moottori/attentaatti.js");

function uusiTila(yliajot) {
  return Object.assign({
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
    }
  }, yliajot);
}

test("onkoAttentaattiuhka: suosio+voima <= 3 on uhka, muuten ei", () => {
  assert.equal(onkoAttentaattiuhka({ suosio: 2, voima: 1 }), true);
  assert.equal(onkoAttentaattiuhka({ suosio: 0, voima: 3 }), true);
  assert.equal(onkoAttentaattiuhka({ suosio: 2, voima: 2 }), false);
});

test("laskeAUhkaRyhmat: aloitusarvoilla ei uhkia (suosio7+voima6=13)", () => {
  const tila = uusiTila();
  assert.deepEqual(laskeAUhkaRyhmat(tila), []);
});

test("laskeAUhkaRyhmat: löytää useamman A-ryhmän ja jättää sissit/leftoto/suurvallat huomiotta", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 1; // 2, uhka
  tila.ryhmat.salainenPoliisi.suosio = 0; tila.ryhmat.salainenPoliisi.voima = 0; // 0, uhka
  tila.ryhmat.sissit.suosio = 0; tila.ryhmat.sissit.voima = 0; // uhka-arvoinen mutta ei kotimaan ryhmä
  const uhat = laskeAUhkaRyhmat(tila);
  assert.deepEqual(uhat.sort(), ["armeija", "salainenPoliisi"].sort());
});

test("selviytymistodennakoisyys: GDD:n kolme pistettä täsmälleen", () => {
  assert.equal(selviytymistodennakoisyys(4), 0.50);
  assert.equal(selviytymistodennakoisyys(6), 0.75);
  assert.equal(selviytymistodennakoisyys(8), 0.90);
});

test("selviytymistodennakoisyys: yli 8:n käyttää viimeistä tunnettua arvoa", () => {
  assert.equal(selviytymistodennakoisyys(10), 0.90);
  assert.equal(selviytymistodennakoisyys(20), 0.90);
});

test("tarkistaAttentaattiyritys: ei uhkaryhmiä -> ei heittoja eikä yritystä", () => {
  const tila = uusiTila();
  const tulos = tarkistaAttentaattiyritys(tila, () => 3);
  assert.equal(tulos.heittoja, 0);
  assert.equal(tulos.tapahtuiko, false);
});

test("tarkistaAttentaattiyritys: yksi uhkaryhmä, D3=3 laukaisee yrityksen", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 1;
  const tulos = tarkistaAttentaattiyritys(tila, () => 3);
  assert.equal(tulos.heittoja, 1);
  assert.equal(tulos.tapahtuiko, true);
});

test("tarkistaAttentaattiyritys: D3 ei 3 -> ei yritystä", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 1;
  const tulos = tarkistaAttentaattiyritys(tila, () => 1);
  assert.equal(tulos.tapahtuiko, false);
});

test("tarkistaAttentaattiyritys: useampi uhkaryhmä heittää useamman kerran", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 1;
  tila.ryhmat.talonpojat.suosio = 0; tila.ryhmat.talonpojat.voima = 0;
  let kutsuja = 0;
  const tulos = tarkistaAttentaattiyritys(tila, () => { kutsuja += 1; return 1; });
  assert.equal(tulos.heittoja, 2);
  assert.equal(kutsuja, 2);
});

test("ratkaiseAttentaatti: alle todennäköisyyden -> selviytyy", () => {
  const tila = uusiTila({ henkivartijoidenVoima: 4 });
  const tulos = ratkaiseAttentaatti(tila, () => 0.49);
  assert.equal(tulos.selvisi, true);
});

test("ratkaiseAttentaatti: yli todennäköisyyden -> kuolee", () => {
  const tila = uusiTila({ henkivartijoidenVoima: 4 });
  const tulos = ratkaiseAttentaatti(tila, () => 0.51);
  assert.equal(tulos.selvisi, false);
});

test("ratkaiseAttentaatti: vahvistetut henkivartijat parantavat selviytymistä", () => {
  const tila = uusiTila({ henkivartijoidenVoima: 8 });
  const tulos = ratkaiseAttentaatti(tila, () => 0.85); // alle 90%, yli 50%/75%
  assert.equal(tulos.selvisi, true);
});
