const pelitila = {
  kuukausi: 1,

  kassa: 1000000,
  kuukausikulut: 45000,
  sveitsinTili: 0,
  kassakriisi: false,

  henkivartijoidenVoima: 4,
  vallankumousvoima: 10,

  ryhmat: {
    armeija: { nimi: "Armeija", suosio: 7, voima: 6 },
    talonpojat: { nimi: "Talonpojat", suosio: 7, voima: 6 },
    maanomistajat: { nimi: "Maanomistajat", suosio: 7, voima: 6 },
    sissit: { nimi: "Sissit", suosio: 0, voima: 6 },
    leftoto: { nimi: "Leftoto", suosio: 7, voima: 6 },
    salainenPoliisi: { nimi: "Salainen poliisi", suosio: 7, voima: 6 },
    venaja: { nimi: "Venäjä", suosio: 7, voima: 0 },
    usa: { nimi: "Yhdysvallat", suosio: 7, voima: 0 }
  },

  // Täytetään käynnistyksessä luoAudienssipakat(audienssikortit):llä.
  audienssipakat: { armeija: [], talonpojat: [], maanomistajat: [] },

  kaytetytPaatokset: [],

  // Täytetään käynnistyksessä luoUutispakka(uutiskortit):llä.
  uutispakka: []
};

if (typeof module !== "undefined") {
  module.exports = { pelitila };
}
