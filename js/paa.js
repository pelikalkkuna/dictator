let nykyinenAudienssi = null;
let nykyinenKriisi = null;

// GDD 4: kuukausikierroksen tila. null = kuukausi ei ole käynnissä (odotetaan aloitusta).
let kierros = null;
let kuukausiaAloitettu = 0;
// true kun käynnissä oleva vaihe odottaa pelaajan omaa valintaa omista napeistaan
// (audienssi, päätös, raportin osto) tai kun jännitysjakso on kesken - silloin yleinen
// "Jatka" on lukossa.
let odottaaValintaa = false;

function odota(millisekuntia) {
  return new Promise(ratkaise => setTimeout(ratkaise, millisekuntia));
}

function piirraKaikki() {
  piirraKuukausi();
}

function onkoVaiheessa(...avaimet) {
  const vaihe = kierros && nykyinenVaihe(kierros);
  return !!vaihe && avaimet.includes(vaihe.avain);
}

function paivitaEteneminen() {
  const nappi = document.getElementById("seuraava-kuukausi-nappi");

  if (pelitila.peliOhi) {
    nappi.disabled = true;
    return;
  }

  nappi.textContent = kierros === null
    ? "Aloita kuukausi " + (kuukausiaAloitettu === 0 ? pelitila.kuukausi : pelitila.kuukausi + 1)
    : "Jatka";
  nappi.disabled = odottaaValintaa || !!nykyinenKriisi;
}

function merkitsePeliOhi(viesti, pakeniHengissa, kuva) {
  const pisteet = laskePisteet(pelitila, !!pakeniHengissa);
  pelitila.peliOhi = true;
  pelitila.peliOhiViesti = viesti;
  pelitila.peliOhiPisteet = pisteet;
  kierros = null;
  piirraVaihe(null);
  piirraPeliOhi(viesti, pisteet, kuva || (pakeniHengissa ? "loppu-pako" : "loppu-kuolema"));
  paivitaEteneminen();
}

function tarkistaSotalaukaisijat(kortti) {
  if (!kortti || !kortti.erikoinen) return;
  if (kortti.erikoinen === "PIKASOTA") {
    pelitila.pikasotaOdottaa = true;
  } else if (kortti.erikoinen === "ESKALAATIO") {
    aloitaN1Kierre(pelitila);
  } else if (kortti.erikoinen === "HELIKOPTERI") {
    pelitila.helikopteriOstettu = true;
  }
}

// ---------------------------------------------------------------- jännitysjaksot

// Sasu (pelitestaus elokuu 2026): "Sota meni vauhdilla. Siinä kuin joku pikku uutinen.
// Taistelusekvenssiin kuuluu jännitys. Lähtee erillinen poikkeustilanäyttö päälle jossa on
// taistelun ääniä ja hetken ammuskelun jälkeen kerrotaan lopputulos."
const TAISTELUN_KESTO = 2800;
const ODOTUKSEN_KESTO = 2600;

async function naytaTaistelusekvenssi(otsikko, kuvaus, tulosTeksti, voitto, kuva) {
  odottaaValintaa = true;
  paivitaEteneminen();

  piirraSekvenssi({ otsikko, teksti: kuvaus, kuva });
  const lopetaAanet = aloitaTaisteluAanet(TAISTELUN_KESTO);
  await odota(TAISTELUN_KESTO);
  lopetaAanet();
  soitaLopputulos(voitto);

  piirraSekvenssi({ otsikko, teksti: "Tuli vaimenee", tulos: tulosTeksti, kuva });
  odottaaValintaa = false;
  paivitaEteneminen();
}

