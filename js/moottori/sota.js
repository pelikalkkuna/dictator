// GDD 8. luku: sota.
//
// HUOM (Sasu, elokuu 2026): "REV STR piikkaa... ja palautuu 3 kk:ssa" (8.4) - paluu on
// nopeampi alussa ja hidastuu ("olis realistisempi näin"), ei tasainen lineaarinen askellus.
// Toteutettu kolmiolukupainotuksella: kuukausi 1 poistaa 3/6 alkuperäisestä piikistä,
// kuukausi 2 poistaa 2/6, kuukausi 3 loput 1/6 (pyöristysvirheettä varmuuden vuoksi
// asetetaan viimeisellä kuukaudella suoraan tasan 10:een). Ks. kasitteleVallankumousvoimanPalautuminen.

// HUOM: "uutiskortit" on data/uutiset.js:ssä const-muuttuja, joten sitä ei voi tuoda
// samalla nimellä var-määrittelyllä (SyntaxError selaimessa, jossa se on jo globaali).
// Käytetään erinimistä paikallista viittausta Node-testejä varten.
if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
  var { etsiUutinen, sovellaUutinen } = require("./uutiset.js");
  var uutiskortitData = require("../data/uutiset.js").uutiskortit;
} else {
  var uutiskortitData = uutiskortit;
}

const KOTIMAAN_SOTARYHMAT = ["armeija", "talonpojat", "maanomistajat"];

// GDD 8.2: N1-kierroksen todennäköisyydet. Kierros 4+ käyttää viimeistä riviä (pakko).
const ESKALAATIO_TODENNAKOISYYDET = [
  { sota: 0.40, peraantyminen: 0.10 },
  { sota: 0.60, peraantyminen: 0.15 },
  { sota: 0.85, peraantyminen: 0.20 },
  { sota: 1.00, peraantyminen: 0 }
];

function laskeRitimbanVoima(pelitila) {
  return KOTIMAAN_SOTARYHMAT.reduce((summa, avain) => {
    const ryhma = pelitila.ryhmat[avain];
    return ryhma.suosio >= 4 ? summa + ryhma.voima : summa;
  }, 0);
}

function laskeLeftotonVoima(pelitila) {
  return pelitila.ryhmat.leftoto.voima + pelitila.ryhmat.sissit.voima;
}

const VALLANKUMOUSVOIMA_PALAUTUS_KESTO = 3;
const VALLANKUMOUSVOIMA_BASELINE = 10;

// GDD 8.4: sodan jälkitila voitetulle sodalle (molemmat reitit).
function kasitteleSodanJalkitila(pelitila, ritimbanVoima) {
  pelitila.ryhmat.leftoto.voima = Math.floor(pelitila.ryhmat.leftoto.voima / 2);
  pelitila.vallankumousvoima = ritimbanVoima;
  pelitila.vallankumousvoimaPalautusJaljella = VALLANKUMOUSVOIMA_PALAUTUS_KESTO;
  pelitila.vallankumousvoimaPalautusKesto = VALLANKUMOUSVOIMA_PALAUTUS_KESTO;
  pelitila.vallankumousvoimaAlkuperainenPiikki = Math.max(0, ritimbanVoima - VALLANKUMOUSVOIMA_BASELINE);
}

// GDD 8.4: velkavaihe - VAIN reitti 2:n sodalle, ei A1-pikasodalle. Kasautuu jos päällekkäin.
function aloitaSotaVelka(pelitila, n1Kierrokset) {
  pelitila.sotaVelkaKuukausiaJaljella = (pelitila.sotaVelkaKuukausiaJaljella || 0) + n1Kierrokset;
}

// GDD 8.3: sodan ratkaisu. Palauttaa { voitto, ritimba, leftoto }. Kutsuja päättää velkavaiheesta.
function ratkaiseSota(pelitila) {
  const ritimba = laskeRitimbanVoima(pelitila);
  const leftoto = laskeLeftotonVoima(pelitila);
  const voitto = ritimba >= leftoto;
  if (voitto) {
    kasitteleSodanJalkitila(pelitila, ritimba);
  }
  return { voitto, ritimba, leftoto };
}

