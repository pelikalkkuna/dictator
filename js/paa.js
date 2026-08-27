let nykyinenAudienssi = null;

function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
}

function asetaSeuraavaKuukausiNappiTila() {
  const odottaaVastausta = nykyinenAudienssi && !nykyinenAudienssi.pakkoEi;
  document.getElementById("seuraava-kuukausi-nappi").disabled = !!odottaaVastausta;
}

function aloitaAudienssi() {
  const tulos = valitseAudienssi(pelitila, audienssikortit, heitaD3);

  if (!tulos) {
    nykyinenAudienssi = null;
  } else if (onkoPakkoEi(pelitila, tulos.kortti)) {
    hylkaaAudienssi(pelitila, tulos.ryhmaAvain, tulos.kortti);
    nykyinenAudienssi = { ryhmaAvain: tulos.ryhmaAvain, kortti: tulos.kortti, pakkoEi: true };
    piirraKaikki();
  } else {
    nykyinenAudienssi = tulos;
  }

  piirraAudienssi(nykyinenAudienssi);
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
  asetaSeuraavaKuukausiNappiTila();
}

document.addEventListener("DOMContentLoaded", () => {
  pelitila.audienssipakat = luoAudienssipakat(audienssikortit);

  piirraKaikki();
  piirraAudienssi(null);

  document.getElementById("seuraava-kuukausi-nappi").addEventListener("click", () => {
    pelitila.kuukausi += 1;
    kasitteleKassaraportti(pelitila);
    piirraKaikki();
    aloitaAudienssi();
  });

  document.getElementById("hyvaksy-nappi").addEventListener("click", () => ratkaiseAudienssi(true));
  document.getElementById("hylkaa-nappi").addEventListener("click", () => ratkaiseAudienssi(false));
});
