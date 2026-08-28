const test = require("node:test");
const assert = require("node:assert/strict");
const {
  KUUKAUSIVAIHEET,
  aloitaKuukausi,
  seuraavaVaihe,
  nykyinenVaihe
} = require("../js/moottori/kuukausikierros.js");

function kaydytVaiheet(kierros) {
  const avaimet = [];
  let vaihe = seuraavaVaihe(kierros);
  while (vaihe) {
    avaimet.push(vaihe.avain);
    vaihe = seuraavaVaihe(kierros);
  }
  return avaimet;
}

test("kuukausikierroksessa on kuusi vaihetta oikeassa järjestyksessä", () => {
  // POIKKEAMA GDD 4:stä (Sasu, pelitestaus): kassaraportin toistot audienssin ja päätöksen
  // jälkeen poistettiin - kassa näytetään enää kerran kuukaudessa vaiheessa 1.
  assert.equal(KUUKAUSIVAIHEET.length, 6);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.numero), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.avain), [
    "kassaraportti",
    "poliisiraportti1",
    "audienssi",
    "paatos",
    "uutiset",
    "poliisiraportti2"
  ]);
});

test("kierros käy kaikki vaiheet läpi järjestyksessä", () => {
  const kierros = aloitaKuukausi();
  assert.deepEqual(kaydytVaiheet(kierros), KUUKAUSIVAIHEET.map(v => v.avain));
});

test("kassaraporttivaihe esiintyy täsmälleen kerran kuukaudessa", () => {
  const kierros = aloitaKuukausi();
  const kassavaiheita = kaydytVaiheet(kierros).filter(a => a === "kassaraportti");
  assert.equal(kassavaiheita.length, 1);
});

test("poliisiraportti tarjotaan kahdesti: kuun alussa ja lopussa", () => {
  const kierros = aloitaKuukausi();
  const avaimet = kaydytVaiheet(kierros);
  assert.equal(avaimet.indexOf("poliisiraportti1"), 1);
  assert.equal(avaimet.indexOf("poliisiraportti2"), avaimet.length - 1);
});

test("seuraavaVaihe palauttaa null kun kuukausi on käyty loppuun", () => {
  const kierros = aloitaKuukausi();
  kaydytVaiheet(kierros);
  assert.equal(seuraavaVaihe(kierros), null);
});

test("nykyinenVaihe seuraa kierroksen kohtaa ja on null ennen aloitusta", () => {
  const kierros = aloitaKuukausi();
  assert.equal(nykyinenVaihe(kierros), null);
  seuraavaVaihe(kierros);
  assert.equal(nykyinenVaihe(kierros).avain, "kassaraportti");
  seuraavaVaihe(kierros);
  assert.equal(nykyinenVaihe(kierros).avain, "poliisiraportti1");
});
