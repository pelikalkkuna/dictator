// GDD 14: pisteytys.

const TITTELIT = [
  { enintaan: 20, titteli: "Katastrofaalinen", kuvaus: "Historia unohtaa sinut nopeasti" },
  { enintaan: 40, titteli: "Lyhyt valtakausi", kuvaus: "Muistetaan varoittavana esimerkkinä" },
  { enintaan: 65, titteli: "Kunniakas pako", kuvaus: "Selvisit hengissä ja varakkaana" },
  { enintaan: 90, titteli: "Taitava diktaattori", kuvaus: "Ritimba muistaa sinua kaiholla" },
  { enintaan: Infinity, titteli: "Legenda", kuvaus: "Patsas pystyssä — toistaiseksi" }
];

function laskeKokonaissuosio(pelitila) {
  return Object.values(pelitila.ryhmat).reduce((summa, ryhma) => summa + ryhma.suosio, 0);
}

function laskeKuukausibonus(pelitila) {
  return pelitila.kuukausi * 3;
}

function laskeSwissBonus(pelitila, pakeniHengissa) {
  return pakeniHengissa ? pelitila.sveitsinTili / 10000 : 0;
}

function laskeTitteli(pisteet) {
  const pyoristetty = Math.floor(pisteet);
  for (const rivi of TITTELIT) {
    if (pyoristetty <= rivi.enintaan) return rivi;
  }
  return TITTELIT[TITTELIT.length - 1];
}

function laskePisteet(pelitila, pakeniHengissa) {
  const suosio = laskeKokonaissuosio(pelitila);
  const kuukaudet = laskeKuukausibonus(pelitila);
  const swiss = laskeSwissBonus(pelitila, pakeniHengissa);
  const yhteensa = suosio + kuukaudet + swiss;
  return { suosio, kuukaudet, swiss, yhteensa, titteli: laskeTitteli(yhteensa) };
}

if (typeof module !== "undefined") {
  module.exports = {
    laskeKokonaissuosio,
    laskeKuukausibonus,
    laskeSwissBonus,
    laskeTitteli,
    laskePisteet
  };
}
