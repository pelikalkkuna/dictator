// GDD 4.1: audienssin mekaniikka.

if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
}

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

// Poimii D3:n mukaisen ryhmän kortin pakasta, heittää uudelleen jos ryhmän pakka on tyhjä.
// Palauttaa null jos kaikkien kolmen ryhmän pakat ovat tyhjät (ei audienssia tässä kuussa).
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
  const indeksi = Math.floor(Math.random() * pakka.length);
  const korttiId = pakka.splice(indeksi, 1)[0];
  const kortti = etsiKortti(kortitData, ryhmaAvain, korttiId);

  return { ryhmaAvain, kortti };
}

// Onko kortilla rahallinen vaatimus jonka kassakriisi estää (GDD 3.6).
function onkoPakkoEi(pelitila, kortti) {
  return pelitila.kassakriisi && typeof kortti.kertaluontoinen === "number" && kortti.kertaluontoinen < 0;
}

function sovellaMittarimuutokset(pelitila, muutokset, kentta) {
  if (!muutokset) return;
  for (const ryhmaAvain in muutokset) {
    const ryhma = pelitila.ryhmat[ryhmaAvain];
    ryhma[kentta] = rajaaMittari(ryhma[kentta] + muutokset[ryhmaAvain]);
  }
}

function hyvaksyAudienssi(pelitila, kortti) {
  sovellaMittarimuutokset(pelitila, kortti.suosio, "suosio");
  sovellaMittarimuutokset(pelitila, kortti.voima, "voima");
  if (typeof kortti.kertaluontoinen === "number") {
    pelitila.kassa += kortti.kertaluontoinen;
  }
  if (typeof kortti.kuukausikulutMuutos === "number") {
    pelitila.kuukausikulut += kortti.kuukausikulutMuutos;
  }
}

function hylkaaAudienssi(pelitila, ryhmaAvain, kortti) {
  const esittajanSuosiomuutos = (kortti.suosio && kortti.suosio[ryhmaAvain]) || 0;
  const ryhma = pelitila.ryhmat[ryhmaAvain];
  ryhma.suosio = rajaaMittari(ryhma.suosio - esittajanSuosiomuutos);
}

if (typeof module !== "undefined") {
  module.exports = {
    luoAudienssipakat,
    heitaD3,
    valitseAudienssiryhma,
    valitseAudienssi,
    onkoPakkoEi,
    hyvaksyAudienssi,
    hylkaaAudienssi
  };
}
