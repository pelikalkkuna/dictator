// GDD 4.1: audienssin mekaniikka.
// Sasu (elokuu 2026, GDD:n ulkopuolinen mekaniikka, harkittu tietoisesti tässä vaiheessa kun
// moottori on vielä perustasolla): audienssikortti on nelisuuntainen. Oikealle/vasemmalle =
// Kyllä/Ei (kuluttaa kortin pakasta pysyvästi). Ylös = "Ehdota jotain muuta", sallittu kerran
// per audienssi - delegaatio nostaa toisen kortin OMASTA pakastaan, eikä ensimmäinen kortti kulu
// (se voi tulla vastaan myöhemmin). Toinen ehdotusyritys samassa audienssissa - tai ensimmäinenkin
// jos ryhmän pakassa ei ole enää muuta tarjottavaa - muuttuu automaattisesti "Menkää pois"
// -ohitukseksi. Alas = "Menkää pois" (ohitus): -1 suosiota, kortti ei kulu.

if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
}

const OHITUKSEN_SUOSIOMUUTOS = -1;

function luoAudienssipakat(kortitData) {
  return {
    armeija: kortitData.armeija.map(k => k.id),
    talonpojat: kortitData.talonpojat.map(k => k.id),
    maanomistajat: kortitData.maanomistajat.map(k => k.id)
  };
}

function heitaD3() {
  return Math.floor(Math.random() * 3) + 1;
}

function valitseAudienssiryhma(heitto) {
  if (heitto === 1) return "armeija";
  if (heitto === 2) return "talonpojat";
  return "maanomistajat";
}

function etsiKortti(kortitData, ryhmaAvain, korttiId) {
  return kortitData[ryhmaAvain].find(k => k.id === korttiId);
}

// Poimii D3:n mukaisen ryhmän kortin pakasta (muttei poista sitä - kortti kuluu vasta kun se
// kuitataan hyvaksyAudienssi- tai hylkaaAudienssi-funktiolla), heittää uudelleen jos ryhmän
// pakka on tyhjä. Palauttaa null jos kaikkien kolmen ryhmän pakat ovat tyhjät (ei audienssia
// tässä kuussa).
function valitseAudienssi(pelitila, kortitData, heittoFn) {
  const ryhmat = ["armeija", "talonpojat", "maanomistajat"];
  const kaikkiTyhjia = ryhmat.every(r => pelitila.audienssipakat[r].length === 0);
  if (kaikkiTyhjia) {
    return null;
  }

  let ryhmaAvain;
  do {
    ryhmaAvain = valitseAudienssiryhma(heittoFn());
  } while (pelitila.audienssipakat[ryhmaAvain].length === 0);

  const pakka = pelitila.audienssipakat[ryhmaAvain];
  const korttiId = pakka[Math.floor(Math.random() * pakka.length)];
  const kortti = etsiKortti(kortitData, ryhmaAvain, korttiId);

  return { ryhmaAvain, kortti };
}

// "Ehdota jotain muuta": nostaa saman ryhmän pakasta jonkin muun kortin kuin sen joka on jo
// esillä. Palauttaa null jos ryhmän pakassa ei ole muuta tarjottavaa - kutsuja käsittelee sen
// silloin "Menkää pois" -ohituksena.
function ehdotaToinenKortti(pelitila, kortitData, ryhmaAvain, esillaOlevaId) {
  const vaihtoehdot = pelitila.audienssipakat[ryhmaAvain].filter(id => id !== esillaOlevaId);
  if (vaihtoehdot.length === 0) {
    return null;
  }
  const korttiId = vaihtoehdot[Math.floor(Math.random() * vaihtoehdot.length)];
  return etsiKortti(kortitData, ryhmaAvain, korttiId);
}

function poistaKortti(pelitila, ryhmaAvain, korttiId) {
  const pakka = pelitila.audienssipakat[ryhmaAvain];
  const indeksi = pakka.indexOf(korttiId);
  if (indeksi !== -1) {
    pakka.splice(indeksi, 1);
  }
}

// Onko kortilla rahallinen vaatimus jonka kassakriisi estää (GDD 3.6).
function onkoPakkoEi(pelitila, kortti) {
  return pelitila.kassakriisi && typeof kortti.kertaluontoinen === "number" && kortti.kertaluontoinen < 0;
}

// GDD:n epäselvät "X/Y"-välimerkinnät (esim. A3:n sissit "−1/−2") tulkitaan tasaisesti
// arvotuksi kokonaisluvuksi välin päistä - kortin data merkitsee tämän { min, max }-oliona.
function satunnaisKokonaisluku(min, max, heittoFn) {
  const heitto = heittoFn || Math.random;
  return min + Math.floor(heitto() * (max - min + 1));
}

function sovellaMittarimuutokset(pelitila, muutokset, kentta, heittoFn) {
  if (!muutokset) return;
  for (const ryhmaAvain in muutokset) {
    const maare = muutokset[ryhmaAvain];
    const muutos = (maare && typeof maare === "object")
      ? satunnaisKokonaisluku(maare.min, maare.max, heittoFn)
      : maare;
    const ryhma = pelitila.ryhmat[ryhmaAvain];
    ryhma[kentta] = rajaaMittari(ryhma[kentta] + muutos);
  }
}

function hyvaksyAudienssi(pelitila, ryhmaAvain, kortti, heittoFn) {
  sovellaMittarimuutokset(pelitila, kortti.suosio, "suosio", heittoFn);
  sovellaMittarimuutokset(pelitila, kortti.voima, "voima", heittoFn);
  if (typeof kortti.kertaluontoinen === "number") {
    pelitila.kassa += kortti.kertaluontoinen;
  }
  if (typeof kortti.kuukausikulutMuutos === "number") {
    pelitila.kuukausikulut += kortti.kuukausikulutMuutos;
  }
  poistaKortti(pelitila, ryhmaAvain, kortti.id);
}

function hylkaaAudienssi(pelitila, ryhmaAvain, kortti) {
  const esittajanSuosiomuutos = (kortti.suosio && kortti.suosio[ryhmaAvain]) || 0;
  const ryhma = pelitila.ryhmat[ryhmaAvain];
  ryhma.suosio = rajaaMittari(ryhma.suosio - esittajanSuosiomuutos);
  poistaKortti(pelitila, ryhmaAvain, kortti.id);
}

// "Menkää pois": pelaaja ei käsittele vaatimusta lainkaan. Kortti ei kulu - se voi tulla vastaan
// uudelleen myöhemmin, samoin epäonnistuneen toisen ehdotusyrityksen kortti kun se ohjautuu tänne.
function ohitaAudienssi(pelitila, ryhmaAvain) {
  const ryhma = pelitila.ryhmat[ryhmaAvain];
  ryhma.suosio = rajaaMittari(ryhma.suosio + OHITUKSEN_SUOSIOMUUTOS);
}

if (typeof module !== "undefined") {
  module.exports = {
    luoAudienssipakat,
    heitaD3,
    valitseAudienssiryhma,
    valitseAudienssi,
    ehdotaToinenKortti,
    onkoPakkoEi,
    hyvaksyAudienssi,
    hylkaaAudienssi,
    ohitaAudienssi
  };
}
