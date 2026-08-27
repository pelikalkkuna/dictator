// GDD 11: pako.
//
// HUOM (assumptio): GDD sanoo vuoristopaon onnistuvan kun "sissien voima on matala" ilman
// tarkkaa lukua. Käytetty raja <= 2 (sissit alkavat voimalla 6, joten pako onnistuu käytännössä
// vain jos sissejä on merkittävästi heikennetty - vastaa GDD:n omaa huomiota "sissit käytännössä
// aina uhka"). Ks. CLAUDE.md muistiinpanot.

const VUORISTOPAKO_SISSIT_RAJA = 2;

function yritaVuoristopako(pelitila) {
  return { reitti: "vuoristo", onnistui: pelitila.ryhmat.sissit.voima <= VUORISTOPAKO_SISSIT_RAJA };
}

// GDD 3.5/11: helikopteripako vaatii D12:n ostetun helikopterin. 75% onnistuu suoraan,
// 25% helikopteri on rikki ja pako ratkeaa vuoristopakona varareittinä.
function yritaHelikopteripako(pelitila, heittoFn) {
  const heitto = heittoFn || Math.random;
  if (heitto() < 0.75) {
    return { reitti: "helikopteri", onnistui: true };
  }
  const vuoristo = yritaVuoristopako(pelitila);
  return { reitti: "vuoristo (helikopteri rikki)", onnistui: vuoristo.onnistui };
}

function pakene(pelitila, heittoFn) {
  if (pelitila.helikopteriOstettu) {
    return yritaHelikopteripako(pelitila, heittoFn);
  }
  return yritaVuoristopako(pelitila);
}

if (typeof module !== "undefined") {
  module.exports = { yritaVuoristopako, yritaHelikopteripako, pakene };
}
