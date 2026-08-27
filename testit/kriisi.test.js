const test = require("node:test");
const assert = require("node:assert/strict");
const { kriisikortit } = require("../js/data/kriisikortit.js");
const {
  laskeTyytymattomyys,
  laskeVallankumousvoimanPerustaso,
  parasPuolustusehdokas,
  puolustusehdokkaat,
  tarkistaKriisi,
  neuvotteleOnnistuu,
  valitseVaatimuskortti,
  hyvaksyVaatimus,
  ratkaisePuolustus,
  rankaiseKapinalliset,
  armahdaKapinalliset
} = require("../js/moottori/kriisi.js");

function uusiTila(yliajot) {
  return Object.assign({
    kassa: 1000000,
    kuukausikulut: 45000,
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

test("laskeTyytymattomyys on voima miinus suosio", () => {
  assert.equal(laskeTyytymattomyys({ suosio: 7, voima: 6 }), -1);
  assert.equal(laskeTyytymattomyys({ suosio: 2, voima: 8 }), 6);
});

test("laskeVallankumousvoimanPerustaso on 10 aloitusarvoilla (kaikki tyytymättömyys negatiivinen)", () => {
  const tila = uusiTila();
  assert.equal(laskeVallankumousvoimanPerustaso(tila), 10);
});

test("laskeVallankumousvoimanPerustaso nousee ryhmien tyytymättömyyden mukaan", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 8; // tyytym. 7
  tila.ryhmat.talonpojat.suosio = 2; tila.ryhmat.talonpojat.voima = 5; // tyytym. 3
  // maanomistajat pysyy negatiivisena (-1), ei lisää mitään
  assert.equal(laskeVallankumousvoimanPerustaso(tila), 10 + 7 + 3);
});

test("laskeVallankumousvoimanPerustaso ei laske alle 10:n negatiivisilla tyytymättömyyksillä", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 9; tila.ryhmat.armeija.voima = 0; // tyytym. -9
  assert.equal(laskeVallankumousvoimanPerustaso(tila), 10);
});

test("laskeVallankumousvoimanPerustaso ei huomioi salaista poliisia tai sisseja", () => {
  const tila = uusiTila();
  tila.ryhmat.salainenPoliisi.suosio = 0; tila.ryhmat.salainenPoliisi.voima = 9; // tyytym. 9, ei kuulu laskentaan
  tila.ryhmat.sissit.voima = 9;
  assert.equal(laskeVallankumousvoimanPerustaso(tila), 10);
});

test("tarkistaKriisi: aloitusarvoilla ei kriisiä (tyytymättömyys -1, kynnys 3)", () => {
  const tila = uusiTila();
  assert.equal(tarkistaKriisi(tila), null);
});

test("tarkistaKriisi: alle 2 tyytymätöntä ryhmää ei riitä", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1;
  tila.ryhmat.armeija.voima = 9; // tyytymättömyys 8, ylittää kynnyksen
  // vain yksi ryhmä ylittää -> ei kriisiä
  assert.equal(tarkistaKriisi(tila), null);
});

test("tarkistaKriisi: kaksi tyytymätöntä mutta yhteisvoima ei ylitä puolustusta -> ei laukea", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 4; // tyytym. 3
  tila.ryhmat.talonpojat.suosio = 1; tila.ryhmat.talonpojat.voima = 4; // tyytym. 3
  // yhteisvoima 4+4=8, paras puolustusehdokas maanomistajat (suosio7,voima6) + henkivartijat4 = 10
  assert.equal(tarkistaKriisi(tila), null);
});

test("tarkistaKriisi: armeija käynnistää KAAPPAUKSEN kun ehdot täyttyvät", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 1; tila.ryhmat.armeija.voima = 9; // tyytym. 8 (suurin)
  tila.ryhmat.talonpojat.suosio = 1; tila.ryhmat.talonpojat.voima = 9; // tyytym. 8 (liittolainen, tasapelissä toinen)
  tila.ryhmat.maanomistajat.suosio = 9; tila.ryhmat.maanomistajat.voima = 0; // ei puolustajaehdokkaaksi (suosio ok mutta voima 0)
  const kriisi = tarkistaKriisi(tila);
  assert.notEqual(kriisi, null);
  assert.equal(kriisi.tyyppi, "KAAPPAUS");
  assert.equal(kriisi.kaynnistaja, "armeija");
  assert.equal(kriisi.sissitMukana, false);
});

