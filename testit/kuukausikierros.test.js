const test = require("node:test");
const assert = require("node:assert/strict");
const {
  KUUKAUSIVAIHEET,
  aloitaKuukausi,
  otaKassatilanne,
  onkoKassavaikutus,
  kirjaaKassavaikutus,
  ohitetaankoVaihe,
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

test("GDD 4: kuukausikierroksessa on kahdeksan vaihetta oikeassa järjestyksessä", () => {
  assert.equal(KUUKAUSIVAIHEET.length, 8);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.numero), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(KUUKAUSIVAIHEET.map(v => v.avain), [
    "kassaraportti1",
    "poliisiraportti1",
    "audienssi",
    "kassaraportti2",
    "paatos",
    "kassaraportti3",
    "uutiset",
    "poliisiraportti2"
  ]);
});

test("ilman kassavaikutuksia vaiheet 4 ja 6 ohitetaan", () => {
  const kierros = aloitaKuukausi();
  assert.deepEqual(kaydytVaiheet(kierros), [
    "kassaraportti1",
    "poliisiraportti1",
    "audienssi",
    "paatos",
    "uutiset",
    "poliisiraportti2"
  ]);
});

test("audienssin kassavaikutus tuo vaiheen 4 mukaan, päätöksen vaiheen 6", () => {
  const kierros = aloitaKuukausi();
  kierros.audienssinKassavaikutus = { ennen: {}, jalkeen: {} };
  kierros.paatoksenKassavaikutus = { ennen: {}, jalkeen: {} };
  assert.deepEqual(kaydytVaiheet(kierros), KUUKAUSIVAIHEET.map(v => v.avain));
});

test("vain audienssin kassavaikutus: vaihe 4 ajetaan, vaihe 6 ohitetaan", () => {
  const kierros = aloitaKuukausi();
  kierros.audienssinKassavaikutus = { ennen: {}, jalkeen: {} };
  const avaimet = kaydytVaiheet(kierros);
  assert.ok(avaimet.includes("kassaraportti2"));
  assert.ok(!avaimet.includes("kassaraportti3"));
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
  assert.equal(nykyinenVaihe(kierros).avain, "kassaraportti1");
  seuraavaVaihe(kierros);
  assert.equal(nykyinenVaihe(kierros).avain, "poliisiraportti1");
});

test("ohitetaankoVaihe koskee vain ehdollisia kassaraporttivaiheita", () => {
  const kierros = aloitaKuukausi();
  for (const vaihe of KUUKAUSIVAIHEET) {
    const odotettu = vaihe.avain === "kassaraportti2" || vaihe.avain === "kassaraportti3";
    assert.equal(ohitetaankoVaihe(kierros, vaihe), odotettu, vaihe.avain);
  }
});

test("onkoKassavaikutus huomaa sekä kassan että kuukausikulujen muutoksen", () => {
  const perus = { kassa: 1000000, kuukausikulut: 45000 };
  assert.equal(onkoKassavaikutus(perus, { kassa: 1000000, kuukausikulut: 45000 }), false);
  assert.equal(onkoKassavaikutus(perus, { kassa: 950000, kuukausikulut: 45000 }), true);
  // GDD 3.2: kulumuutokset astuvat voimaan heti ja kumuloituvat -> nekin ovat kassavaikutus
  assert.equal(onkoKassavaikutus(perus, { kassa: 1000000, kuukausikulut: 50000 }), true);
});

test("kirjaaKassavaikutus tallentaa vaikutuksen vain jos jotain muuttui", () => {
  const pelitila = { kassa: 1000000, kuukausikulut: 45000 };
  const kierros = aloitaKuukausi();
  const ennen = otaKassatilanne(pelitila);

  kirjaaKassavaikutus(kierros, "audienssinKassavaikutus", ennen, pelitila);
  assert.equal(kierros.audienssinKassavaikutus, null);

  pelitila.kassa -= 50000;
  kirjaaKassavaikutus(kierros, "audienssinKassavaikutus", ennen, pelitila);
  assert.deepEqual(kierros.audienssinKassavaikutus, {
    ennen: { kassa: 1000000, kuukausikulut: 45000 },
    jalkeen: { kassa: 950000, kuukausikulut: 45000 }
  });
});

test("otaKassatilanne ottaa kopion eikä seuraa myöhempiä muutoksia", () => {
  const pelitila = { kassa: 1000000, kuukausikulut: 45000 };
  const ennen = otaKassatilanne(pelitila);
  pelitila.kassa = 1;
  assert.equal(ennen.kassa, 1000000);
});