// GDD 8.1 Reitti 1: A1-pikasota. Ei N1-puskuria, ei velkaa.
function suoritaPikasota(pelitila) {
  const tulos = ratkaiseSota(pelitila);
  return {
    tyyppi: "pikasota",
    voitto: tulos.voitto,
    ritimba: tulos.ritimba,
    leftoto: tulos.leftoto
  };
}

function aloitaN1Kierre(pelitila) {
  if (pelitila.n1KierreKaynnissa) return;
  pelitila.n1KierreKaynnissa = true;
  pelitila.n1Kierros = 0;
}

// GDD 8.2: yksi N1-kierros. Kutsutaan uutisvaiheessa N1-eskalaation ollessa käynnissä.
function suoritaN1Kierros(pelitila, satunnaisFn) {
  const heitto = satunnaisFn || Math.random;

  sovellaUutinen(pelitila, etsiUutinen(uutiskortitData, "N1"));

  pelitila.n1Kierros += 1;
  const rivi = ESKALAATIO_TODENNAKOISYYDET[Math.min(pelitila.n1Kierros, 4) - 1];

  if (heitto() < rivi.sota) {
    const n1Kierrokset = pelitila.n1Kierros;
    pelitila.n1KierreKaynnissa = false;
    pelitila.n1Kierros = 0;

    const tulos = ratkaiseSota(pelitila);
    if (tulos.voitto) {
      aloitaSotaVelka(pelitila, n1Kierrokset);
    }
    return { tyyppi: "sota", voitto: tulos.voitto, ritimba: tulos.ritimba, leftoto: tulos.leftoto };
  }

  if (heitto() < rivi.peraantyminen) {
    pelitila.n1KierreKaynnissa = false;
    pelitila.n1Kierros = 0;
    return { tyyppi: "peraantyminen" };
  }

  return { tyyppi: "jatkuu", kierros: pelitila.n1Kierros };
}

// GDD 8.4: sotavelka - kutsutaan kuukauden alussa ennen kassaraporttia.
function kasitteleSotaVelka(pelitila) {
  if (!pelitila.sotaVelkaKuukausiaJaljella || pelitila.sotaVelkaKuukausiaJaljella <= 0) return;
  for (const avain of KOTIMAAN_SOTARYHMAT) {
    const ryhma = pelitila.ryhmat[avain];
    ryhma.suosio = rajaaMittari(ryhma.suosio - 1);
  }
  pelitila.sotaVelkaKuukausiaJaljella -= 1;
}

// GDD 8.4: REV STR:n (vallankumousvoima) paluu piikin jälkeen - kutsutaan kuukauden alussa.
// Kolmiolukupainotus: kuukausi jolla on eniten kuukausia jäljellä poistaa suurimman osuuden
// ALKUPERÄISESTÄ piikistä (nopea alku), viimeinen kuukausi asettaa arvon tasan perustasoon
// asti pyöristysvirheistä riippumatta.
function kasitteleVallankumousvoimanPalautuminen(pelitila) {
  if (!pelitila.vallankumousvoimaPalautusJaljella || pelitila.vallankumousvoimaPalautusJaljella <= 0) return;

  const kesto = pelitila.vallankumousvoimaPalautusKesto || pelitila.vallankumousvoimaPalautusJaljella;
  const jaljellaEnnenTataKuukautta = pelitila.vallankumousvoimaPalautusJaljella;
  const painojenSumma = kesto * (kesto + 1) / 2;
  const askel = pelitila.vallankumousvoimaAlkuperainenPiikki * (jaljellaEnnenTataKuukautta / painojenSumma);

  pelitila.vallankumousvoimaPalautusJaljella -= 1;

  if (pelitila.vallankumousvoimaPalautusJaljella <= 0) {
    pelitila.vallankumousvoima = VALLANKUMOUSVOIMA_BASELINE;
  } else {
    pelitila.vallankumousvoima -= askel;
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    laskeRitimbanVoima,
    laskeLeftotonVoima,
    ratkaiseSota,
    suoritaPikasota,
    aloitaN1Kierre,
    suoritaN1Kierros,
    kasitteleSotaVelka,
    kasitteleVallankumousvoimanPalautuminen
  };
}