// Sasu (pelitestaus): "Tässä lainan haussa on kans oma jännitysnäyttö sodan tyyliin. Heti
// odotellaan USA/RUS mikä päätös tulee."
async function naytaOdotussekvenssi(otsikko, kuvaus, tulosTeksti, myonteinen, kuva) {
  odottaaValintaa = true;
  paivitaEteneminen();

  piirraSekvenssi({ otsikko, teksti: kuvaus, tyyli: "odotus", kuva });
  const alku = Date.now();
  while (Date.now() - alku < ODOTUKSEN_KESTO) {
    soitaOdotusPulssi();
    await odota(650);
  }
  soitaLopputulos(myonteinen);

  piirraSekvenssi({ otsikko, teksti: "Vastaus saapuu", tulos: tulosTeksti, tyyli: "odotus", kuva });
  odottaaValintaa = false;
  paivitaEteneminen();
}

// ---------------------------------------------------------------- kuukausikierros

function tyhjennaKuukaudenPaneelit() {
  piirraAudienssi(null);
  piirraPaatosvalinta(false);
  piirraPaatosTulos(null);
  piirraUutinen(null);
  piirraAttentaatti(null);
  piirraKassavaihe(null);
  piirraPoliisiraportti(null);
  piirraSekvenssi(null);
}

function aloitaUusiKuukausi() {
  if (kuukausiaAloitettu > 0) pelitila.kuukausi += 1;
  kuukausiaAloitettu += 1;

  kierros = aloitaKuukausi();
  tyhjennaKuukaudenPaneelit();
  siirraSeuraavaanVaiheeseen();
}

async function siirraSeuraavaanVaiheeseen() {
  const vaihe = seuraavaVaihe(kierros);

  if (!vaihe) {
    kierros = null;
    piirraVaihe(null);
    odottaaValintaa = false;
    paivitaEteneminen();
    return;
  }

  piirraVaihe(vaihe);
  await suoritaVaihe(vaihe);
}

async function suoritaVaihe(vaihe) {
  odottaaValintaa = false;

  switch (vaihe.avain) {
    case "kassaraportti":
      suoritaKuukaudenAvaus();
      break;
    case "poliisiraportti1":
    case "poliisiraportti2":
      suoritaPoliisiraporttivaihe(vaihe.avain === "poliisiraportti2");
      break;
    case "audienssi":
      suoritaAudienssivaihe();
      break;
    case "paatos":
      suoritaPaatosvaihe();
      break;
    case "uutiset":
      await suoritaUutisvaihe();
      break;
  }

  paivitaEteneminen();
  vieritaNakyviin(VAIHEEN_PANEELI[vaihe.avain]);
}

// Mihin paneeliin kunkin vaiheen huomio kuuluu, jotta uusi vaihe tuodaan näkyviin.
const VAIHEEN_PANEELI = {
  kassaraportti: "kassavaihe",
  poliisiraportti1: "poliisiraportti",
  poliisiraportti2: "poliisiraportti",
  audienssi: "audienssi",
  paatos: "paatos",
  uutiset: "uutinen"
};

// GDD 4: "ATTENTAATTI ja VALLANKUMOUS / KAAPPAUS / KAPINA voivat laueta missä vaiheessa
// tahansa ja ketjuuntua." Kriisitarkistus on deterministinen (tarkistaKriisi ei heitä noppaa),
// joten se voidaan ajaa jokaisen tilaa muuttavan vaiheen jälkeen ilman että kriisien määrä
// muuttuu - kriisi vain laukeaa heti sen teon jälkeen joka kaatoi kupin, ei vasta kuun lopussa.
// Attentaatti sen sijaan on satunnainen (D3/kk per A-ryhmä), joten se heitetään tasan kerran
// kuukaudessa uutisvaiheessa, kuten GDD 10 määrää.
//
// Palauttaa true jos kierros keskeytyi (peli päättyi tai kriisi otti vallan).
function tarkistaKeskeytykset() {
  if (pelitila.peliOhi) return true;
  return tarkistaJaAloitaKriisi();
}

// Kutsutaan kun pelaajan oma valinta päätti vaiheen (audienssi, päätös) tai kun kriisi
// ratkesi voittoon kesken kuukauden. EI siirry automaattisesti seuraavaan vaiheeseen:
// pelaaja saa lukea rauhassa mitä juuri tapahtui ja painaa itse "Jatka". Kuukausi kertyy
// näin ruudulle ylhäältä alas tapahtumaketjuna (Sasu, pelitestaus: "kk etenee sivuna
// alaspäin -> tapahtumat tuntuvat etenevän").
function paataVaihe() {
  odottaaValintaa = false;
  tarkistaKeskeytykset();
  paivitaEteneminen();
}

