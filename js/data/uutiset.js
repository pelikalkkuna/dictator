// GDD 7.1–7.4. Sama talous-konventio kuin audienssit.js/paatokset.js.
//
// erikoinen-kentät joita ei voi ilmaista suosio/voima-deltana, käsitellään
// js/moottori/uutiset.js:ssä:
//   N1_SOTAUHKA        — toistuva, GDD 8. luvun N1-eskalaatiokierre (sota syttyykö/N3) EI VIELÄ
//                         toteutettu, tulossa toteutusjärjestyksen kohdassa 7 (Sota).
//   N2_SISSIT_MAX       — sissien voima asetetaan suoraan 9:ään.
//   N3_SOTA_TODO        — "Sota laukeaa": sodan ratkaisu (GDD 8. luku) EI VIELÄ toteutettu,
//                         kortti kuluu mutta ei tee mitään ennen sotajärjestelmää.
//   N4_ARMEIJA_PUOLITA  — "Armeijan voima romahtaa": armeijan voima puolitetaan (pyöristys alas),
//                         mutta ei koskaan alle 1:n (Sasu, elokuu 2026: "iso voima iso vaikutus,
//                         pieni voima pienempi vaikutus, ei kuitenkaan mene ikinä nollaan").
//   N5_EI_MAARITELTY    — "Kassatulot laskevat" / "−tuloja" ilman lukua GDD:ssä. EI TOTEUTETTU,
//                         odottaa Sasun vahvistusta.
//   N6_POLIISI_NOLLAAN  — salaisen poliisin suosio JA voima asetetaan 0:aan.
//   N7_LEFTOTO_PUOLITA  — Leftoton voima puolitetaan (pyöristys alas).
//
// N12: "−5k/kk (til.)" — "(til.)" viittaa tilapäisyyteen jota GDD ei määrittele (kesto?).
// Toteutettu toistaiseksi pysyvänä kuukausikulutMuutoksena. Ks. CLAUDE.md muistiinpanot.