test("tarkistaKriisi: talonpojat käynnistävät VALLANKUMOUKSEN ja sissit liittyvät mukaan", () => {
  const tila = uusiTila();
  tila.ryhmat.talonpojat.suosio = 0; tila.ryhmat.talonpojat.voima = 9; // tyytym. 9
  tila.ryhmat.armeija.suosio = 0; tila.ryhmat.armeija.voima = 8; // tyytym. 8
  tila.ryhmat.sissit.voima = 9;
  tila.ryhmat.maanomistajat.suosio = 0; // ei kelpaa puolustajaksi
  tila.ryhmat.salainenPoliisi.suosio = 0; // ei kelpaa puolustajaksi
  const kriisi = tarkistaKriisi(tila);
  assert.equal(kriisi.tyyppi, "VALLANKUMOUS");
  assert.equal(kriisi.kaynnistaja, "talonpojat");
  assert.equal(kriisi.liittolainen, "armeija");
  assert.equal(kriisi.sissitMukana, true);
  assert.equal(kriisi.yhteisvoima, 9 + 8 + 9); // talonpojat + armeija + sissit
});

test("maanomistajat käynnistävät KAPINAN", () => {
  const tila = uusiTila();
  tila.ryhmat.maanomistajat.suosio = 0; tila.ryhmat.maanomistajat.voima = 9;
  tila.ryhmat.armeija.suosio = 0; tila.ryhmat.armeija.voima = 8;
  tila.ryhmat.talonpojat.suosio = 0; // ei puolustajaksi
  tila.ryhmat.salainenPoliisi.suosio = 0; // ei puolustajaksi
  const kriisi = tarkistaKriisi(tila);
  assert.equal(kriisi.tyyppi, "KAPINA");
  assert.equal(kriisi.kaynnistaja, "maanomistajat");
});

test("parasPuolustusehdokas jättää huomiotta suosio < 4 ja poissuljetut ryhmät", () => {
  const tila = uusiTila();
  tila.ryhmat.armeija.suosio = 3; // ei kelpaa
  tila.ryhmat.salainenPoliisi.suosio = 8;
  const ehdokas = parasPuolustusehdokas(tila, ["talonpojat", "maanomistajat"]);
  assert.equal(ehdokas, "salainenPoliisi");
});

test("puolustusehdokkaat palauttaa tyhjän listan kun kaikkien suosio <= 3", () => {
  const tila = uusiTila();
  for (const avain of ["armeija", "talonpojat", "maanomistajat", "salainenPoliisi"]) {
    tila.ryhmat[avain].suosio = 3;
  }
  assert.deepEqual(puolustusehdokkaat(tila, []), []);
});

test("neuvotteleOnnistuu on 50/50-heitto", () => {
  assert.equal(neuvotteleOnnistuu(() => 0.4), true);
  assert.equal(neuvotteleOnnistuu(() => 0.6), false);
});

test("valitseVaatimuskortti valitsee kortin oikeasta kriisityypin pakasta", () => {
  const c = valitseVaatimuskortti("KAAPPAUS", () => 0);
  assert.equal(c.id, "C1");
  const e = valitseVaatimuskortti("KAPINA", () => 0.99);
  assert.equal(e.id, "E2");
});

test("hyvaksyVaatimus soveltaa kortin suosio/voima/talous-vaikutukset", () => {
  const tila = uusiTila();
  const c1 = kriisikortit.KAAPPAUS.find(k => k.id === "C1");
  hyvaksyVaatimus(tila, c1);
  assert.equal(tila.ryhmat.armeija.suosio, 8);
  assert.equal(tila.ryhmat.armeija.voima, 9);
  assert.equal(tila.kuukausikulut, 50000);
});

