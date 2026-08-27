// GDD 10. luku: attentaatti. "Voimattomien keino syöstä diktaattori vallasta" -
// vastakohta GDD 9:n voimakkaiden-mutta-epäsuosittujen kriiseille.

if (typeof module !== "undefined") {
  var { heitaD3 } = require("./audienssit.js");
}

const A_RYHMAT = ["armeija", "talonpojat", "maanomistajat", "salainenPoliisi"];

// GDD 10: henkivartijoiden voiman ja selviytymisen suhde on annettu vain kolmena
// pisteenä (4/6/8). Yli 8:n mennään viimeisimmällä tunnetulla arvolla (90%) - ei kaavaa
// GDD:ssä, ei ekstrapoloitu. Ks. CLAUDE.md muistiinpanot.
const SELVIYTYMISTAULUKKO = [
  { voima: 4, selviytyminen: 0.50 },
  { voima: 6, selviytyminen: 0.75 },
  { voima: 8, selviytyminen: 0.90 }
];

function onkoAttentaattiuhka(ryhma) {
  return ryhma.suosio + ryhma.voima <= 3;
}

function laskeAUhkaRyhmat(pelitila) {
  return A_RYHMAT.filter(avain => onkoAttentaattiuhka(pelitila.ryhmat[avain]));
}

function selviytymistodennakoisyys(henkivartijoidenVoima) {
  let paras = SELVIYTYMISTAULUKKO[0];
  for (const rivi of SELVIYTYMISTAULUKKO) {
    if (henkivartijoidenVoima >= rivi.voima) paras = rivi;
  }
  return paras.selviytyminen;
}

// GDD 10: jokainen A-ryhmä heittää D3 erikseen, tulos 3 = yritys. Useampi ryhmä = useampi heitto,
// mutta yksikin onnistunut heitto riittää laukaisemaan yhden attentaattiyrityksen kuukaudessa.
function tarkistaAttentaattiyritys(pelitila, heittoFn) {
  const heitto = heittoFn || heitaD3;
  const uhkaRyhmat = laskeAUhkaRyhmat(pelitila);
  let heittoja = 0;
  let tapahtuiko = false;
  for (const avain of uhkaRyhmat) {
    heittoja += 1;
    if (heitto() === 3) tapahtuiko = true;
  }
  return { uhkaRyhmat, heittoja, tapahtuiko };
}

// GDD 10: selviytymiskuoletus. Ei muuta pelitilaa - kutsuja päättää seurauksista.
function ratkaiseAttentaatti(pelitila, heittoFn) {
  const heitto = heittoFn || Math.random;
  const todennakoisyys = selviytymistodennakoisyys(pelitila.henkivartijoidenVoima);
  return { selvisi: heitto() < todennakoisyys, todennakoisyys };
}

if (typeof module !== "undefined") {
  module.exports = {
    onkoAttentaattiuhka,
    laskeAUhkaRyhmat,
    selviytymistodennakoisyys,
    tarkistaAttentaattiyritys,
    ratkaiseAttentaatti
  };
}
