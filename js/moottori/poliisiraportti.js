// GDD 12. luku: poliisiraportti (salaisen poliisin tiedusteluraportti).
//
// "1 000 per raportti, ensimmäinen ilmainen. Näyttää kaikkien ryhmien suosio- ja voimapalkit,
// YOUR STRENGTH, STRENGTH FOR REVOLUTION, uhkaindikaattorit."
//
// Raportti on kuukausikierroksen vaiheissa 2 ja 8 (GDD 4). Se ei muuta pelitilaa muuten kuin
// veloittamalla hinnan - kaikki sen näyttämä tieto on jo olemassa, raportti vain paljastaa sen.

// HUOM: samat nimet ovat selaimessa jo globaaleja (kriisi.js / attentaatti.js), eikä niitä
// voi tuoda samalla nimellä var-määrittelyllä - "var TYYTYMATTOMYYS_KYNNYS" törmää kriisi.js:n
// const-määrittelyyn ja kaataa koko tiedoston SyntaxErroriin. Sama ansa kuin sota.js:n
// uutiskortit-törmäys; käytetään erinimisiä paikallisia viittauksia.
if (typeof module !== "undefined") {
  var kriisiModuuli = require("./kriisi.js");
  var tyytymattomyysFn = kriisiModuuli.laskeTyytymattomyys;
  var tyytymattomyysKynnys = kriisiModuuli.TYYTYMATTOMYYS_KYNNYS;
  var attentaattiuhkaFn = require("./attentaatti.js").onkoAttentaattiuhka;
} else {
  var tyytymattomyysFn = laskeTyytymattomyys;
  var tyytymattomyysKynnys = TYYTYMATTOMYYS_KYNNYS;
  var attentaattiuhkaFn = onkoAttentaattiuhka;
}

const POLIISIRAPORTTI_HINTA = 1000;

// GDD 12: "Ei saatavilla kun salaisen poliisin suosio <= 2" eli suosio < 3.
const NAKYVYYSKYNNYS = 3;

// GDD 2.4: uhkaindikaattorit näytetään vain ryhmille jotka oikeasti voivat toimia uhkana.
// Kriisin voi käynnistää vain armeija/talonpojat/maanomistajat (GDD 9.1), ja attentaatin
// vain kotimaan tyyppiset ryhmät (GDD 10, ks. attentaatti.js:n A_RYHMAT).
const KRIISIKYKYISET = ["armeija", "talonpojat", "maanomistajat"];
const ATTENTAATTIKYKYISET = ["armeija", "talonpojat", "maanomistajat", "salainenPoliisi"];

// GDD 2.4: "Kirjain A" = suosio + voima <= 3 (attentaattiuhka), "Numero" = korkea voima +
// matala suosio (kriisiuhka). Numeroksi näytetään tyytymättömyys (voima - suosio) - sama luku
// jolla kriisi.js päättää laukeaako kriisi, eli merkki kertoo pelaajalle täsmälleen sen mitä
// pinnan alla mitataan.
function uhkaindikaattori(pelitila, ryhmaAvain) {
  const ryhma = pelitila.ryhmat[ryhmaAvain];

  if (ATTENTAATTIKYKYISET.includes(ryhmaAvain) && attentaattiuhkaFn(ryhma)) {
    return "A";
  }

  if (KRIISIKYKYISET.includes(ryhmaAvain)) {
    const tyytymattomyys = tyytymattomyysFn(ryhma);
    if (tyytymattomyys >= tyytymattomyysKynnys) return String(tyytymattomyys);
  }

  return null;
}

// GDD 12: raportti ei ole saatavilla kun salaisen poliisin suosio <= 2 tai voima = 0,
// eikä myöskään kun kassa on tyhjä (GDD 3.6: "pelaaja sokeutuu" juuri kun puolustusvalinta
// voi laueta missä tahansa kuussa).
function poliisiraportinSaatavuus(pelitila) {
  const poliisi = pelitila.ryhmat.salainenPoliisi;
  const ilmainen = !pelitila.poliisiraporttiOstettu;
  const hinta = ilmainen ? 0 : POLIISIRAPORTTI_HINTA;

  if (poliisi.suosio < NAKYVYYSKYNNYS) {
    return { saatavilla: false, hinta, ilmainen, syy: "Salainen poliisi ei enää palvele sinua." };
  }
  if (poliisi.voima === 0) {
    return { saatavilla: false, hinta, ilmainen, syy: "Salaisella poliisilla ei ole voimaa kerätä tietoa." };
  }
  if (!ilmainen && (pelitila.kassakriisi || pelitila.kassa < hinta)) {
    return { saatavilla: false, hinta, ilmainen, syy: "Kassa ei riitä raportin ostoon." };
  }

  return { saatavilla: true, hinta, ilmainen, syy: null };
}

// GDD 12: raportin sisältö. Puhdas luku pelitilasta - ei muuta mitään.
function luoPoliisiraportti(pelitila) {
  const rivit = [];
  for (const avain in pelitila.ryhmat) {
    const ryhma = pelitila.ryhmat[avain];
    rivit.push({
      avain,
      nimi: ryhma.nimi,
      suosio: ryhma.suosio,
      voima: ryhma.voima,
      merkki: uhkaindikaattori(pelitila, avain)
    });
  }

  return {
    rivit,
    omaVoima: pelitila.henkivartijoidenVoima,
    vallankumousvoima: pelitila.vallankumousvoima
  };
}

// Sasu (elokuu 2026): raportin sammuminen salaisen poliisin suosion romahdettua ei ole pysyvä
// - "suosio palautuu hiljalleen ja rapsa tulee näkyviin muutaman vuoron jälkeen". Palautuu
// +1/kk VAIN niin kauan kuin suosio on näkyvyyskynnyksen alapuolella, eli täsmälleen sen verran
// että raportti palaa saataville (0 -> 3 kestää kolme kuukautta). Ei siis ilmainen tie takaisin
// salaisen poliisin suosioon, vain ulos sokeudesta.
//
// HUOM: palautus koskee vain suosiota, ei voimaa. Siksi GDD 13:n D9/D10-strategia toimii yhä:
// D9 (lakkauta) nollaa myös voiman, ja voima = 0 pitää raportin lukossa kunnes D10 vahvistaa
// poliisin takaisin. Lakkautettu poliisi ei siis näe mitään pelkän ajan kulumisen ansiosta.
function palautaSalaisenPoliisinSuosio(pelitila) {
  const poliisi = pelitila.ryhmat.salainenPoliisi;
  if (poliisi.suosio >= NAKYVYYSKYNNYS) return false;
  poliisi.suosio += 1;
  return true;
}

// Veloittaa hinnan ja palauttaa raportin. Palauttaa null jos raportti ei ole saatavilla.
function ostaPoliisiraportti(pelitila) {
  const saatavuus = poliisiraportinSaatavuus(pelitila);
  if (!saatavuus.saatavilla) return null;

  pelitila.kassa -= saatavuus.hinta;
  pelitila.poliisiraporttiOstettu = true;

  return luoPoliisiraportti(pelitila);
}

if (typeof module !== "undefined") {
  module.exports = {
    POLIISIRAPORTTI_HINTA,
    NAKYVYYSKYNNYS,
    palautaSalaisenPoliisinSuosio,
    uhkaindikaattori,
    poliisiraportinSaatavuus,
    luoPoliisiraportti,
    ostaPoliisiraportti
  };
}