// ---------------------------------------------------------------- vaihe 1: kassaraportti

function suoritaKuukaudenAvaus() {
  const velkaaEnnen = pelitila.sotaVelkaKuukausiaJaljella;

  // Salaisen poliisin suosio palautuu hiljalleen näkyvyyskynnykseen asti, jotta raportin
  // sammuminen on väliaikainen sokeus eikä pelin loppuun kestävä (Sasu, elokuu 2026).
  const poliisiToipui = palautaSalaisenPoliisinSuosio(pelitila);

  kasitteleSotaVelka(pelitila);
  kasitteleVallankumousvoimanPalautuminen(pelitila);
  // GDD 12: REV STR on "vaan rapsa" (Sasu, elokuu 2026) - pelaajalle näytettävä varoituslukema,
  // ei osa taistelulaskentaa. Seuraa kriisikykyisten ryhmien tyytymättömyyttä paitsi kun
  // sodanjälkeinen piikki+palautuminen on kesken (silloin se ohittaa perustason väliaikaisesti).
  if (pelitila.vallankumousvoimaPalautusJaljella <= 0) {
    pelitila.vallankumousvoima = laskeVallankumousvoimanPerustaso(pelitila);
  }
  kasitteleKassaraportti(pelitila);
  piirraKaikki();

  let teksti = "Kuukausikulut " + muotoileRaha(pelitila.kuukausikulut) + " vähennetty. "
    + "Kassa: " + muotoileRaha(pelitila.kassa) + ".";
  if (velkaaEnnen > 0) {
    teksti += " Sodan jälkilasku: kotimaan ryhmien suosio −1 (" + velkaaEnnen + " kk jäljellä).";
  }
  if (poliisiToipui) {
    teksti += " Salainen poliisi toipuu hitaasti epäsuosiostaan.";
  }
  if (pelitila.kassakriisi) {
    teksti += " KASSAKRIISI — rahalliset toiminnot lukossa.";
  }
  piirraKassavaihe(teksti);
}

// ---------------------------------------------------------------- vaiheet 2 ja 6: poliisiraportti

function suoritaPoliisiraporttivaihe(kuunLopussa) {
  siirraPoliisiraporttiVaiheeseen(kuunLopussa);

  const saatavuus = poliisiraportinSaatavuus(pelitila);
  piirraPoliisiraportti({ saatavuus, raportti: null });
  // Kun raportti ei ole saatavilla, pelaajalla ei ole valintaa - näytetään vain syy.
  odottaaValintaa = saatavuus.saatavilla;
}

// ---------------------------------------------------------------- vaihe 3: audienssi

function suoritaAudienssivaihe() {
  // Poliisiraportti on kertaluonteinen tilannekuva: se katoaa kun vaihe vaihtuu, jotta
  // puolustusvalinta tehdään muistin varassa (GDD 9.5).
  piirraPoliisiraportti(null);

  const tulos = valitseAudienssi(pelitila, audienssikortit, heitaD3);

  // GDD 4.1: jos kaikkien kolmen ryhmän pakat ovat tyhjät, audienssia ei pidetä tässä kuussa.
  if (!tulos) {
    nykyinenAudienssi = null;
    piirraAudienssi({ tyhja: true });
    return;
  }

  // GDD 3.6: kassan kuivuessa rahallinen vaatimus muuttuu automaattisesti pakko-EI:ksi.
  if (onkoPakkoEi(pelitila, tulos.kortti)) {
    hylkaaAudienssi(pelitila, tulos.ryhmaAvain, tulos.kortti);
    nykyinenAudienssi = null;
    piirraKaikki();
    piirraAudienssi({ ryhmaAvain: tulos.ryhmaAvain, kortti: tulos.kortti, pakkoEi: true });
    tarkistaKeskeytykset();
    return;
  }

  nykyinenAudienssi = tulos;
  piirraAudienssi(nykyinenAudienssi);
  odottaaValintaa = true;
}

