// GDD 6. luku: presidentin päätökset.

if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
}

const SUURVALTA_AVUN_TAULUKKO = [
  { enintaan: 0, apu: 0 },
  { enintaan: 3, apu: 50000 },
  { enintaan: 4, apu: 130000 },
  { enintaan: 6, apu: 200000 },
  { enintaan: 8, apu: 270000 },
  { enintaan: Infinity, apu: 330000 }
];

function suurvaltaAvunSumma(suosioero) {
  if (suosioero <= 0) return 0;
  for (const rivi of SUURVALTA_AVUN_TAULUKKO) {
    if (suosioero <= rivi.enintaan) return rivi.apu;
  }
  return 330000;
}

function onkoRahallinenPaatos(paatos) {
  return typeof paatos.kertaluontoinen === "number" && paatos.kertaluontoinen < 0;
}

// GDD 6: "Rahalliset päätökset lukittuvat kassan kuivuessa." D13 (Sveitsin tili) käyttää
// omaa kassa <= 2000 -ehtoaan eikä geneeristä kertaluontoinen-kenttää, joten sitä ei lukita tässä.
function onkoPaatosKaytettavissa(pelitila, paatos) {
  if (!paatos.toistuva && pelitila.kaytetytPaatokset.includes(paatos.id)) {
    return false;
  }
  if (pelitila.kassakriisi && onkoRahallinenPaatos(paatos)) {
    return false;
  }
  return true;
}

function sovellaMittarimuutokset(pelitila, muutokset, kentta) {
  if (!muutokset) return;
  for (const ryhmaAvain in muutokset) {
    const ryhma = pelitila.ryhmat[ryhmaAvain];
    ryhma[kentta] = rajaaMittari(ryhma[kentta] + muutokset[ryhmaAvain]);
  }
}

// GDD 3.3: Sveitsiläinen pankkitili.
function siirraSveitsinTilille(pelitila) {
  if (pelitila.kassa <= 2000) {
    return { onnistui: false, viesti: "Pankkikulut estävät siirron" };
  }
  const puoli = pelitila.kassa / 2;
  const pyoristetty = Math.floor(puoli / 1000) * 1000;
  const netto = pyoristetty - 2000;
  pelitila.kassa -= pyoristetty;
  pelitila.sveitsinTili += netto;
  return { onnistui: true, siirretty: netto };
}

// GDD 3.4: suurvalta-apu.
function pyydaSuurvaltaApua(pelitila, avunantajaAvain, toinenAvain) {
  const suosioero = pelitila.ryhmat[avunantajaAvain].suosio - pelitila.ryhmat[toinenAvain].suosio;
  const apu = suurvaltaAvunSumma(suosioero);
  pelitila.kassa += apu;
  return apu;
}

function toteutaPaatos(pelitila, paatos) {
  let tulos = { onnistui: true };

  if (paatos.erikoinen === "SVEITSI") {
    tulos = siirraSveitsinTilille(pelitila);
  } else if (paatos.erikoinen === "SUURVALTA_VENAJA") {
    tulos = { onnistui: true, apu: pyydaSuurvaltaApua(pelitila, "venaja", "usa") };
  } else if (paatos.erikoinen === "SUURVALTA_USA") {
    tulos = { onnistui: true, apu: pyydaSuurvaltaApua(pelitila, "usa", "venaja") };
  } else {
    sovellaMittarimuutokset(pelitila, paatos.suosio, "suosio");
    sovellaMittarimuutokset(pelitila, paatos.voima, "voima");
    if (typeof paatos.kertaluontoinen === "number") {
      pelitila.kassa += paatos.kertaluontoinen;
    }
    if (typeof paatos.kuukausikulutMuutos === "number") {
      pelitila.kuukausikulut += paatos.kuukausikulutMuutos;
    }
    if (paatos.erikoinen === "HENKIVARTIJAT") {
      pelitila.henkivartijoidenVoima += 2;
    }
  }

  if (!paatos.toistuva && tulos.onnistui) {
    pelitila.kaytetytPaatokset.push(paatos.id);
  }
  return tulos;
}

if (typeof module !== "undefined") {
  module.exports = {
    suurvaltaAvunSumma,
    onkoRahallinenPaatos,
    onkoPaatosKaytettavissa,
    siirraSveitsinTilille,
    pyydaSuurvaltaApua,
    toteutaPaatos
  };
}
