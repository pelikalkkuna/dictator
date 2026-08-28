// GDD 4. luku: kuukausikierros.
//
// POIKKEAMAT GDD 4:STÄ (Sasu, pelitestaus elokuu 2026). GDD listaa kahdeksan vaihetta;
// pelitestien perusteella kaksi asiaa muutettiin:
//
// 1. Kassaraportin toistot audienssin (vaihe 4) ja päätöksen (vaihe 6) jälkeen poistettiin:
//    "Se oli 64 pelissä sen takia että tilanne näkyi vain silloin. Voisi olla sama nyt eli
//    pelaaja ei näe kassaa kuin kerran kuun alussa. Sitten päätökset muuttaa sitä miten
//    muuttaakin." Pelaaja saa yhä tietää mitä yksittäinen teko MAKSOI, muttei juoksevaa saldoa.
//
// 2. Poliisiraportti tarjotaan enää KERRAN kuussa, kuukauden viimeisenä toimintona:
//    "Muutetaan niin että poliisiraportti on ostettavissa kk viimeinen toiminto. Jätetään se
//    kassan jälkeen tapahtuva rapsan osto väliin. Ei tarjota kahta kertaa kuussa."
//    Sivuvaikutus on hyvä: raportti ostetaan nyt SEURAAVAA kuukautta varten, joten sen tieto
//    on pelaajan muistin varassa kun päätökset tehdään - juuri kuten GDD 9.5 puolustusvalinnalta
//    edellyttää ("pelaaja valitsee MUISTINSA varassa").
//
// GDD.md:tä eikä docx:ää ole päivitetty - koodi ja nämä kommentit ovat toistaiseksi näiden
// poikkeamien totuudenlähde.
//
//   1 KASSARAPORTTI      ilmainen, kulut vähennetään (velkavaihe tässä jos sodan jälkeen)
//   2 AUDIENSSI          D3 määrää ryhmän, kortti arvotaan pakasta
//   3 PRESIDENTIN PÄÄTÖS yksi per vuoro
//   4 UUTISVAIHE         pakollinen kortin nosto
//   5 POLIISIRAPORTTI    ensimmäinen ilmainen, sitten 1 000, vapaaehtoinen
//
// Tämä moduuli hoitaa vain vaiheiden JÄRJESTYKSEN. Vaiheiden sisältö (audienssi, päätös,
// uutiset) on omissa moottorimoduuleissaan ja niiden ajaminen + piirto on paa.js:n vastuulla.

const KUUKAUSIVAIHEET = [
  { numero: 1, avain: "kassaraportti", nimi: "Kassaraportti" },
  { numero: 2, avain: "audienssi", nimi: "Audienssi" },
  { numero: 3, avain: "paatos", nimi: "Presidentin päätös" },
  { numero: 4, avain: "uutiset", nimi: "Uutisvaihe" },
  { numero: 5, avain: "poliisiraportti", nimi: "Poliisiraportti" }
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
