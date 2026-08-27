// GDD 9.4: neuvotteluvaatimuskortit. Sama talous-konventio kuin muissa datatiedostoissa.

const kriisikortit = {
  KAAPPAUS: [
    { id: "C1", vaatimus: "Nimitä kenraali varapresidentiksi",
      suosio: { armeija: 1 }, voima: { armeija: 3 }, kuukausikulutMuutos: 5000 },
    { id: "C2", vaatimus: "Anna armeijalle täysi autonomia",
      suosio: { armeija: 1, talonpojat: -1, maanomistajat: -1 }, voima: { armeija: 2, sissit: -1 } }
  ],
  KAPINA: [
    { id: "E1", vaatimus: "Kevennä maaverotusta merkittävästi",
      suosio: { maanomistajat: 1, talonpojat: -2 }, voima: { maanomistajat: 1 }, kuukausikulutMuutos: 8000 },
    { id: "E2", vaatimus: "Salli yksityismilitioiden laillistaminen",
      suosio: { maanomistajat: 1, armeija: -1, talonpojat: -2 }, voima: { maanomistajat: 3, sissit: -1 } }
  ]
};

if (typeof module !== "undefined") {
  module.exports = { kriisikortit };
}
