let nykyinenAudienssi = null;
let paatosOdottaa = false;

function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
}

function asetaSeuraavaKuukausiNappiTila() {
  const audienssiOdottaa = nykyinenAudienssi && !nykyinenAudienssi.pakkoEi;
  document.getElementById("seuraava-kuukausi-nappi").disabled = !!audienssiOdottaa || paatosOdottaa;
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

function kasitteleUutinen() {
  const kortti = nostaUutinen(pelitila, uutiskortit);
  if (kortti) {
    sovellaUutinen(pelitila, kortti);
  }
  piirraKaikki();
  piirraUutinen(kortti);
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

function ratkaiseAudienssi(hyvaksytty) {
  if (!nykyinenAudienssi || nykyinenAudienssi.pakkoEi) return;

  if (hyvaksytty) {
    hyvaksyAudienssi(pelitila, nykyinenAudienssi.kortti);
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

  document.getElementById("seuraava-kuukausi-nappi").addEventListener("click", () => {
    pelitila.kuukausi += 1;
    kasitteleKassaraportti(pelitila);
    piirraKaikki();
    aloitaAudienssi();
  });

  document.getElementById("hyvaksy-nappi").addEventListener("click", () => ratkaiseAudienssi(true));
  document.getElementById("hylkaa-nappi").addEventListener("click", () => ratkaiseAudienssi(false));

  document.getElementById("paatos-toteuta-nappi").addEventListener("click", toteutaValittuPaatos);
  document.getElementById("paatos-ohita-nappi").addEventListener("click", suljePaatosvalinta);
});