const uutiskortit = {
  isot: [
    { id: "N1", tapahtuma: "Leftoton sotauhka", toistuva: true,
      suosio: { armeija: 1, talonpojat: 1, maanomistajat: 1 },
      erikoinen: "N1_SOTAUHKA" },
    { id: "N2", tapahtuma: "Kuubalaiset aseistivat sissit", toistuva: false,
      erikoinen: "N2_SISSIT_MAX" },
    { id: "N3", tapahtuma: "Leftoto hyökkää!", toistuva: false,
      erikoinen: "N3_SOTA_TODO" },
    { id: "N4", tapahtuma: "Armeijan asevarasto räjähti", toistuva: false,
      erikoinen: "N4_ARMEIJA_PUOLITA" },
    { id: "N5", tapahtuma: "Banaanien hinta romahtaa", toistuva: false,
      erikoinen: "N5_EI_MAARITELTY" },
    { id: "N6", tapahtuma: "Presidentti hukkasi poliisin kansiot", toistuva: false,
      erikoinen: "N6_POLIISI_NOLLAAN" },
    { id: "N7", tapahtuma: "Maanjäristys Leftotossa", toistuva: false,
      erikoinen: "N7_LEFTOTO_PUOLITA" }
  ],

  pienet: [
    { id: "N8", tapahtuma: "Ritimba voittaa Leftoton jalkapallossa!",
      suosio: { talonpojat: 2, leftoto: -1 }, kertaluontoinen: -10000 },
    { id: "N9", tapahtuma: "Laaja sähkökatko pääkaupungissa",
      suosio: { maanomistajat: -1 }, voima: { salainenPoliisi: -1 } },
    { id: "N10", tapahtuma: "Yhdysvaltalainen filmitähti vierailee",
      suosio: { usa: 2, venaja: -2, maanomistajat: 1 }, kertaluontoinen: -15000 },
    { id: "N11", tapahtuma: "Kenraali kiinni sikarien salakuljetuksesta",
      suosio: { armeija: -1, talonpojat: 1 }, kertaluontoinen: 20000 },
    { id: "N12", tapahtuma: "Rankkasateet viivästyttävät kahvisatoa",
      suosio: { talonpojat: -1, maanomistajat: -1 }, kuukausikulutMuutos: 5000 },
    { id: "N13", tapahtuma: "Neuvostoliiton valtionbaletti esiintyy",
      suosio: { venaja: 2, usa: -2, leftoto: 1 } },
    { id: "N14", tapahtuma: "Mysteerisukellusvene havaittu rannikolla",
      suosio: { armeija: 1, usa: 1, venaja: -2 } },
    { id: "N15", tapahtuma: "Kultainen patsas presidentistä valmistuu",
      suosio: { maanomistajat: 1, talonpojat: -2 }, kertaluontoinen: -25000 },
    { id: "N16", tapahtuma: "Uusi saippuaooppera pysäyttää koko maan arjen",
      suosio: { talonpojat: 2 }, voima: { sissit: -1 }, kertaluontoinen: -5000 },
    { id: "N17", tapahtuma: "Kansallislotto paljastuu valtion huijaukseksi",
      suosio: { talonpojat: -2, salainenPoliisi: 1 }, kertaluontoinen: 30000 },
    { id: "N18", tapahtuma: "Leftoton johtaja pilkkaa presidenttiä radiossa",
      suosio: { armeija: 1, talonpojat: 1, maanomistajat: 1, leftoto: -3 } },
    { id: "N19", tapahtuma: "Yhdysvaltalainen risteilyalus vierailee satamassa",
      suosio: { usa: 2, venaja: -1 }, voima: { sissit: 1 }, kertaluontoinen: 15000 },
    { id: "N20", tapahtuma: "Kansallinen vapaapäivä presidentin koiralle",
      suosio: { talonpojat: 1, maanomistajat: -1 }, kertaluontoinen: -2000 },
    { id: "N21", tapahtuma: "Sissit töhrivät palatsin muurin yöllä",
      suosio: { salainenPoliisi: -1 }, voima: { sissit: 1 } },
    { id: "N22", tapahtuma: "Neuvostoliittolainen shakkimestari häviää paikalliselle",
      suosio: { venaja: -1, usa: 1, talonpojat: 1 } },
    { id: "N23", tapahtuma: "Amerikkalainen viskilasti \"katoaa\" satamassa",
      suosio: { usa: -1, armeija: 1 }, kertaluontoinen: 5000 },
    { id: "N24", tapahtuma: "Leftoton lehmälauma eksyy rajan yli",
      suosio: { leftoto: -1, maanomistajat: 1 } },
    { id: "N25", tapahtuma: "Pieni maanjäristys rikkoo astioita",
      suosio: { talonpojat: -1, armeija: 1 } },
    { id: "N26", tapahtuma: "Yhdysvaltain suurlähettiläs valittaa hotellin aamiaisesta",
      suosio: { usa: -1, talonpojat: 1 } },
    { id: "N27", tapahtuma: "Armeijan uudet univormut kutistuvat pesussa",
      suosio: { armeija: -1 }, voima: { sissit: 1 }, kertaluontoinen: -2000 },
    { id: "N28", tapahtuma: "Neuvostoliitto lahjoittaa presidentille karhunpennun",
      suosio: { venaja: 1, usa: -1 }, kertaluontoinen: -1000 },
    { id: "N29", tapahtuma: "Kansallislintu rauhoitetaan lailla",
      suosio: { talonpojat: 1, maanomistajat: -1 } },
    { id: "N30", tapahtuma: "Salainen poliisi pidättää vahingossa postimiehen",
      suosio: { salainenPoliisi: -1, armeija: 1 } },
    { id: "N31", tapahtuma: "Presidentin serkku voittaa \"yllättäen\" kauneuskilpailun",
      suosio: { maanomistajat: 1, talonpojat: -1 }, kertaluontoinen: -5000 },
    { id: "N32", tapahtuma: "Maan ainoa juna suistuu raiteilta lehmän takia",
      suosio: { talonpojat: -1, maanomistajat: -1 }, kertaluontoinen: -2000 },
    { id: "N33", tapahtuma: "Neuvostoliiton diplomaatti laulaa kännissä USA:n kansallislaulun",
      suosio: { venaja: -1, usa: 1 } },
    { id: "N34", tapahtuma: "Uusien postimerkkien liima maistuu valkosipulilta",
      suosio: { talonpojat: -1, salainenPoliisi: 1 } },
    { id: "N35", tapahtuma: "Presidentti julistautuu \"tieteiden tohtoriksi\" unensa perusteella",
      suosio: { maanomistajat: -1, talonpojat: 1 } },
    { id: "N36", tapahtuma: "Sissit räjäyttävät vahingossa oman rommivarastonsa",
      suosio: { armeija: 1 }, voima: { sissit: -1 } },
    { id: "N37", tapahtuma: "Leftoto väittää Ritimban kansallisruokaa omakseen",
      suosio: { leftoto: -2, talonpojat: 1, maanomistajat: 1 } },
    { id: "N38", tapahtuma: "Kenraalin papukaija karkaa ja huutelee valtiosalaisuuksia torilla",
      suosio: { armeija: -1, salainenPoliisi: 1 } },
    { id: "N39", tapahtuma: "CIA pudottaa vahingossa propagandalehtisensä mereen",
      suosio: { usa: -1, salainenPoliisi: 1 } },
    { id: "N40", tapahtuma: "Maatalousministeriö \"kadotti\" budjettinsa Monacon kasinolle",
      suosio: { talonpojat: -2, maanomistajat: 1 }, kertaluontoinen: -5000 },
    { id: "N41", tapahtuma: "Pääkaupunkiin iskee valtavien viidakkosammakoiden vitsaus",
      suosio: { talonpojat: -1, armeija: 1 } },
    { id: "N42", tapahtuma: "Valtion radio soittaa vahingossa sissien taistelulaulun",
      suosio: { salainenPoliisi: -1 }, voima: { sissit: 1 } }
  ],

  ehdolliset: [
    { id: "N43", tapahtuma: "Tyytymättömät talonpojat pakenevat viidakkoon", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.talonpojat.suosio <= 2,
      voima: { sissit: 2, talonpojat: -1 } },
    { id: "N44", tapahtuma: "Nuoret pojat värväytyvät kapinallisiin", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.talonpojat.suosio <= 3 && pelitila.ryhmat.maanomistajat.suosio >= 6,
      voima: { sissit: 1 }, suosio: { maanomistajat: -1 } },
    { id: "N45", tapahtuma: "Armeija nappaa sissipartion vuoristossa", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.armeija.voima >= 7 && pelitila.ryhmat.armeija.suosio >= 5,
      voima: { sissit: -2 }, suosio: { armeija: 1 } },
    { id: "N46", tapahtuma: "Salainen poliisi paljastaa sissien soluverkoston", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.salainenPoliisi.voima >= 7,
      voima: { sissit: -1 }, suosio: { salainenPoliisi: 1 } },
    { id: "N47", tapahtuma: "Sissit saavat amerikkalaisia aseita salaa", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.usa.suosio <= 2 && pelitila.ryhmat.venaja.suosio >= 5,
      voima: { sissit: 2 }, suosio: { usa: -1 } },
    { id: "N48", tapahtuma: "Kirkonmies tuomitsee diktatuurin saarnassaan", toistuva: true,
      ehto: pelitila => pelitila.ryhmat.talonpojat.suosio <= 3 && pelitila.ryhmat.maanomistajat.suosio <= 3,
      voima: { sissit: 1 }, suosio: { talonpojat: -1 } }
  ]
};

if (typeof module !== "undefined") {
  module.exports = { uutiskortit };
}
