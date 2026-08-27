const test = require("node:test");
const assert = require("node:assert/strict");
const {
  laskeRitimbanVoima,
  laskeLeftotonVoima,
  ratkaiseSota,
  suoritaPikasota,
  aloitaN1Kierre,
  suoritaN1Kierros,
  kasitteleSotaVelka,
  kasitteleVallankumousvoimanPalautuminen
} = require("../js/moottori/sota.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kuukausikulut: 45000,
    vallankumousvoima: 10,
    vallankumousvoimaPalautusJaljella: 0,
    sotaVelkaKuukausiaJaljella: 0,
    n1KierreKaynnissa: false,
    n1Kierros: 0,
    uutispakka: [],
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

test("GDD 8.3 esimerkki: tasapainoinen tilanne, Ritimba voittaa selvästi", () => {
  const tila = uusiTila();
  // Armeija 6, Talonpojat 6, Maanomistajat 6, kaikki suosio >= 4 -> Ritimba 18
  // Leftoto 6 + Sissit 6 = 12
  assert.equal(laskeRitimbanVoima(tila), 18);
  assert.equal(laskeLeftotonVoima(tila), 12);
  const tulos = ratkaiseSota(tila);
  assert.equal(tulos.voitto, true);
});

test("GDD 8.3 esimerkki: rapautunut tilanne, Ritimba häviää", () => {
  const tila = uusiTila();
  tila.ryhmat.talonpojat.suosio = 2; // ulos laskusta
  tila.ryhmat.armeija.voima = 4;
  tila.ryhmat.maanomistajat.voima = 4;
  tila.ryhmat.sissit.voima = 9; // Kuuba-buustin jälkeen
  // Ritimba: armeija 4 + maanomist. 4 = 8 (talonpojat ulkona suosio < 4)
  assert.equal(laskeRitimbanVoima(tila), 8);
  // Leftoto 6 + sissit 9 = 15
  assert.equal(laskeLeftotonVoima(tila), 15);
  const tulos = ratkaiseSota(tila);
  assert.equal(tulos.voitto, false);
});

test("salainen poliisi ei osallistu sotalaskentaan vaikka suosio >= 4", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.voima = 9;
  assert.equal(laskeRitimbanVoima(tila), 18); // ei muutu vaikka sal.pol. voima nostettiin
});

test("suoritaPikasota: voitolla Leftoto puolittuu ja vallankumousvoima piikkaa, ei velkaa", () => {
  const tila = uusiTila();
  const tulos = suoritaPikasota(tila);
  assert.equal(tulos.voitto, true);
  assert.equal(tila.ryhmat.leftoto.voima, 3); // floor(6/2)
  assert.equal(tila.vallankumousvoima, 18); // Ritimban voima
  assert.equal(tila.vallankumousvoimaPalautusJaljella, 3);
  assert.equal(tila.sotaVelkaKuukausiaJaljella, 0); // A1-pikasodassa ei velkaa
});

test("suoritaPikasota: tappiolla ei jälkitilaa", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 2;
  tila.ryhmat.talonpojat.suosio = 2;
  tila.ryhmat.maanomistajat.suosio = 2; // kaikki ulos -> Ritimba 0
  tila.ryhmat.leftoto.voima = 5;
  const tulos = suoritaPikasota(tila);
  assert.equal(tulos.voitto, false);
  assert.equal(tila.ryhmat.leftoto.voima, 5); // ei puolitusta tappiolla
  assert.equal(tila.vallankumousvoima, 10); // ei piikkiä
});

test("aloitaN1Kierre käynnistää kierteen eikä käynnisty uudelleen jos jo käynnissä", () => {
  const tila = uusiTila();
  aloitaN1Kierre(tila);
  assert.equal(tila.n1KierreKaynnissa, true);
  assert.equal(tila.n1Kierros, 0);
  tila.n1Kierros = 2; // simuloi että kierre on edennyt
  aloitaN1Kierre(tila); // ei saa nollata
  assert.equal(tila.n1Kierros, 2);
});

