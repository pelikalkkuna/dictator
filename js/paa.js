let nykyinenAudienssi = null;
let paatosOdottaa = false;
let nykyinenKriisi = null;

function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
}

function asetaSeuraavaKuukausiNappiTila() {
  const audienssiOdottaa = nykyinenAudienssi && !nykyinenAudienssi.pakkoEi;
  document.getElementById("seuraava-kuukausi-nappi").disabled =
    pelitila.peliOhi || !!audienssiOdottaa || paatosOdottaa || !!nykyinenKriisi;
}

function merkitsePeliOhi(viesti) {
  pelitila.peliOhi = true;
  pelitila.peliOhiViesti = viesti;
  piirraPeliOhi(viesti);
  asetaSeuraavaKuukausiNappiTila();
}

function tarkistaSotalaukaisijat(kortti) {
  if (!kortti || !kortti.erikoinen) return;
  if (kortti.erikoinen === "PIKASOTA") {
    pelitila.pikasotaOdottaa = true;
  } else if (kortti.erikoinen === "ESKALAATIO") {
    aloitaN1Kierre(pelitila);
  }
}

function viestiPikasodasta(tulos) {
  return tulos.voitto
    ? "Armeija hyökkää Leftotoon — Ritimba voittaa pikasodan! (" + tulos.ritimba + " vs " + tulos.leftoto + ")"
    : "Armeija hyökkää Leftotoon — Ritimba HÄVIÄÄ pikasodan. (" + tulos.ritimba + " vs " + tulos.leftoto + ")";
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
    if (kortti) sovellaUutinen(pelitila, kortti);
  }

  piirraKaikki();
  piirraUutinen(kortti);

  if (sotaTulos && !sotaTulos.voitto) {
    merkitsePeliOhi("Sota hävitty Leftotoa vastaan — likvidaatio. Peli päättyi.");
    return;
  }

  if (kasitteleAttentaattiTarkistus()) return;

  tarkistaJaAloitaKriisi();
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

// GDD 9: voi laukaista missä vaiheessa tahansa - tarkistetaan käytännössä kerran per kuukausi,
// uutisvaiheen jälkeen (viimeinen tilaa muuttava vaihe yksinkertaistetussa kuukausikierrossa).
function tarkistaJaAloitaKriisi() {
  const kriisi = tarkistaKriisi(pelitila);
  if (!kriisi) {
    nykyinenKriisi = null;
    piirraKriisi(null);
    asetaSeuraavaKuukausiNappiTila();
    return;
  }

  nykyinenKriisi = kriisi;
  if (kriisi.tyyppi === "VALLANKUMOUS") {
    siirryPuolustusvaiheeseen(nykyinenKriisi);
  } else {
    nykyinenKriisi.vaihe = "uhka";
    piirraKriisi(nykyinenKriisi);
    asetaSeuraavaKuukausiNappiTila();
  }
}

function siirryPuolustusvaiheeseen(kriisi) {
  kriisi.ehdokkaat = puolustusehdokkaat(pelitila, [kriisi.kaynnistaja, kriisi.liittolainen]);
  if (kriisi.ehdokkaat.length === 0) {
    ratkaiseJaNaytaPuolustustulos(kriisi, null);
    return;
  }
  kriisi.vaihe = "puolustus";
  piirraKriisi(kriisi);
  asetaSeuraavaKuukausiNappiTila();
}

function ratkaiseJaNaytaPuolustustulos(kriisi, valittuRyhmaAvain) {
  const tulos = ratkaisePuolustus(pelitila, kriisi, valittuRyhmaAvain);
  if (tulos.voitto) {
    kriisi.vaihe = "rangaistus";
    piirraKriisi(kriisi);
    asetaSeuraavaKuukausiNappiTila();
  } else {
    nykyinenKriisi = null;
    piirraKriisi(null);
    merkitsePeliOhi(kriisi.tyyppi.charAt(0) + kriisi.tyyppi.slice(1).toLowerCase() + " voitti taistelun palatsista — likvidaatio. Peli päättyi.");
  }
}

