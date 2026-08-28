let nykyinenAudienssi = null;
let nykyinenKriisi = null;

// GDD 4: kuukausikierroksen tila. null = kuukausi ei ole käynnissä (odotetaan aloitusta).
let kierros = null;
let kuukausiaAloitettu = 0;
// true kun käynnissä oleva vaihe odottaa pelaajan omaa valintaa omista napeistaan
// (audienssi, päätös, poliisiraportin osto) - silloin yleinen "Jatka" on lukossa.
let odottaaValintaa = false;

function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
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

function merkitsePeliOhi(viesti, pakeniHengissa) {
  const pisteet = laskePisteet(pelitila, !!pakeniHengissa);
  pelitila.peliOhi = true;
  pelitila.peliOhiViesti = viesti;
  pelitila.peliOhiPisteet = pisteet;
  kierros = null;
  piirraVaihe(null);
  piirraPeliOhi(viesti, pisteet);
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

// ---------------------------------------------------------------- kuukausikierros

function tyhjennaKuukaudenPaneelit() {
  piirraAudienssi(null);
  piirraPaatosvalinta(false);
  piirraUutinen(null);
  piirraAttentaatti(null);
  piirraKassavaihe(null);
  piirraPoliisiraportti(null);
}

function aloitaUusiKuukausi() {
  if (kuukausiaAloitettu > 0) pelitila.kuukausi += 1;
  kuukausiaAloitettu += 1;

  kierros = aloitaKuukausi();
  tyhjennaKuukaudenPaneelit();
  siirraSeuraavaanVaiheeseen();
}

function siirraSeuraavaanVaiheeseen() {
  const vaihe = seuraavaVaihe(kierros);

  if (!vaihe) {
    kierros = null;
    piirraVaihe(null);
    odottaaValintaa = false;
    paivitaEteneminen();
    return;
  }

  piirraVaihe(vaihe);
  suoritaVaihe(vaihe);
}

function suoritaVaihe(vaihe) {
  odottaaValintaa = false;

  switch (vaihe.avain) {
    case "kassaraportti1":
      suoritaKuukaudenAvaus();
      break;
    case "poliisiraportti1":
    case "poliisiraportti2":
      suoritaPoliisiraporttivaihe();
      break;
    case "audienssi":
      suoritaAudienssivaihe();
      break;
    case "kassaraportti2":
      suoritaValikassaraportti(kierros.audienssinKassavaikutus, "Audienssin");
      break;
    case "paatos":
      suoritaPaatosvaihe();
      break;
    case "kassaraportti3":
      suoritaValikassaraportti(kierros.paatoksenKassavaikutus, "Päätöksen");
      break;
    case "uutiset":
      suoritaUutisvaihe();
      break;
  }

  paivitaEteneminen();
}

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
// ratkesi voittoon kesken kuukauden - jatketaan kierrosta ellei mikään keskeyttänyt.
function jatkaKierrosta() {
  if (tarkistaKeskeytykset() || !kierros) {
    paivitaEteneminen();
    return;
  }
  siirraSeuraavaanVaiheeseen();
}

// ---------------------------------------------------------------- vaihe 1: kassaraportti

function suoritaKuukaudenAvaus() {
  const velkaaEnnen = pelitila.sotaVelkaKuukausiaJaljella;

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
  if (pelitila.kassakriisi) {
    teksti += " KASSAKRIISI — rahalliset toiminnot lukossa.";
  }
  piirraKassavaihe(teksti);
}

// ---------------------------------------------------------------- vaiheet 2 ja 8: poliisiraportti

function suoritaPoliisiraporttivaihe() {
  const saatavuus = poliisiraportinSaatavuus(pelitila);
  piirraPoliisiraportti({ saatavuus, raportti: null });
  // Kun raportti ei ole saatavilla, pelaajalla ei ole valintaa - näytetään vain syy.
  odottaaValintaa = saatavuus.saatavilla;
}

// ---------------------------------------------------------------- vaihe 3: audienssi

function suoritaAudienssivaihe() {
  piirraKassavaihe(null);
  piirraPoliisiraportti(null);

  kierros.audienssinKassaEnnen = otaKassatilanne(pelitila);
  const tulos = valitseAudienssi(pelitila, audienssikortit, heitaD3);

  // GDD 4.1: jos kaikkien kolmen ryhmän pakat ovat tyhjät, audienssia ei pidetä tässä kuussa.
  if (!tulos) {
    nykyinenAudienssi = null;
    piirraAudienssi({ tyhja: true });
    kirjaaKassavaikutus(kierros, "audienssinKassavaikutus", kierros.audienssinKassaEnnen, pelitila);
    return;
  }

  // GDD 3.6: kassan kuivuessa rahallinen vaatimus muuttuu automaattisesti pakko-EI:ksi.
  if (onkoPakkoEi(pelitila, tulos.kortti)) {
    hylkaaAudienssi(pelitila, tulos.ryhmaAvain, tulos.kortti);
    nykyinenAudienssi = null;
    kirjaaKassavaikutus(kierros, "audienssinKassavaikutus", kierros.audienssinKassaEnnen, pelitila);
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
  kirjaaKassavaikutus(kierros, "audienssinKassavaikutus", kierros.audienssinKassaEnnen, pelitila);

  piirraKaikki();
  piirraAudienssi({ ratkaistu: true, ryhmaAvain: ratkaistu.ryhmaAvain, kortti: ratkaistu.kortti, hyvaksytty });

  jatkaKierrosta();
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

// ---------------------------------------------------------------- vaiheet 4 ja 6: kassaraportti

function muotoileEro(ero) {
  return (ero >= 0 ? "+" : "−") + muotoileRaha(Math.abs(ero));
}

// Ratkaistu audienssikortti jätetään tarkoituksella näkyviin tämän vaiheen ajaksi, jotta
// pelaaja näkee vierekkäin mitä päätti ja mitä se maksoi. Vaihe 5 piilottaa sen.
function suoritaValikassaraportti(vaikutus, mika) {
  const osat = [];
  if (vaikutus.ennen.kassa !== vaikutus.jalkeen.kassa) {
    osat.push("kassa " + muotoileEro(vaikutus.jalkeen.kassa - vaikutus.ennen.kassa)
      + " → " + muotoileRaha(vaikutus.jalkeen.kassa));
  }
  if (vaikutus.ennen.kuukausikulut !== vaikutus.jalkeen.kuukausikulut) {
    osat.push("kuukausikulut " + muotoileEro(vaikutus.jalkeen.kuukausikulut - vaikutus.ennen.kuukausikulut)
      + " → " + muotoileRaha(vaikutus.jalkeen.kuukausikulut) + "/kk");
  }

  let teksti = mika + " jälkeen: " + osat.join(", ") + ".";
  if (pelitila.kassakriisi) {
    teksti += " KASSAKRIISI — rahalliset toiminnot lukossa.";
  }
  piirraKassavaihe(teksti);
}

// ---------------------------------------------------------------- vaihe 5: presidentin päätös

function suoritaPaatosvaihe() {
  piirraKassavaihe(null);
  piirraAudienssi(null);

  kierros.paatoksenKassaEnnen = otaKassatilanne(pelitila);
  piirraPaatosvalinta(true);
  odottaaValintaa = true;
}

function paataPaatosvaihe() {
  odottaaValintaa = false;
  kirjaaKassavaikutus(kierros, "paatoksenKassavaikutus", kierros.paatoksenKassaEnnen, pelitila);
  piirraPaatosvalinta(false);
  piirraKaikki();
  jatkaKierrosta();
}

function toteutaValittuPaatos() {
  if (!onkoVaiheessa("paatos")) return;

  const valintaEl = document.getElementById("paatos-valinta");
  const paatos = paatoskortit.find(p => p.id === valintaEl.value);
  if (paatos) {
    toteutaPaatos(pelitila, paatos);
    tarkistaSotalaukaisijat(paatos);
  }
  paataPaatosvaihe();
}

// ---------------------------------------------------------------- vaihe 7: uutisvaihe

function viestiPikasodasta(tulos) {
  return tulos.voitto
    ? "Armeija hyökkää Leftotoon — Ritimba voittaa pikasodan! (" + tulos.ritimba + " vs " + tulos.leftoto + ")"
    : "Armeija hyökkää Leftotoon — Ritimba HÄVIÄÄ pikasodan. (" + tulos.ritimba + " vs " + tulos.leftoto + ")";
}

function viestiYllatyshyokkayksesta(tulos) {
  return tulos.voitto
    ? "Leftoto hyökkää yllättäen ilman varoitusta! Ritimba torjuu hyökkäyksen. (" + tulos.ritimba + " vs " + tulos.leftoto + ")"
    : "Leftoto hyökkää yllättäen ilman varoitusta! Ritimba HÄVIÄÄ. (" + tulos.ritimba + " vs " + tulos.leftoto + ")";
}

function viestiN1Tuloksesta(tulos) {
  if (tulos.tyyppi === "sota") {
    return tulos.voitto
      ? "Leftoto hyökkää — Ritimba voittaa sodan! (" + tulos.ritimba + " vs " + tulos.leftoto + ")"
      : "Leftoto hyökkää — Ritimba HÄVIÄÄ sodan. (" + tulos.ritimba + " vs " + tulos.leftoto + ")";
  }
  if (tulos.tyyppi === "peraantyminen") {
    return "Leftoton johto perääntyy! Kansa juhlii diktaattorin voimannäyttöä.";
  }
  return "Leftoton sotauhka jatkuu (kierros " + tulos.kierros + ").";
}

function suoritaUutisvaihe() {
  piirraKassavaihe(null);
  piirraAudienssi(null);
  piirraPaatosvalinta(false);

  kasitteleUutinen();
}

function kasitteleUutinen() {
  let kortti;
  let sotaTulos = null;

  if (pelitila.pikasotaOdottaa) {
    pelitila.pikasotaOdottaa = false;
    sotaTulos = suoritaPikasota(pelitila);
    kortti = { id: "SOTA", tapahtuma: viestiPikasodasta(sotaTulos) };
  } else if (pelitila.n1KierreKaynnissa) {
    const n1Tulos = suoritaN1Kierros(pelitila, Math.random);
    if (n1Tulos.tyyppi === "sota") sotaTulos = n1Tulos;
    kortti = { id: "N1", tapahtuma: viestiN1Tuloksesta(n1Tulos) };
  } else {
    kortti = nostaUutinen(pelitila, uutiskortit);
    if (kortti) {
      sovellaUutinen(pelitila, kortti);
      // GDD:ssä N3 ei koskaan pitäisi laueta normaalilla nostolla A1/N1-eskalaation
      // ulkopuolella, mutta Sasu vahvisti (elokuu 2026) että se on tarkoituksella
      // mahdollinen - harvinainen yllätyssota ilman N1-puskuria (samat säännöt kuin A1).
      if (kortti.erikoinen === "N3_YLLATYSHYOKKAYS") {
        sotaTulos = suoritaPikasota(pelitila);
        kortti = { id: "N3", tapahtuma: viestiYllatyshyokkayksesta(sotaTulos) };
      }
    }
  }

  piirraKaikki();
  piirraUutinen(kortti);

  if (sotaTulos && !sotaTulos.voitto) {
    merkitsePeliOhi("Sota hävitty Leftotoa vastaan — likvidaatio. Peli päättyi.");
    return;
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
    piirraAttentaatti("Attentaattiyritys epäonnistui! Henkivartijasi pelastivat sinut.");
    return false;
  }

  piirraAttentaatti("Attentaatti onnistui. Kuolit virantoimituksessa.");
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

function ratkaiseJaNaytaPuolustustulos(kriisi, valittuRyhmaAvain) {
  const tulos = ratkaisePuolustus(pelitila, kriisi, valittuRyhmaAvain);
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
  jatkaKierrosta();
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

  document.getElementById("hyvaksy-nappi").addEventListener("click", () => ratkaiseAudienssi(true));
  document.getElementById("hylkaa-nappi").addEventListener("click", () => ratkaiseAudienssi(false));

  document.getElementById("paatos-toteuta-nappi").addEventListener("click", toteutaValittuPaatos);
  document.getElementById("paatos-ohita-nappi").addEventListener("click", () => {
    if (!onkoVaiheessa("paatos")) return;
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
      merkitsePeliOhi("Pakenit onnistuneesti (" + tulos.reitti + ")! Selvisit hengissä.", true);
    } else {
      merkitsePeliOhi("Jäit kiinni paetessasi (" + tulos.reitti + ") — likvidaatio. Peli päättyi.", false);
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