function ratkaiseAudienssi(hyvaksytty) {
  if (!onkoVaiheessa("audienssi")) return;
  if (!nykyinenAudienssi || nykyinenAudienssi.pakkoEi || nykyinenAudienssi.tyhja) return;

  const ratkaistu = nykyinenAudienssi;

  if (hyvaksytty) {
    hyvaksyAudienssi(pelitila, ratkaistu.kortti);
    tarkistaSotalaukaisijat(ratkaistu.kortti);
  } else {
    hylkaaAudienssi(pelitila, ratkaistu.ryhmaAvain, ratkaistu.kortti);
  }

  nykyinenAudienssi = null;
  odottaaValintaa = false;

  piirraKaikki();
  piirraAudienssi({ ratkaistu: true, ryhmaAvain: ratkaistu.ryhmaAvain, kortti: ratkaistu.kortti, hyvaksytty });

  paataVaihe();
}

// GDD 1.5: swipe-mekaniikka audiensseissa (oikealle = kyllä, vasemmalle = ei).
function alustaAudienssiSwipe() {
  const audienssiEl = document.getElementById("audienssi");
  const SWIPE_RAJA = 80;
  let alkuX = null;
  let siirtyma = 0;

  function paivitaAsento() {
    audienssiEl.style.transition = "none";
    audienssiEl.style.transform = "translateX(" + siirtyma + "px) rotate(" + (siirtyma / 20) + "deg)";
    audienssiEl.style.opacity = String(1 - Math.min(Math.abs(siirtyma) / 400, 0.6));
  }

  function nollaaAsento() {
    audienssiEl.style.transition = "";
    audienssiEl.style.transform = "";
    audienssiEl.style.opacity = "";
  }

  audienssiEl.addEventListener("pointerdown", (e) => {
    if (!nykyinenAudienssi || nykyinenAudienssi.pakkoEi || nykyinenAudienssi.tyhja) return;
    // Napit hoitavat oman klikkauksensa: setPointerCapture ohjaisi pointer-tapahtumat
    // korttiin, jolloin napin click-tapahtuma jää kokonaan syntymättä.
    if (e.target.closest("button")) return;
    alkuX = e.clientX;
    audienssiEl.setPointerCapture(e.pointerId);
  });

  audienssiEl.addEventListener("pointermove", (e) => {
    if (alkuX === null) return;
    siirtyma = e.clientX - alkuX;
    paivitaAsento();
  });

  function lopetaSwipe() {
    if (alkuX === null) return;
    const paatettySiirtyma = siirtyma;
    alkuX = null;
    siirtyma = 0;

    if (paatettySiirtyma > SWIPE_RAJA) {
      ratkaiseAudienssi(true);
    } else if (paatettySiirtyma < -SWIPE_RAJA) {
      ratkaiseAudienssi(false);
    } else {
      nollaaAsento();
    }
  }

  audienssiEl.addEventListener("pointerup", lopetaSwipe);
  audienssiEl.addEventListener("pointercancel", lopetaSwipe);
}

// ---------------------------------------------------------------- vaihe 4: presidentin päätös

function suoritaPaatosvaihe() {
  piirraPaatosvalinta(true);
  odottaaValintaa = true;
}

function valittuPaatoskortti() {
  const valintaEl = document.getElementById("paatos-valinta");
  return paatoskortit.find(p => p.id === valintaEl.value) || null;
}