test("suoritaN1Kierros: ensimmäinen kierros nostaa kotimaan suosiota +1 riippumatta lopputuloksesta", () => {
  const tila = uusiTila();
  aloitaN1Kierre(tila);
  suoritaN1Kierros(tila, () => 0.99); // ei sotaa (40% raja) eikä perääntymistä (10% raja) kierroksella 1
  assert.equal(tila.ryhmat.armeija.suosio, 8);
  assert.equal(tila.ryhmat.talonpojat.suosio, 8);
  assert.equal(tila.ryhmat.maanomistajat.suosio, 8);
});

test("suoritaN1Kierros: kierros 1, heitto alle 40% laukaisee sodan ja käynnistää velan", () => {
  const tila = uusiTila();
  aloitaN1Kierre(tila);
  const tulos = suoritaN1Kierros(tila, () => 0.1); // < 0.40 -> sota
  assert.equal(tulos.tyyppi, "sota");
  assert.equal(tulos.voitto, true); // Ritimba 6+6+6+1(N1 boostilla suosio nousi mutta ei vaikuta voimaan)=18+? tarkistetaan alla
  assert.equal(tila.n1KierreKaynnissa, false);
  assert.equal(tila.sotaVelkaKuukausiaJaljella, 1); // 1 N1-kierros ennen sotaa
});

test("suoritaN1Kierros: heitto väliltä sota-% ja sota+perääntymis-% laukaisee perääntymisen", () => {
  const tila = uusiTila();
  aloitaN1Kierre(tila);
  // kierros 1: sota 40%, perääntyminen 10% (heitetään kahdesti: ensin sota-heitto 0.5 (ei sotaa),
  // sitten perääntymisheitto 0.05 (< 0.10 -> perääntyy))
  let kutsu = 0;
  const heittoFn = () => {
    kutsu += 1;
    return kutsu === 1 ? 0.5 : 0.05;
  };
  const tulos = suoritaN1Kierros(tila, heittoFn);
  assert.equal(tulos.tyyppi, "peraantyminen");
  assert.equal(tila.n1KierreKaynnissa, false);
});

test("suoritaN1Kierros: kierros 4 on aina pakkosota", () => {
  const tila = uusiTila();
  aloitaN1Kierre(tila);
  tila.n1Kierros = 3; // seuraava on kierros 4
  const tulos = suoritaN1Kierros(tila, () => 0.999999); // lähes 1, silti < 1.00 raja
  assert.equal(tulos.tyyppi, "sota");
  assert.equal(tila.sotaVelkaKuukausiaJaljella, 4);
});

test("kasitteleSotaVelka vähentää suosiota kolmelta kotimaan ryhmältä ja lyhentää laskuria", () => {
  const tila = uusiTila({ sotaVelkaKuukausiaJaljella: 2 });
  kasitteleSotaVelka(tila);
  assert.equal(tila.ryhmat.armeija.suosio, 6);
  assert.equal(tila.ryhmat.talonpojat.suosio, 6);
  assert.equal(tila.ryhmat.maanomistajat.suosio, 6);
  assert.equal(tila.ryhmat.leftoto.suosio, 7); // ei kuulu velkaan
  assert.equal(tila.sotaVelkaKuukausiaJaljella, 1);
});

test("kasitteleSotaVelka ei tee mitään kun velkaa ei ole", () => {
  const tila = uusiTila({ sotaVelkaKuukausiaJaljella: 0 });
  kasitteleSotaVelka(tila);
  assert.equal(tila.ryhmat.armeija.suosio, 7);
});

test("kasitteleVallankumousvoimanPalautuminen palaa tasan 10:een kolmessa kuukaudessa", () => {
  const tila = uusiTila({ vallankumousvoima: 19, vallankumousvoimaPalautusJaljella: 3 });
  kasitteleVallankumousvoimanPalautuminen(tila);
  kasitteleVallankumousvoimanPalautuminen(tila);
  kasitteleVallankumousvoimanPalautuminen(tila);
  assert.equal(tila.vallankumousvoima, 10);
  assert.equal(tila.vallankumousvoimaPalautusJaljella, 0);
});
