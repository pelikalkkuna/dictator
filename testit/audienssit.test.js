const test = require("node:test");
const assert = require("node:assert/strict");
const { audienssikortit } = require("../js/data/audienssit.js");
const {
  luoAudienssipakat,
  valitseAudienssiryhma,
  valitseAudienssi,
  ehdotaToinenKortti,
  onkoPakkoEi,
  hyvaksyAudienssi,
  hylkaaAudienssi,
  ohitaAudienssi
} = require("../js/moottori/audienssit.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kuukausikulut: 45000,
    kassakriisi: false,
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
    audienssipakat: luoAudienssipakat(audienssikortit)
  }, yliajot);
}

test("audienssikortteja on GDD:n mukaiset määrät", () => {
  assert.equal(audienssikortit.armeija.length, 15);
  assert.equal(audienssikortit.talonpojat.length, 13);
  assert.equal(audienssikortit.maanomistajat.length, 14);
});

test("D3-heitto valitsee oikean ryhmän", () => {
  assert.equal(valitseAudienssiryhma(1), "armeija");
  assert.equal(valitseAudienssiryhma(2), "talonpojat");
  assert.equal(valitseAudienssiryhma(3), "maanomistajat");
});

test("A1 hyväksyttynä nostaa armeijan suosiota ja voimaa GDD:n mukaisesti", () => {
  const tila = uusiTila();
  const a1 = audienssikortit.armeija.find(k => k.id === "A1");
  hyvaksyAudienssi(tila, "armeija", a1);
  assert.equal(tila.ryhmat.armeija.suosio, 9); // rajautuu 7+3=10 -> 9
  assert.equal(tila.ryhmat.talonpojat.suosio, 6);
  assert.equal(tila.ryhmat.leftoto.suosio, 3);
  assert.equal(tila.ryhmat.venaja.suosio, 6);
  assert.equal(tila.ryhmat.armeija.voima, 7);
  assert.equal(tila.ryhmat.maanomistajat.voima, 7);
  assert.equal(tila.ryhmat.sissit.voima, 4);
  assert.equal(tila.kassa, 1000000 - 80000);
});

test("A3 arpoo sissien voimavaikutuksen väliltä -1..-2 (GDD:n epäselvä väli)", () => {
  const a3 = audienssikortit.armeija.find(k => k.id === "A3");
  assert.deepEqual(a3.voima.sissit, { min: -2, max: -1 });

  const tilaPieni = uusiTila();
  hyvaksyAudienssi(tilaPieni, "armeija", a3, () => 0); // pienin arvo välistä -> -2
  assert.equal(tilaPieni.ryhmat.sissit.voima, 4); // 6 - 2

  const tilaSuuri = uusiTila();
  hyvaksyAudienssi(tilaSuuri, "armeija", a3, () => 0.999); // suurin arvo välistä -> -1
  assert.equal(tilaSuuri.ryhmat.sissit.voima, 5); // 6 - 1
});

test("hylätty audienssi antaa esittäjälle saman suuruisen suosiomiinuksen", () => {
  const tila = uusiTila();
  const a1 = audienssikortit.armeija.find(k => k.id === "A1"); // armeija suosio +3 jos hyväksytty
  hylkaaAudienssi(tila, "armeija", a1);
  assert.equal(tila.ryhmat.armeija.suosio, 4); // 7 - 3
  assert.equal(tila.kassa, 1000000); // ei talousvaikutusta
});

test("suosio ei laske alle nollan hylätyssä audienssissa", () => {
  const tila = uusiTila();
  tila.ryhmat.talonpojat.suosio = 1;
  const p5 = audienssikortit.talonpojat.find(k => k.id === "P5"); // talonpojat +4
  hylkaaAudienssi(tila, "talonpojat", p5);
  assert.equal(tila.ryhmat.talonpojat.suosio, 0);
});

test("kuukausikulutMuutos vaikuttaa kuukausikuluihin hyväksynnässä", () => {
  const tila = uusiTila();
  const a4 = audienssikortit.armeija.find(k => k.id === "A4"); // +5k/kk
  hyvaksyAudienssi(tila, "armeija", a4);
  assert.equal(tila.kuukausikulut, 50000);
});

