// GDD 7. luku: uutisvaihe.

if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
}

const UUTINEN_MAX_UUDELLEENVETO = 200;

function yksittaiskertaUutiset(uutiskortit) {
  return uutiskortit.isot.filter(k => !k.toistuva).concat(uutiskortit.pienet);
}

function toistuvatUutiset(uutiskortit) {
  return uutiskortit.isot.filter(k => k.toistuva).concat(uutiskortit.ehdolliset);
}

function luoUutispakka(uutiskortit) {
  return yksittaiskertaUutiset(uutiskortit).map(k => k.id);
}

function etsiUutinen(uutiskortit, id) {
  return uutiskortit.isot.find(k => k.id === id)
    || uutiskortit.pienet.find(k => k.id === id)
    || uutiskortit.ehdolliset.find(k => k.id === id);
}

// Nostaa yhden uutiskortin GDD 7.1/7.4:n mukaisesti: kertakäyttöiset kuluvat pakasta,
// toistuvat (N1, N43-48) pysyvät aina pakassa, ehdolliset joiden ehto ei täyty
// nostohetkellä palautuvat pakkaan ja seuraava kortti nostetaan tilalle.
// Pakka sekoitetaan uudelleen (täytetään kertakäyttöiset takaisin) kun ne loppuvat.
function nostaUutinen(pelitila, uutiskortit, satunnaisFn) {
  const heitto = satunnaisFn || Math.random;
  const toistuvat = toistuvatUutiset(uutiskortit);

  for (let yritys = 0; yritys < UUTINEN_MAX_UUDELLEENVETO; yritys++) {
    if (pelitila.uutispakka.length === 0) {
      pelitila.uutispakka = luoUutispakka(uutiskortit);
    }

    const pakanKoko = pelitila.uutispakka.length + toistuvat.length;
    const indeksi = Math.floor(heitto() * pakanKoko);

    if (indeksi < pelitila.uutispakka.length) {
      const korttiId = pelitila.uutispakka.splice(indeksi, 1)[0];
      return etsiUutinen(uutiskortit, korttiId);
    }

    const kortti = toistuvat[indeksi - pelitila.uutispakka.length];
    if (!kortti.ehto || kortti.ehto(pelitila)) {
      return kortti;
    }
    // ehto ei täyty: kortti "palautuu pakkaan" (ei koskaan poistunutkaan) ja nostetaan uudelleen
  }

  return null;
}

function sovellaMittarimuutokset(pelitila, muutokset, kentta) {
  if (!muutokset) return;
  for (const ryhmaAvain in muutokset) {
    const ryhma = pelitila.ryhmat[ryhmaAvain];
    ryhma[kentta] = rajaaMittari(ryhma[kentta] + muutokset[ryhmaAvain]);
  }
}

function sovellaUutinen(pelitila, kortti) {
  switch (kortti.erikoinen) {
    case "N2_SISSIT_MAX":
      pelitila.ryhmat.sissit.voima = 9;
      return;
    case "N3_SOTA_TODO":
    case "N5_EI_MAARITELTY":
      // Odottaa vastaavaa järjestelmää (sota / Sasun vahvistus) - ei vaikutusta vielä.
      return;
    case "N4_ARMEIJA_PUOLITA": {
      const nykyinen = pelitila.ryhmat.armeija.voima;
      pelitila.ryhmat.armeija.voima = nykyinen === 0 ? 0 : Math.max(1, Math.floor(nykyinen / 2));
      return;
    }
    case "N6_POLIISI_NOLLAAN":
      pelitila.ryhmat.salainenPoliisi.suosio = 0;
      pelitila.ryhmat.salainenPoliisi.voima = 0;
      return;
    case "N7_LEFTOTO_PUOLITA":
      pelitila.ryhmat.leftoto.voima = Math.floor(pelitila.ryhmat.leftoto.voima / 2);
      return;
    default:
      break;
  }

  sovellaMittarimuutokset(pelitila, kortti.suosio, "suosio");
  sovellaMittarimuutokset(pelitila, kortti.voima, "voima");
  if (typeof kortti.kertaluontoinen === "number") {
    pelitila.kassa += kortti.kertaluontoinen;
  }
  if (typeof kortti.kuukausikulutMuutos === "number") {
    pelitila.kuukausikulut += kortti.kuukausikulutMuutos;
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    luoUutispakka,
    toistuvatUutiset,
    etsiUutinen,
    nostaUutinen,
    sovellaUutinen
  };
}