// Sasu (pelitestaus): päätöksen tulos jäi aiemmin kokonaan kertomatta - Venäjän laina saattoi
// tuottaa nolla markkaa täysin hiljaa ja polttaa silti kertakäyttöisen kortin.
function viestiPaatoksesta(paatos, tulos) {
  if (paatos.erikoinen === "SVEITSI") {
    return tulos.onnistui
      ? "Siirsit " + muotoileRaha(tulos.siirretty) + " Sveitsin tilille."
      : tulos.viesti + " — siirto ei onnistunut.";
  }
  if (paatos.erikoinen === "SUURVALTA_VENAJA" || paatos.erikoinen === "SUURVALTA_USA") {
    const maa = paatos.erikoinen === "SUURVALTA_VENAJA" ? "Venäjä" : "Yhdysvallat";
    return tulos.apu > 0
      ? maa + " myöntää " + muotoileRaha(tulos.apu) + "."
      : maa + " kuuntelee kohteliaasti eikä lupaa mitään. Et saanut markkaakaan.";
  }
  if (paatos.erikoinen === "HELIKOPTERI") {
    return "Pakohelikopteri hankittu ja piilotettu palatsin katolle. Hinta "
      + muotoileRaha(Math.abs(paatos.kertaluontoinen)) + ".";
  }
  if (paatos.erikoinen === "HENKIVARTIJAT") {
    return "Henkivartijakaarti vahvistettu. Hinta " + muotoileRaha(Math.abs(paatos.kertaluontoinen)) + ".";
  }

  let viesti = paatos.paatos + " — toteutettu.";
  if (typeof paatos.kertaluontoinen === "number" && paatos.kertaluontoinen !== 0) {
    viesti += paatos.kertaluontoinen < 0
      ? " Hinta " + muotoileRaha(-paatos.kertaluontoinen) + "."
      : " Tuotti " + muotoileRaha(paatos.kertaluontoinen) + ".";
  }
  if (typeof paatos.kuukausikulutMuutos === "number" && paatos.kuukausikulutMuutos !== 0) {
    viesti += paatos.kuukausikulutMuutos > 0
      ? " Kuukausikulut nousevat " + muotoileRaha(paatos.kuukausikulutMuutos) + "."
      : " Kuukausikulut laskevat " + muotoileRaha(-paatos.kuukausikulutMuutos) + ".";
  }
  return viesti;
}

function paataPaatosvaihe() {
  odottaaValintaa = false;
  piirraPaatosvalinta(false);
  piirraKaikki();
  paataVaihe();
}

async function toteutaValittuPaatos() {
  if (!onkoVaiheessa("paatos")) return;

  const paatos = valittuPaatoskortti();
  if (!paatos) {
    paataPaatosvaihe();
    return;
  }

  const tulos = toteutaPaatos(pelitila, paatos);
  tarkistaSotalaukaisijat(paatos);
  const viesti = viestiPaatoksesta(paatos, tulos);

  piirraPaatosvalinta(false);
  piirraKaikki();

  // Suurvalta-apu on oma jännityshetkensä: vastausta odotetaan, sitten se kerrotaan.
  if (paatos.erikoinen === "SUURVALTA_VENAJA" || paatos.erikoinen === "SUURVALTA_USA") {
    const maa = paatos.erikoinen === "SUURVALTA_VENAJA" ? "Moskova" : "Washington";
    await naytaOdotussekvenssi(
      "Suurlähetystö: " + maa,
      "Lähettilääsi odottaa vastausta",
      viesti,
      tulos.apu > 0,
      paatos.erikoinen === "SUURVALTA_VENAJA" ? "laina-moskova" : "laina-washington"
    );
    piirraKaikki();
    paataVaihe();
    return;
  }

  piirraPaatosTulos(viesti);
  paataPaatosvaihe();
}

// ---------------------------------------------------------------- vaihe 5: uutisvaihe

function viestiSodasta(tulos, johdanto) {
  return tulos.voitto
    ? johdanto + " Ritimba voittaa! (" + tulos.ritimba + " vs " + tulos.leftoto + ")"
    : johdanto + " Ritimba HÄVIÄÄ. (" + tulos.ritimba + " vs " + tulos.leftoto + ")";
}

function viestiN1Tuloksesta(tulos) {
  if (tulos.tyyppi === "peraantyminen") {
    return "Leftoton johto perääntyy! Kansa juhlii diktaattorin voimannäyttöä.";
  }
  return "Leftoton sotauhka jatkuu (kierros " + tulos.kierros + ").";
}