function aloitaAudienssi() {
  const tulos = valitseAudienssi(pelitila, audienssikortit, heitaD3);

  if (!tulos) {
    nykyinenAudienssi = null;
    piirraAudienssi(null);
    naytaPaatosvalinta();
  } else if (onkoPakkoEi(pelitila, tulos.kortti)) {
    hylkaaAudienssi(pelitila, tulos.ryhmaAvain, tulos.kortti);
    nykyinenAudienssi = { ryhmaAvain: tulos.ryhmaAvain, kortti: tulos.kortti, pakkoEi: true };
    piirraKaikki();
    piirraAudienssi(nykyinenAudienssi);
    naytaPaatosvalinta();
  } else {
    nykyinenAudienssi = tulos;
    piirraAudienssi(nykyinenAudienssi);
  }

  asetaSeuraavaKuukausiNappiTila();
}

function naytaPaatosvalinta() {
  paatosOdottaa = true;
  piirraPaatosvalinta(true);
  asetaSeuraavaKuukausiNappiTila();
}

function suljePaatosvalinta() {
  paatosOdottaa = false;
  piirraPaatosvalinta(false);
  kasitteleUutinen();
  asetaSeuraavaKuukausiNappiTila();
}

function ratkaiseAudienssi(hyvaksytty) {
  if (!nykyinenAudienssi || nykyinenAudienssi.pakkoEi) return;

  if (hyvaksytty) {
    hyvaksyAudienssi(pelitila, nykyinenAudienssi.kortti);
    tarkistaSotalaukaisijat(nykyinenAudienssi.kortti);
  } else {
    hylkaaAudienssi(pelitila, nykyinenAudienssi.ryhmaAvain, nykyinenAudienssi.kortti);
  }

  nykyinenAudienssi = null;
  piirraKaikki();
  piirraAudienssi(null);
  naytaPaatosvalinta();
}

function toteutaValittuPaatos() {
  const valintaEl = document.getElementById("paatos-valinta");
  const paatos = paatoskortit.find(p => p.id === valintaEl.value);
  if (paatos) {
    toteutaPaatos(pelitila, paatos);
    tarkistaSotalaukaisijat(paatos);
    piirraKaikki();
  }
  suljePaatosvalinta();
}

document.addEventListener("DOMContentLoaded", () => {
  pelitila.audienssipakat = luoAudienssipakat(audienssikortit);
  pelitila.uutispakka = luoUutispakka(uutiskortit);

  piirraKaikki();
  piirraAudienssi(null);
  piirraPaatosvalinta(false);
  piirraUutinen(null);
  piirraAttentaatti(null);
  piirraKriisi(null);
  piirraPeliOhi(null);

  document.getElementById("seuraava-kuukausi-nappi").addEventListener("click", () => {
    if (pelitila.peliOhi) return;
    pelitila.kuukausi += 1;
    kasitteleSotaVelka(pelitila);
    kasitteleVallankumousvoimanPalautuminen(pelitila);
    kasitteleKassaraportti(pelitila);
    piirraKaikki();
    aloitaAudienssi();
  });

  document.getElementById("hyvaksy-nappi").addEventListener("click", () => ratkaiseAudienssi(true));
  document.getElementById("hylkaa-nappi").addEventListener("click", () => ratkaiseAudienssi(false));

  document.getElementById("paatos-toteuta-nappi").addEventListener("click", toteutaValittuPaatos);
  document.getElementById("paatos-ohita-nappi").addEventListener("click", suljePaatosvalinta);

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
    nykyinenKriisi = null;
    piirraKaikki();
    piirraKriisi(null);
    asetaSeuraavaKuukausiNappiTila();
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

  document.getElementById("kriisi-rankaise-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "rangaistus") return;
    rankaiseKapinalliset(pelitila, nykyinenKriisi);
    nykyinenKriisi = null;
    piirraKaikki();
    piirraKriisi(null);
    asetaSeuraavaKuukausiNappiTila();
  });

  document.getElementById("kriisi-armahda-nappi").addEventListener("click", () => {
    if (!nykyinenKriisi || nykyinenKriisi.vaihe !== "rangaistus") return;
    armahdaKapinalliset(pelitila, nykyinenKriisi);
    nykyinenKriisi = null;
    piirraKaikki();
    piirraKriisi(null);
    asetaSeuraavaKuukausiNappiTila();
  });
});
