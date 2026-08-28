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

test("kuukausikierroksessa on viisi vaihetta oikeassa järjestyksessä", () => {
  // POIKKEAMAT GDD 4:stä (Sasu, pelitestaus): kassaraportin toistot poistettiin, ja
  // poliisiraportti tarjotaan vain kerran kuussa kuukauden viimeisenä toimintona.
  assert.equal(KUUKAUSIVAIHEET.length, 5);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.numero), [1, 2, 3, 4, 5]);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.avain), [
    "kassaraportti",
    "audienssi",
    "paatos",
    "uutiset",
    "poliisiraportti"
  ]);
});

test("kierros käy kaikki vaiheet läpi järjestyksessä", () => {
  const kierros = aloitaKuukausi();
  assert.deepEqual(kaydytVaiheet(kierros), KUUKAUSIVAIHEET.map(v => v.avain));
});

test("kassaraportti on kuukauden ensimmäinen ja esiintyy vain kerran", () => {
  const avaimet = kaydytVaiheet(aloitaKuukausi());
  assert.equal(avaimet[0], "kassaraportti");
  assert.equal(avaimet.filter(a => a === "kassaraportti").length, 1);
});

test("poliisiraportti on kuukauden viimeinen ja tarjotaan vain kerran", () => {
  const avaimet = kaydytVaiheet(aloitaKuukausi());
  assert.equal(avaimet[avaimet.length - 1], "poliisiraportti");
  assert.equal(avaimet.filter(a => a === "poliisiraportti").length, 1);
});

test("raportti tulee uutisvaiheen jälkeen, joten sen tieto palvelee vasta seuraavaa kuuta", () => {
  const avaimet = kaydytVaiheet(aloitaKuukausi());
  assert.ok(avaimet.indexOf("poliisiraportti") > avaimet.indexOf("uutiset"));
  assert.ok(avaimet.indexOf("poliisiraportti") > avaimet.indexOf("audienssi"));
  assert.ok(avaimet.indexOf("poliisiraportti") > avaimet.indexOf("paatos"));
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
  assert.equal(nykyinenVaihe(kierros).avain, "audienssi");
});
