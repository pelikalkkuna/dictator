// GDD 6.1–6.5. Talous-kentät samalla konventiolla kuin audienssit.js:
// kertaluontoinen = kertavaikutus kassaan, kuukausikulutMuutos = suora muutos kuukausikuluihin.
// toistuva: true = kortti ei kulu käytössä (GDD:n "KYLLÄ*"-merkintä).
// erikoinen: HENKIVARTIJAT/SVEITSI/SUURVALTA_VENAJA/SUURVALTA_USA -päätökset käsitellään
// omalla logiikallaan js/moottori/paatokset.js:ssä, ei geneerisellä suosio/voima/talous-sovelluksella.
// ESKALAATIO odottaa sotajärjestelmää (GDD 8. luku), kuten audienssien P1.

const paatoskortit = [
  // 6.1 Miellytä ryhmää
  { id: "D1", paatos: "Nimitä armeijan komentaja varapresidentiksi", toistuva: false,
    suosio: { armeija: 4, talonpojat: -1, maanomistajat: -1, salainenPoliisi: -1 },
    voima: { armeija: 1, sissit: -1, salainenPoliisi: -1 } },
  { id: "D2", paatos: "Perusta ilmaisia klinikoita työläisille", toistuva: false,
    suosio: { armeija: -1, talonpojat: 4, maanomistajat: -1, leftoto: 2, venaja: 1 },
    voima: { sissit: -1 },
    kertaluontoinen: -10000, kuukausikulutMuutos: 4000 },
  { id: "D3", paatos: "Anna maanomistajille alueellista valtaa", toistuva: false,
    suosio: { armeija: -1, talonpojat: -2, maanomistajat: 4, salainenPoliisi: -1, venaja: -1 },
    voima: { armeija: -1, talonpojat: -1, maanomistajat: 2, salainenPoliisi: -1 } },
  { id: "D4", paatos: "Myy USA:n aseita Leftotolle", toistuva: false,
    suosio: { armeija: -2, leftoto: 4, venaja: -2, usa: 1 },
    voima: { armeija: -1, maanomistajat: 1, sissit: -1, leftoto: 3 },
    kertaluontoinen: 50000 },
  { id: "D5", paatos: "Myy kaivoskaupat USA:lle", toistuva: false,
    suosio: { maanomistajat: -1, leftoto: -1, venaja: -2, usa: 3 },
    voima: {},
    kertaluontoinen: 120000 },
  { id: "D6", paatos: "Vuokraa Venäjälle laivastotukikohta", toistuva: false,
    suosio: { armeija: -2, venaja: 3, usa: -3 },
    voima: { leftoto: 1 },
    kuukausikulutMuutos: -10000 },

  // 6.2 Miellytä kaikkia
  { id: "D7", paatos: "Laske yleistä verotusta", toistuva: false,
    suosio: { armeija: 1, talonpojat: 3, maanomistajat: 3 },
    voima: { armeija: -1, sissit: -1 },
    kuukausikulutMuutos: 8000 },
  { id: "D8", paatos: "Järjestä suuri suosiokampanja", toistuva: false,
    suosio: { armeija: 3, talonpojat: 3, maanomistajat: 3 },
    voima: { sissit: -1 },
    kertaluontoinen: -80000 },
  { id: "D9", paatos: "Lakkauta salainen poliisi kokonaan", toistuva: false,
    suosio: { armeija: 3, talonpojat: 3, maanomistajat: 3, salainenPoliisi: -9 },
    voima: { armeija: 2, talonpojat: 1, maanomistajat: 1, sissit: 1, salainenPoliisi: -9 },
    kuukausikulutMuutos: -8000 },

  // 6.3 Paranna mahdollisuuksiasi
  { id: "D10", paatos: "Vahvista salaista poliisia merkittävästi", toistuva: false,
    suosio: { armeija: -3, talonpojat: -3, maanomistajat: -3, salainenPoliisi: 8 },
    voima: { armeija: -1, talonpojat: -1, maanomistajat: -1, sissit: -1, salainenPoliisi: 8 },
    kuukausikulutMuutos: 6000 },
  { id: "D11", paatos: "Vahvista henkivartijoita", toistuva: true,
    suosio: { armeija: -2, talonpojat: -1, maanomistajat: -1, salainenPoliisi: -1 },
    voima: { armeija: -2, salainenPoliisi: -1 },
    kertaluontoinen: -40000, erikoinen: "HENKIVARTIJAT" },
  { id: "D12", paatos: "Osta pakohelikopteri", toistuva: false,
    suosio: { armeija: -4, talonpojat: -1, maanomistajat: -3, salainenPoliisi: -2 },
    voima: {},
    kertaluontoinen: -120000 },
  { id: "D13", paatos: "Siirrä rahaa Sveitsin tilille", toistuva: true,
    erikoinen: "SVEITSI" },

  // 6.4 Hanki rahaa
  { id: "D14", paatos: "Pyydä Venäjältä \"lainaa\"", toistuva: false,
    erikoinen: "SUURVALTA_VENAJA" },
  { id: "D15", paatos: "Pyydä USA:lta \"apua\"", toistuva: false,
    erikoinen: "SUURVALTA_USA" },
  { id: "D16", paatos: "Kansallista Leftoton yritykset", toistuva: false,
    suosio: { armeija: 1, talonpojat: 1, maanomistajat: 3, leftoto: -5, venaja: -2 },
    voima: {},
    kertaluontoinen: 130000, erikoinen: "ESKALAATIO" },

  // 6.5 Vahvista ryhmää
  { id: "D17", paatos: "Osta raskas tykistö armeijalle", toistuva: false,
    suosio: { armeija: 3, leftoto: -3, venaja: -1 },
    voima: { armeija: 5, sissit: -2, leftoto: -2, salainenPoliisi: -1 },
    kertaluontoinen: -50000 },
  { id: "D18", paatos: "Salli talonpoikien vapaa liikkuvuus", toistuva: false,
    suosio: { talonpojat: 3, maanomistajat: -1, salainenPoliisi: -1 },
    voima: { talonpojat: 5, maanomistajat: -1, sissit: 3, salainenPoliisi: -1 } },
  { id: "D19", paatos: "Salli maanomistajien yksityismilitia", toistuva: false,
    suosio: { armeija: -1, talonpojat: -1, maanomistajat: 3, salainenPoliisi: -1 },
    voima: { armeija: -1, talonpojat: -1, maanomistajat: 5, sissit: -1, salainenPoliisi: -1 } }
];

if (typeof module !== "undefined") {
  module.exports = { paatoskortit };
}
