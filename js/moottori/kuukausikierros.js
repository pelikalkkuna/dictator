// GDD 4. luku: kuukausikierros.
//
// Jokainen vuoro on yksi kuukausi, joka etenee kahdeksassa vaiheessa:
//
//   1 KASSARAPORTTI      ilmainen, kulut vähennetään (velkavaihe tässä jos sodan jälkeen)
//   2 POLIISIRAPORTTI    ensimmäinen ilmainen, sitten 1 000, vapaaehtoinen
//   3 AUDIENSSI          D3 määrää ryhmän, kortti arvotaan pakasta
//   4 KASSARAPORTTI      VAIN jos audienssin päätöksellä oli kassavaikutus
//   5 PRESIDENTIN PÄÄTÖS yksi per vuoro
//   6 KASSARAPORTTI      VAIN jos päätöksellä oli kassavaikutus
//   7 UUTISVAIHE         pakollinen kortin nosto
//   8 POLIISIRAPORTTI    ostomahdollisuus 1 000
//
// Tämä moduuli hoitaa vain vaiheiden JÄRJESTYKSEN ja ehdollisten vaiheiden ohituksen.
// Vaiheiden sisältö (audienssi, päätös, uutiset) on omissa moottorimoduuleissaan ja
// niiden ajaminen + piirto on paa.js:n vastuulla.

const KUUKAUSIVAIHEET = [
  { numero: 1, avain: "kassaraportti1", nimi: "Kassaraportti" },
  { numero: 2, avain: "poliisiraportti1", nimi: "Poliisiraportti" },
  { numero: 3, avain: "audienssi", nimi: "Audienssi" },
  { numero: 4, avain: "kassaraportti2", nimi: "Kassaraportti" },
  { numero: 5, avain: "paatos", nimi: "Presidentin päätös" },
  { numero: 6, avain: "kassaraportti3", nimi: "Kassaraportti" },
  { numero: 7, avain: "uutiset", nimi: "Uutisvaihe" },
  { numero: 8, avain: "poliisiraportti2", nimi: "Poliisiraportti" }
];

function aloitaKuukausi() {
  return {
    vaiheIndeksi: -1,
    audienssinKassavaikutus: null,
    paatoksenKassavaikutus: null
  };
}

// Kassavaikutuksen tunnistus vaiheita 4 ja 6 varten. GDD 3.2: "Kulumuutokset astuvat voimaan
// heti ja kumuloituvat" - siksi myös kuukausikulujen muutos lasketaan kassavaikutukseksi,
// ei pelkkä kassan saldon muutos.
function otaKassatilanne(pelitila) {
  return { kassa: pelitila.kassa, kuukausikulut: pelitila.kuukausikulut };
}

function onkoKassavaikutus(ennen, jalkeen) {
  return ennen.kassa !== jalkeen.kassa || ennen.kuukausikulut !== jalkeen.kuukausikulut;
}

function kirjaaKassavaikutus(kierros, kentta, ennen, pelitila) {
  const jalkeen = otaKassatilanne(pelitila);
  kierros[kentta] = onkoKassavaikutus(ennen, jalkeen) ? { ennen, jalkeen } : null;
}

// GDD 4: vaiheet 4 ja 6 ajetaan vain jos edellisellä vaiheella oli kassavaikutus.
function ohitetaankoVaihe(kierros, vaihe) {
  if (vaihe.avain === "kassaraportti2") return !kierros.audienssinKassavaikutus;
  if (vaihe.avain === "kassaraportti3") return !kierros.paatoksenKassavaikutus;
  return false;
}

// Siirtää kierroksen seuraavaan ajettavaan vaiheeseen ja palauttaa sen.
// Palauttaa null kun kuukauden kaikki vaiheet on käyty läpi.
function seuraavaVaihe(kierros) {
  let indeksi = kierros.vaiheIndeksi + 1;
  while (indeksi < KUUKAUSIVAIHEET.length && ohitetaankoVaihe(kierros, KUUKAUSIVAIHEET[indeksi])) {
    indeksi += 1;
  }
  kierros.vaiheIndeksi = indeksi;
  return indeksi < KUUKAUSIVAIHEET.length ? KUUKAUSIVAIHEET[indeksi] : null;
}

function nykyinenVaihe(kierros) {
  return KUUKAUSIVAIHEET[kierros.vaiheIndeksi] || null;
}

if (typeof module !== "undefined") {
  module.exports = {
    KUUKAUSIVAIHEET,
    aloitaKuukausi,
    otaKassatilanne,
    onkoKassavaikutus,
    kirjaaKassavaikutus,
    ohitetaankoVaihe,
    seuraavaVaihe,
    nykyinenVaihe
  };
}
