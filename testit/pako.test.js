const test = require("node:test");
const assert = require("node:assert/strict");
const { yritaVuoristopako, yritaHelikopteripako, pakene } = require("../js/moottori/pako.js");

function uusiTila(yliajot) {
  return Object.assign({
    helikopteriOstettu: false,
    ryhmat: {
      sissit: { suosio: 0, voima: 6 }
    }
  }, yliajot);
}

test("yritaVuoristopako onnistuu kun sissien voima on matala", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 2;
  assert.equal(yritaVuoristopako(tila).onnistui, true);
});

test("yritaVuoristopako epäonnistuu kun sissien voima on korkea", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 6;
  assert.equal(yritaVuoristopako(tila).onnistui, false);
});

test("yritaHelikopteripako onnistuu 75% todennäköisyydellä suoraan", () => {
  const tila = uusiTila();
  const tulos = yritaHelikopteripako(tila, () => 0.5); // < 0.75
  assert.equal(tulos.onnistui, true);
  assert.equal(tulos.reitti, "helikopteri");
});

test("yritaHelikopteripako: rikkoutunut helikopteri johtaa vuoristopakoon varareittinä", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 1; // vuoristopako onnistuisi
  const tulos = yritaHelikopteripako(tila, () => 0.9); // >= 0.75 -> rikki
  assert.equal(tulos.onnistui, true);
  assert.equal(tulos.reitti, "vuoristo (helikopteri rikki)");
});

test("yritaHelikopteripako: rikkoutunut helikopteri ja korkea sissien voima -> kiinni", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 8;
  const tulos = yritaHelikopteripako(tila, () => 0.9);
  assert.equal(tulos.onnistui, false);
});

test("pakene käyttää vuoristopakoa jos helikopteria ei ole ostettu", () => {
  const tila = uusiTila({ helikopteriOstettu: false });
  tila.ryhmat.sissit.voima = 1;
  const tulos = pakene(tila, () => 0.99);
  assert.equal(tulos.reitti, "vuoristo");
  assert.equal(tulos.onnistui, true);
});

test("pakene käyttää helikopteria jos se on ostettu", () => {
  const tila = uusiTila({ helikopteriOstettu: true });
  const tulos = pakene(tila, () => 0.1);
  assert.equal(tulos.reitti, "helikopteri");
});