async function suoritaUutisvaihe() {
  await kasitteleUutinen();
}

async function kasitteleUutinen() {
  let kortti;
  let sotaTulos = null;
  let sotaOtsikko = "";
  let sotaKuvaus = "";
  let sotaKuva = null;

  if (pelitila.pikasotaOdottaa) {
    pelitila.pikasotaOdottaa = false;
    sotaTulos = suoritaPikasota(pelitila);
    sotaOtsikko = "SOTA — hyökkäys Leftotoon";
    sotaKuvaus = "Ritimban joukot ylittävät rajan";
    sotaKuva = "sota-hyokkays";
    kortti = { tapahtuma: viestiSodasta(sotaTulos, "Armeija hyökkää Leftotoon.") };
  } else if (pelitila.n1KierreKaynnissa) {
    const n1Tulos = suoritaN1Kierros(pelitila, Math.random);
    if (n1Tulos.tyyppi === "sota") {
      sotaTulos = n1Tulos;
      sotaOtsikko = "SOTA — Leftoto hyökkää";
      sotaKuvaus = "Rajalla käydään taistelua";
      sotaKuva = "sota-puolustus";
      kortti = { tapahtuma: viestiSodasta(n1Tulos, "Leftoto hyökkää.") };
    } else {
      kortti = { tapahtuma: viestiN1Tuloksesta(n1Tulos) };
    }
  } else {
    kortti = nostaUutinen(pelitila, uutiskortit);
    if (kortti) {
      sovellaUutinen(pelitila, kortti);
      // GDD:ssä N3 ei koskaan pitäisi laueta normaalilla nostolla A1/N1-eskalaation
      // ulkopuolella, mutta Sasu vahvisti (elokuu 2026) että se on tarkoituksella
      // mahdollinen - harvinainen yllätyssota ilman N1-puskuria (samat säännöt kuin A1).
      if (kortti.erikoinen === "N3_YLLATYSHYOKKAYS") {
        sotaTulos = suoritaPikasota(pelitila);
        sotaOtsikko = "SOTA — yllätyshyökkäys";
        sotaKuvaus = "Leftoto hyökkäsi ilman varoitusta";
        sotaKuva = "sota-yllatys";
        kortti = { tapahtuma: viestiSodasta(sotaTulos, "Leftoto hyökkää yllättäen ilman varoitusta!") };
      }
    }
  }

  piirraKaikki();

  // Sota saa oman jännitysjaksonsa uutispaneelin sijaan.
  if (sotaTulos) {
    await naytaTaistelusekvenssi(sotaOtsikko, sotaKuvaus, kortti.tapahtuma, sotaTulos.voitto, sotaKuva);
    if (!sotaTulos.voitto) {
      merkitsePeliOhi("Sota hävitty Leftotoa vastaan — likvidaatio. Peli päättyi.");
      return;
    }
  } else {
    piirraUutinen(kortti);
  }

  if (kasitteleAttentaattiTarkistus()) return;

  tarkistaKeskeytykset();
}

// GDD 10: attentaatti - "voimattomien keino syöstä diktaattori vallasta". Palauttaa true
// jos peli päättyi (attentaatti onnistui), jolloin kutsuja ei jatka kriisitarkistukseen.
function kasitteleAttentaattiTarkistus() {
  const yritys = tarkistaAttentaattiyritys(pelitila);
  if (!yritys.tapahtuiko) {
    piirraAttentaatti(null);
    return false;
  }

  const tulos = ratkaiseAttentaatti(pelitila);
  if (tulos.selvisi) {
    piirraAttentaatti("Attentaattiyritys epäonnistui! Henkivartijasi pelastivat sinut.", "attentaatti-torjuttu");
    return false;
  }

  piirraAttentaatti("Attentaatti onnistui. Kuolit virantoimituksessa.", "attentaatti-onnistui");
  merkitsePeliOhi("Attentaatti onnistui — kuolit. Peli päättyi.");
  return true;
}

