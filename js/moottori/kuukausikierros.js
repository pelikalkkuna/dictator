// GDD 4. luku: kuukausikierros.
//
// POIKKEAMA GDD 4:STÄ (Sasu, pelitestaus elokuu 2026): GDD listaa kahdeksan vaihetta, joissa
// kassaraportti toistetaan audienssin (vaihe 4) ja päätöksen (vaihe 6) jälkeen jos niillä oli
// kassavaikutus. Pelitestissä nämä todettiin turhiksi: "Se oli 64 pelissä sen takia että
// tilanne näkyi vain silloin. Voisi olla sama nyt eli pelaaja ei näe kassaa kuin kerran kuun
// alussa. Sitten päätökset muuttaa sitä miten muuttaakin." Toistot poistettiin, ja kassa
// näytetään enää kerran kuukaudessa vaiheessa 1. Pelaaja saa yhä tietää mitä yksittäinen teko
// MAKSOI (päätöksen tulosnäyttö), muttei juoksevaa saldoa. GDD.md:tä ei ole päivitetty -
// koodi ja tämä kommentti ovat toistaiseksi tämän poikkeaman totuudenlähde.
//
//   1 KASSARAPORTTI      ilmainen, kulut vähennetään (velkavaihe tässä jos sodan jälkeen)
//   2 POLIISIRAPORTTI    ensimmäinen ilmainen, sitten 1 000, vapaaehtoinen
//   3 AUDIENSSI          D3 määrää ryhmän, kortti arvotaan pakasta
//   4 PRESIDENTIN PÄÄTÖS yksi per vuoro
//   5 UUTISVAIHE         pakollinen kortin nosto
//   6 POLIISIRAPORTTI    ostomahdollisuus 1 000
//
// Tämä moduuli hoitaa vain vaiheiden JÄRJESTYKSEN. Vaiheiden sisältö (audienssi, päätös,
// uutiset) on omissa moottorimoduuleissaan ja niiden ajaminen + piirto on paa.js:n vastuulla.

const KUUKAUSIVAIHEET = [
  { numero: 1, avain: "kassaraportti", nimi: "Kassaraportti" },
  { numero: 2, avain: "poliisiraportti1", nimi: "Poliisiraportti" },
  { numero: 3, avain: "audienssi", nimi: "Audienssi" },
  { numero: 4, avain: "paatos", nimi: "Presidentin päätös" },
  { numero: 5, avain: "uutiset", nimi: "Uutisvaihe" },
  { numero: 6, avain: "poliisiraportti2", nimi: "Poliisiraportti" }
];

function aloitaKuukausi() {
  return { vaiheIndeksi: -1 };
}

// Siirtää kierroksen seuraavaan vaiheeseen ja palauttaa sen.
// Palauttaa null kun kuukauden kaikki vaiheet on käyty läpi.
function seuraavaVaihe(kierros) {
  kierros.vaiheIndeksi += 1;
  return KUUKAUSIVAIHEET[kierros.vaiheIndeksi] || null;
}

function nykyinenVaihe(kierros) {
  return KUUKAUSIVAIHEET[kierros.vaiheIndeksi] || null;
}

if (typeof module !== "undefined") {
  module.exports = {
    KUUKAUSIVAIHEET,
    aloitaKuukausi,
    seuraavaVaihe,
    nykyinenVaihe
  };
}