test("onkoPakkoEi: rahallinen vaatimus estyy kassakriisissä", () => {
  const tila = uusiTila({ kassakriisi: true });
  const a1 = audienssikortit.armeija.find(k => k.id === "A1"); // -80k
  const a5 = audienssikortit.armeija.find(k => k.id === "A5"); // ei talousvaikutusta
  assert.equal(onkoPakkoEi(tila, a1), true);
  assert.equal(onkoPakkoEi(tila, a5), false);
});

test("onkoPakkoEi: ei estä kun kassa ei ole kriisissä", () => {
  const tila = uusiTila({ kassakriisi: false });
  const a1 = audienssikortit.armeija.find(k => k.id === "A1");
  assert.equal(onkoPakkoEi(tila, a1), false);
});

test("valitseAudienssi heittää D3:n uudelleen kun ryhmän pakka on tyhjä", () => {
  const tila = uusiTila();
  tila.audienssipakat.armeija = [];
  let heittoja = 0;
  const heittoFn = () => {
    heittoja += 1;
    return heittoja === 1 ? 1 : 2; // ensin armeija (tyhjä), sitten talonpojat
  };
  const tulos = valitseAudienssi(tila, audienssikortit, heittoFn);
  assert.equal(tulos.ryhmaAvain, "talonpojat");
  assert.equal(heittoja, 2);
});

test("valitseAudienssi palauttaa null kun kaikki pakat ovat tyhjät", () => {
  const tila = uusiTila();
  tila.audienssipakat = { armeija: [], talonpojat: [], maanomistajat: [] };
  const tulos = valitseAudienssi(tila, audienssikortit, () => 1);
  assert.equal(tulos, null);
});

test("valittu kortti EI poistu pakasta ennen kuin se kuitataan kyllä/ei-päätöksellä", () => {
  const tila = uusiTila();
  const alkuperainenMaara = tila.audienssipakat.armeija.length;
  const tulos = valitseAudienssi(tila, audienssikortit, () => 1);
  assert.equal(tila.audienssipakat.armeija.length, alkuperainenMaara);
  assert.equal(tila.audienssipakat.armeija.includes(tulos.kortti.id), true);
});

test("hyvaksyAudienssi kuluttaa kortin pakasta", () => {
  const tila = uusiTila();
  const a1 = audienssikortit.armeija.find(k => k.id === "A1");
  hyvaksyAudienssi(tila, "armeija", a1);
  assert.equal(tila.audienssipakat.armeija.includes("A1"), false);
});

test("hylkaaAudienssi kuluttaa kortin pakasta", () => {
  const tila = uusiTila();
  const a2 = audienssikortit.armeija.find(k => k.id === "A2");
  hylkaaAudienssi(tila, "armeija", a2);
  assert.equal(tila.audienssipakat.armeija.includes("A2"), false);
});

test("ehdotaToinenKortti nostaa eri kortin kuin esillä olevan, samasta ryhmän pakasta", () => {
  const tila = uusiTila();
  const esillaOlevaId = tila.audienssipakat.armeija[0];
  const uusi = ehdotaToinenKortti(tila, audienssikortit, "armeija", esillaOlevaId);
  assert.notEqual(uusi.id, esillaOlevaId);
  assert.equal(audienssikortit.armeija.some(k => k.id === uusi.id), true);
  // Ehdotus itsessään ei kuluta kumpaakaan korttia - vain nostaa vaihtoehdon.
  assert.equal(tila.audienssipakat.armeija.length, audienssikortit.armeija.length);
});

test("ehdotaToinenKortti palauttaa null kun ryhmän pakassa ei ole muuta tarjottavaa", () => {
  const tila = uusiTila();
  tila.audienssipakat.armeija = ["A1"];
  const uusi = ehdotaToinenKortti(tila, audienssikortit, "armeija", "A1");
  assert.equal(uusi, null);
});

test("ohitaAudienssi laskee esittäjän suosiota yhdellä eikä kuluta korttia", () => {
  const tila = uusiTila();
  const alkuperainenMaara = tila.audienssipakat.armeija.length;
  ohitaAudienssi(tila, "armeija");
  assert.equal(tila.ryhmat.armeija.suosio, 6); // 7 - 1
  assert.equal(tila.audienssipakat.armeija.length, alkuperainenMaara);
});

test("ohitaAudienssi ei laske suosiota alle nollan", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 0;
  ohitaAudienssi(tila, "armeija");
  assert.equal(tila.ryhmat.armeija.suosio, 0);
});