// ---------------------------------------------------------------- kriisit (GDD 9)

// Palauttaa true jos kriisi laukesi ja otti kierroksen haltuunsa.
function tarkistaJaAloitaKriisi() {
  const kriisi = tarkistaKriisi(pelitila);
  if (!kriisi) {
    nykyinenKriisi = null;
    piirraKriisi(null);
    return false;
  }

  nykyinenKriisi = kriisi;
  if (kriisi.tyyppi === "VALLANKUMOUS") {
    siirryPuolustusvaiheeseen(nykyinenKriisi);
  } else {
    nykyinenKriisi.vaihe = "uhka";
    piirraKriisi(nykyinenKriisi);
    paivitaEteneminen();
  }
  return pelitila.peliOhi || !!nykyinenKriisi;
}

function siirryPuolustusvaiheeseen(kriisi) {
  kriisi.ehdokkaat = puolustusehdokkaat(pelitila, [kriisi.kaynnistaja, kriisi.liittolainen]);
  if (kriisi.ehdokkaat.length === 0) {
    ratkaiseJaNaytaPuolustustulos(kriisi, null);
    return;
  }
  kriisi.vaihe = "puolustus";
  piirraKriisi(kriisi);
  paivitaEteneminen();
}

async function ratkaiseJaNaytaPuolustustulos(kriisi, valittuRyhmaAvain) {
  const tulos = ratkaisePuolustus(pelitila, kriisi, valittuRyhmaAvain);

  piirraKriisi(null);
  await naytaTaistelusekvenssi(
    "TAISTELU PALATSISTA",
    "Palatsin pihalla käydään taistelua",
    tulos.voitto ? "Torjuit hyökkäyksen. Palatsi on yhä sinun." : "Puolustus murtuu.",
    tulos.voitto,
    "taistelu-palatsista"
  );

  if (tulos.voitto) {
    kriisi.vaihe = "rangaistus";
    piirraKriisi(kriisi);
    paivitaEteneminen();
  } else {
    nykyinenKriisi = null;
    piirraKriisi(null);
    merkitsePeliOhi(kriisi.tyyppi.charAt(0) + kriisi.tyyppi.slice(1).toLowerCase() + " voitti taistelun palatsista — likvidaatio. Peli päättyi.");
  }
}

// Kriisi ratkesi voittoon - jatketaan kuukautta siitä vaiheesta johon se keskeytti.
function paataKriisi() {
  nykyinenKriisi = null;
  piirraKaikki();
  piirraKriisi(null);
  paataVaihe();
}

// ---------------------------------------------------------------- käynnistys

