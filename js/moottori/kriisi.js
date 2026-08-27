// GDD 9. luku: vallankumous, kaappaus ja kapina.
//
// HUOM (yhdessä Sasun kanssa päätetty poikkeama GDD 9.2:n kirjaimellisesta tekstistä):
// GDD 9.2 sanoo laukaisuehdoksi "suosio + voima >= 7", mutta tämä summakaava toimii
// väärään suuntaan verrattuna GDD 2.4:n omaan kuvaukseen ("Korkea voima + matala suosio
// -> uhka") - aloitusarvoilla (suosio7+voima6=13) JOKAINEN ryhmä ylittäisi sen heti pelin
// alussa. Käytetään sen sijaan EROA: tyytymattomyys = voima - suosio, kynnys 3 (aloitusarvo
// 6-7=-1, kaukana kynnyksestä). Kynnysarvo 3 on arvaus, ei simuloitu - voi vaatia säätöä.
//
// HUOM: GDD 9.6 mainitsee "Selviytyminen kaappauksesta/kapinasta: ~25% (D4, tulos 4)".
// Tulkittu tilastolliseksi kuvaukseksi 9.5:n deterministisen voimavertailun lopputulemasta
// (samaan tapaan kuin GDD 8.2:n "Sota syttyy ~90%"), EI erilliseksi D4-nopanheitoksi
// voimavertailun päälle. Jos tämä on väärin, taistelumekaniikka pitää tarkistaa Sasulta.

if (typeof module !== "undefined") {
  var { rajaaMittari } = require("./mittarit.js");
  var kriisikortitData = require("../data/kriisikortit.js").kriisikortit;
} else {
  var kriisikortitData = kriisikortit;
}

const KOTIMAAN_KRIISIRYHMAT = ["armeija", "talonpojat", "maanomistajat"];
const PUOLUSTUSEHDOKKAAT = ["armeija", "talonpojat", "maanomistajat", "salainenPoliisi"];
const TYYTYMATTOMYYS_KYNNYS = 3;

const KRIISITYYPPI = {
  armeija: "KAAPPAUS",
  talonpojat: "VALLANKUMOUS",
  maanomistajat: "KAPINA"
};

function laskeTyytymattomyys(ryhma) {
  return ryhma.voima - ryhma.suosio;
}

function parasPuolustusehdokas(pelitila, poissuljetut) {
  let paras = null;
  for (const avain of PUOLUSTUSEHDOKKAAT) {
    if (poissuljetut.includes(avain)) continue;
    const ryhma = pelitila.ryhmat[avain];
    if (ryhma.suosio < 4) continue;
    if (!paras || ryhma.suosio > pelitila.ryhmat[paras].suosio) {
      paras = avain;
    }
  }
  return paras;
}

function puolustusehdokkaat(pelitila, poissuljetut) {
  return PUOLUSTUSEHDOKKAAT.filter(avain => !poissuljetut.includes(avain) && pelitila.ryhmat[avain].suosio >= 4);
}

// GDD 9.1/9.2: tarkistaa laukeaako kriisi. Ei muuta pelitilaa. Palauttaa kriisiobjektin tai null.
function tarkistaKriisi(pelitila) {
  const ehdokkaat = KOTIMAAN_KRIISIRYHMAT
    .map(avain => ({ avain, tyytymattomyys: laskeTyytymattomyys(pelitila.ryhmat[avain]) }))
    .filter(e => e.tyytymattomyys >= TYYTYMATTOMYYS_KYNNYS)
    .sort((a, b) => b.tyytymattomyys - a.tyytymattomyys);

  if (ehdokkaat.length < 2) return null;

  const kaynnistaja = ehdokkaat[0].avain;
  const liittolainen = ehdokkaat[1].avain;
  const tyyppi = KRIISITYYPPI[kaynnistaja];
  const sissitMukana = tyyppi === "VALLANKUMOUS";

  const yhteisvoima = pelitila.ryhmat[kaynnistaja].voima + pelitila.ryhmat[liittolainen].voima
    + (sissitMukana ? pelitila.ryhmat.sissit.voima : 0);

  const puolustusehdokas = parasPuolustusehdokas(pelitila, [kaynnistaja, liittolainen]);
  const teoreettinenPuolustus = pelitila.henkivartijoidenVoima
    + (puolustusehdokas ? pelitila.ryhmat[puolustusehdokas].voima : 0);

  if (yhteisvoima <= teoreettinenPuolustus) return null;

  return { tyyppi, kaynnistaja, liittolainen, sissitMukana, yhteisvoima };
}

