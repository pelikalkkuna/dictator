// GDD 11: pako.
//
// Sasu (elokuu 2026): vuoristopako on todennäköisyys, ei terävä raja - "mikäli sissien voima
// on pieni ei vuoristossa ole silmiä havaitsemassa pakenevaa diktaattoria, mutta kun sissien
// voima on suuri jää aina kiinni". PakoTodennäköisyys = 1 - sissienVoima/9 (mittariasteikko
// 0-9): voima 0 -> aina onnistuu, voima 9 -> aina kiinni.

function vuoristopaonTodennakoisyys(pelitila) {
  return 1 - (pelitila.ryhmat.sissit.voima / 9);
}

function yritaVuoristopako(pelitila, heittoFn) {
  const heitto = heittoFn || Math.random;
  return { reitti: "vuoristo", onnistui: heitto() < vuoristopaonTodennakoisyys(pelitila) };
}

// GDD 3.5/11: helikopteripako vaatii D12:n ostetun helikopterin. 75% onnistuu suoraan,
// 25% helikopteri on rikki ja pako ratkeaa vuoristopakona varareittinä.
function yritaHelikopteripako(pelitila, heittoFn) {
  const heitto = heittoFn || Math.random;
  if (heitto() < 0.75) {
    return { reitti: "helikopteri", onnistui: true };
  }
  const vuoristo = yritaVuoristopako(pelitila, heittoFn);
  return { reitti: "vuoristo (helikopteri rikki)", onnistui: vuoristo.onnistui };
}

function pakene(pelitila, heittoFn) {
  if (pelitila.helikopteriOstettu) {
    return yritaHelikopteripako(pelitila, heittoFn);
  }
  return yritaVuoristopako(pelitila, heittoFn);
}

if (typeof module !== "undefined") {
  module.exports = { vuoristopaonTodennakoisyys, yritaVuoristopako, yritaHelikopteripako, pakene };
}
