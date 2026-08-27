const test = require("node:test");
const assert = require("node:assert/strict");
const {
  vuoristopaonTodennakoisyys,
  yritaVuoristopako,
  yritaHelikopteripako,
  pakene
} = require("../js/moottori/pako.js");

function uusiTila(yliajot) {
  return Object.assign({
    helikopteriOstettu: false,
    ryhmat: {
      sissit: { suosio: 0, voima: 6 }
    }
  }, yliajot);
}

test("vuoristopaonTodennakoisyys: 1 - sissienVoima/9", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 0;
  assert.equal(vuoristopaonTodennakoisyys(tila), 1); // aina onnistuu
  tila.ryhmat.sissit.voima = 9;
  assert.equal(vuoristopaonTodennakoisyys(tila), 0); // aina kiinni
  tila.ryhmat.sissit.voima = 6;
  assert.equal(vuoristopaonTodennakoisyys(tila), 1 - 6 / 9);
});

test("yritaVuoristopako: heitto alle todennäköisyyden onnistuu", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 3; // todennäköisyys 1 - 3/9 = 2/3
  assert.equal(yritaVuoristopako(tila, () => 0.5).onnistui, true);
  assert.equal(yritaVuoristopako(tila, () => 0.7).onnistui, false);
});

test("yritaVuoristopako: sissien voima 9 -> jää aina kiinni riippumatta heitosta", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 9;
  assert.equal(yritaVuoristopako(tila, () => 0).onnistui, false);
  assert.equal(yritaVuoristopako(tila, () => 0.9999).onnistui, false);
});

test("yritaVuoristopako: sissien voima 0 -> onnistuu aina riippumatta heitosta", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 0;
  assert.equal(yritaVuoristopako(tila, () => 0.9999).onnistui, true);
});

test("yritaHelikopteripako onnistuu 75% todennäköisyydellä suoraan", () => {
  const tila = uusiTila();
  const tulos = yritaHelikopteripako(tila, () => 0.5); // < 0.75
  assert.equal(tulos.onnistui, true);
  assert.equal(tulos.reitti, "helikopteri");
});

test("yritaHelikopteripako: rikkoutunut helikopteri johtaa vuoristopakoon varareittinä", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 1; // vuoristopaon todennäköisyys 1 - 1/9 = 8/9
  let kutsu = 0;
  const heittoFn = () => { kutsu += 1; return kutsu === 1 ? 0.9 : 0.5; }; // 1. rikki, 2. vuoristo onnistuu
  const tulos = yritaHelikopteripako(tila, heittoFn);
  assert.equal(tulos.onnistui, true);
  assert.equal(tulos.reitti, "vuoristo (helikopteri rikki)");
});

test("yritaHelikopteripako: rikkoutunut helikopteri ja korkea sissien voima -> kiinni", () => {
  const tila = uusiTila();
  tila.ryhmat.sissit.voima = 8;
  const tulos = yritaHelikopteripako(tila, () => 0.9); // 1. rikki (>=0.75), 2. vuoristo (todenn. 1/9, 0.9 epäonnistuu)
  assert.equal(tulos.onnistui, false);
});

test("pakene käyttää vuoristopakoa jos helikopteria ei ole ostettu", () => {
  const tila = uusiTila({ helikopteriOstettu: false });
  tila.ryhmat.sissit.voima = 1;
  const tulos = pakene(tila, () => 0.1);
  assert.equal(tulos.reitti, "vuoristo");
  assert.equal(tulos.onnistui, true);
});

test("pakene käyttää helikopteria jos se on ostettu", () => {
  const tila = uusiTila({ helikopteriOstettu: true });
  const tulos = pakene(tila, () => 0.1);
  assert.equal(tulos.reitti, "helikopteri");
});