test("ratkaisePuolustus: voittotodennäköisyys on pelaajan osuus yhteisvoimasta", () => {
  const tila = uusiTila();
  tila.henkivartijoidenVoima = 4;
  tila.ryhmat.maanomistajat.voima = 6; // valittu puolustaja
  const kriisi = { kaynnistaja: "armeija", liittolainen: "talonpojat", sissitMukana: false };
  tila.ryhmat.armeija.voima = 5;
  tila.ryhmat.talonpojat.voima = 4; // vihollinen 9, pelaaja 4+6=10, yhteensä 19
  const tulos = ratkaisePuolustus(tila, kriisi, "maanomistajat", () => 0.5);
  assert.equal(tulos.pelaajanVoima, 10);
  assert.equal(tulos.vihollisenVoima, 9);
  assert.equal(tulos.voittotodennakoisyys, 10 / 19);
  assert.equal(tulos.voitto, 0.5 < 10 / 19); // heitto 0.5 < ~0.526 -> voitto
});

test("ratkaisePuolustus: heitto alle voittotodennäköisyyden -> voitto, muuten tappio", () => {
  const tila = uusiTila();
  tila.henkivartijoidenVoima = 10;
  tila.ryhmat.maanomistajat.voima = 0;
  const kriisi = { kaynnistaja: "armeija", liittolainen: "talonpojat", sissitMukana: false };
  tila.ryhmat.armeija.voima = 5;
  tila.ryhmat.talonpojat.voima = 5; // pelaaja 10, vihollinen 10 -> 50/50
  assert.equal(ratkaisePuolustus(tila, kriisi, "maanomistajat", () => 0.49).voitto, true);
  assert.equal(ratkaisePuolustus(tila, kriisi, "maanomistajat", () => 0.51).voitto, false);
});

test("ratkaisePuolustus: ylivoimainenkin puolustus voi hävitä (ei koskaan 100% varma)", () => {
  const tila = uusiTila();
  tila.henkivartijoidenVoima = 9;
  tila.ryhmat.maanomistajat.voima = 9;
  const kriisi = { kaynnistaja: "armeija", liittolainen: "talonpojat", sissitMukana: false };
  tila.ryhmat.armeija.voima = 1;
  tila.ryhmat.talonpojat.voima = 0; // pelaaja 18, vihollinen 1 -> todennäköisyys 18/19, mutta ei 1.0
  const tulos = ratkaisePuolustus(tila, kriisi, "maanomistajat", () => 0.999);
  assert.equal(tulos.voitto, false); // 0.999 >= 18/19 (~0.947)
});

test("ratkaisePuolustus: pakkotaistelu pelkillä henkivartijoilla kun ketään ei valita", () => {
  const tila = uusiTila();
  tila.henkivartijoidenVoima = 4;
  const kriisi = { kaynnistaja: "armeija", liittolainen: "talonpojat", sissitMukana: false };
  const tulos = ratkaisePuolustus(tila, kriisi, null, () => 0.5);
  assert.equal(tulos.pelaajanVoima, 4);
});

test("rankaiseKapinalliset nollaa suosion ja voiman kriisin osapuolilta (sissit mukana lukien)", () => {
  const tila = uusiTila();
  const kriisi = { kaynnistaja: "talonpojat", liittolainen: "armeija", sissitMukana: true };
  rankaiseKapinalliset(tila, kriisi);
  assert.equal(tila.ryhmat.talonpojat.suosio, 0);
  assert.equal(tila.ryhmat.talonpojat.voima, 0);
  assert.equal(tila.ryhmat.armeija.voima, 0);
  assert.equal(tila.ryhmat.sissit.voima, 0);
  assert.equal(tila.ryhmat.maanomistajat.suosio, 7); // ei kuulu kriisiin, ei muutu
});

test("armahdaKapinalliset nollaa vain suosion, voima säilyy", () => {
  const tila = uusiTila();
  const kriisi = { kaynnistaja: "maanomistajat", liittolainen: "armeija", sissitMukana: false };
  armahdaKapinalliset(tila, kriisi);
  assert.equal(tila.ryhmat.maanomistajat.suosio, 0);
  assert.equal(tila.ryhmat.maanomistajat.voima, 6); // säilyy
  assert.equal(tila.ryhmat.armeija.suosio, 0);
  assert.equal(tila.ryhmat.armeija.voima, 6);
});