document.addEventListener("DOMContentLoaded", () => {
  pelitila.audienssipakat = luoAudienssipakat(audienssikortit);
  pelitila.uutispakka = luoUutispakka(uutiskortit);

  piirraKaikki();
  piirraVaihe(null);
  tyhjennaKuukaudenPaneelit();
  piirraKriisi(null);
  piirraPeliOhi(null);
  paivitaEteneminen();

  alustaAudienssiSwipe();

  document.getElementById("seuraava-kuukausi-nappi").addEventListener("click", () => {
    if (pelitila.peliOhi) return;
    if (kierros === null) {
      aloitaUusiKuukausi();
    } else {
      siirraSeuraavaanVaiheeseen();
    }
  });

  document.getElementById("aani-nappi").addEventListener("click", (e) => {
    const paalla = vaihdaAani();
    e.currentTarget.textContent = "Ääni: " + (paalla ? "päällä" : "pois");
    e.currentTarget.setAttribute("aria-pressed", String(paalla));
  });

  document.getElementById("hyvaksy-nappi").addEventListener("click", () => ratkaiseAudienssi(true));
  document.getElementById("hylkaa-nappi").addEventListener("click", () => ratkaiseAudienssi(false));

  // Vapaaehtoinen vaikutusten esikatselu ennen päätöstä (Sasu, pelitestaus).
  document.getElementById("audienssi-vaikutukset-nappi").addEventListener("click", (e) => {
    if (!nykyinenAudienssi || nykyinenAudienssi.pakkoEi || nykyinenAudienssi.tyhja) return;
    const naytossa = !document.getElementById("audienssi-vaikutukset").classList.contains("piilossa");
    piirraVaikutukset("audienssi-vaikutukset", naytossa ? null : nykyinenAudienssi.kortti);
    e.currentTarget.textContent = naytossa ? "Näytä vaikutukset" : "Piilota vaikutukset";
  });

  document.getElementById("paatos-valinta").addEventListener("change", () => {
    piirraPaatoksenEsikatselu(valittuPaatoskortti());
  });

  document.getElementById("paatos-toteuta-nappi").addEventListener("click", toteutaValittuPaatos);
  document.getElementById("paatos-ohita-nappi").addEventListener("click", () => {
    if (!onkoVaiheessa("paatos")) return;
    piirraPaatosTulos("Et tehnyt päätöstä tässä kuussa.");
    paataPaatosvaihe();
  });

  document.getElementById("poliisiraportti-osta-nappi").addEventListener("click", () => {
    if (!onkoVaiheessa("poliisiraportti1", "poliisiraportti2")) return;
    const raportti = ostaPoliisiraportti(pelitila);
    if (!raportti) return;
    odottaaValintaa = false;
    piirraKaikki();
    piirraPoliisiraportti({ saatavuus: poliisiraportinSaatavuus(pelitila), raportti });
    paivitaEteneminen();
  });

  document.getElementById("poliisiraportti-ohita-nappi").addEventListener("click", () => {
    if (!onkoVaiheessa("poliisiraportti1", "poliisiraportti2")) return;
    odottaaValintaa = false;
    piirraPoliisiraportti(null);
    siirraSeuraavaanVaiheeseen();
  });

  document.getElementById("kriisi-neuvottele-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "uhka") return;
    if (neuvotteleOnnistuu()) {
      nykyinenKriisi.vaatimuskortti = valitseVaatimuskortti(nykyinenKriisi.tyyppi);
      nykyinenKriisi.vaihe = "vaatimus";
      piirraKriisi(nykyinenKriisi);
    } else {
      siirryPuolustusvaiheeseen(nykyinenKriisi);
    }
  });

  document.getElementById("kriisi-taistele-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "uhka") return;
    siirryPuolustusvaiheeseen(nykyinenKriisi);
  });

  document.getElementById("kriisi-hyvaksy-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "vaatimus") return;
    hyvaksyVaatimus(pelitila, nykyinenKriisi.vaatimuskortti);
    paataKriisi();
  });

  document.getElementById("kriisi-hylkaa-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "vaatimus") return;
    siirryPuolustusvaiheeseen(nykyinenKriisi);
  });

  document.getElementById("kriisi-puolusta-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "puolustus") return;
    const valittu = document.getElementById("kriisi-puolustus-valinta").value;
    ratkaiseJaNaytaPuolustustulos(nykyinenKriisi, valittu);
  });

  document.getElementById("kriisi-pakene-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "puolustus") return;
    const tulos = pakene(pelitila);
    nykyinenKriisi = null;
    piirraKriisi(null);
    if (tulos.onnistui) {
      merkitsePeliOhi("Pakenit onnistuneesti (" + tulos.reitti + ")! Selvisit hengissä.", true,
        tulos.reitti === "helikopteri" ? "pako-helikopteri" : "pako-vuoristo");
    } else {
      merkitsePeliOhi("Jäit kiinni paetessasi (" + tulos.reitti + ") — likvidaatio. Peli päättyi.", false,
        "pako-kiinni");
    }
  });

  document.getElementById("kriisi-rankaise-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "rangaistus") return;
    rankaiseKapinalliset(pelitila, nykyinenKriisi);
    paataKriisi();
  });

  document.getElementById("kriisi-armahda-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "rangaistus") return;
    armahdaKapinalliset(pelitila, nykyinenKriisi);
    paataKriisi();
  });
});