// GDD 9.3: neuvottelu (vain KAAPPAUS/KAPINA). 50/50-heitto.
function neuvotteleOnnistuu(satunnaisFn) {
  const heitto = satunnaisFn || Math.random;
  return heitto() < 0.5;
}

// GDD 9.4: satunnainen vaatimuskortti kriisityypille (C1/C2 tai E1/E2).
function valitseVaatimuskortti(tyyppi, satunnaisFn) {
  const heitto = satunnaisFn || Math.random;
  const kortit = kriisikortitData[tyyppi];
  return kortit[Math.floor(heitto() * kortit.length)];
}

function sovellaMittarimuutokset(pelitila, muutokset, kentta) {
  if (!muutokset) return;
  for (const ryhmaAvain in muutokset) {
    const ryhma = pelitila.ryhmat[ryhmaAvain];
    ryhma[kentta] = rajaaMittari(ryhma[kentta] + muutokset[ryhmaAvain]);
  }
}

// GDD 9.3: hyväksytty vaatimus toteutuu kortin omilla luvuilla (9.4).
function hyvaksyVaatimus(pelitila, kortti) {
  sovellaMittarimuutokset(pelitila, kortti.suosio, "suosio");
  sovellaMittarimuutokset(pelitila, kortti.voima, "voima");
  if (typeof kortti.kertaluontoinen === "number") {
    pelitila.kassa += kortti.kertaluontoinen;
  }
  if (typeof kortti.kuukausikulutMuutos === "number") {
    pelitila.kuukausikulut += kortti.kuukausikulutMuutos;
  }
}

// GDD 9.5: puolustusvalinnan taistelu.
function ratkaisePuolustus(pelitila, kriisi, valittuRyhmaAvain) {
  const pelaajanVoima = pelitila.henkivartijoidenVoima
    + (valittuRyhmaAvain ? pelitila.ryhmat[valittuRyhmaAvain].voima : 0);
  const vihollisenVoima = pelitila.ryhmat[kriisi.kaynnistaja].voima + pelitila.ryhmat[kriisi.liittolainen].voima
    + (kriisi.sissitMukana ? pelitila.ryhmat.sissit.voima : 0);
  return { voitto: pelaajanVoima >= vihollisenVoima, pelaajanVoima, vihollisenVoima };
}

function kriisinRyhmat(kriisi) {
  const ryhmat = [kriisi.kaynnistaja, kriisi.liittolainen];
  if (kriisi.sissitMukana) ryhmat.push("sissit");
  return ryhmat;
}

// GDD 9.6: rangaistusvaihe voitetun taistelun jälkeen.
function rankaiseKapinalliset(pelitila, kriisi) {
  for (const avain of kriisinRyhmat(kriisi)) {
    pelitila.ryhmat[avain].suosio = 0;
    pelitila.ryhmat[avain].voima = 0;
  }
}

function armahdaKapinalliset(pelitila, kriisi) {
  for (const avain of kriisinRyhmat(kriisi)) {
    pelitila.ryhmat[avain].suosio = 0;
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    laskeTyytymattomyys,
    parasPuolustusehdokas,
    puolustusehdokkaat,
    tarkistaKriisi,
    neuvotteleOnnistuu,
    valitseVaatimuskortti,
    hyvaksyVaatimus,
    ratkaisePuolustus,
    rankaiseKapinalliset,
    armahdaKapinalliset
  };
}
