let nykyinenAudienssi = null;
let paatosOdottaa = false;

function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
}

function asetaSeuraavaKuukausiNappiTila() {
  const audienssiOdottaa = nykyinenAudienssi && !nykyinenAudienssi.pakkoEi;
  document.getElementById("seuraava-kuukausi-nappi").disabled =
    pelitila.peliOhi || !!audienssiOdottaa || paatosOdottaa;
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
});
