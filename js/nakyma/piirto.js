function muotoileRaha(maara) {
  return maara.toLocaleString("fi-FI");
}

function piirraKuukausi() {
  document.getElementById("kuukausi-teksti").textContent = "Kuukausi " + pelitila.kuukausi;
}

function piirraKassaraportti() {
  const kassaEl = document.getElementById("kassa-teksti");
  kassaEl.textContent = "Valtion kassa: " + muotoileRaha(pelitila.kassa) + " (kulut " + muotoileRaha(pelitila.kuukausikulut) + "/kk)";

  const laatikkoEl = document.getElementById("kassaraportti");
  laatikkoEl.classList.toggle("kriisi", pelitila.kassakriisi);
}

function piirraRyhmat() {
  const listaEl = document.getElementById("ryhmat-lista");
  listaEl.innerHTML = "";
  for (const avain in pelitila.ryhmat) {
    const ryhma = pelitila.ryhmat[avain];
    const rivi = document.createElement("li");
    rivi.textContent = ryhma.nimi + " — suosio " + ryhma.suosio + ", voima " + ryhma.voima;
    listaEl.appendChild(rivi);
  }
}

function piirraAudienssi(nykyinenAudienssi) {
  const audienssiEl = document.getElementById("audienssi");
  const tekstiEl = document.getElementById("audienssi-teksti");
  const napitEl = document.getElementById("audienssi-napit");

  if (!nykyinenAudienssi) {
    audienssiEl.classList.add("piilossa");
    return;
  }

  audienssiEl.classList.remove("piilossa");
  const esittajanNimi = pelitila.ryhmat[nykyinenAudienssi.ryhmaAvain].nimi;

  if (nykyinenAudienssi.pakkoEi) {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus + " — PAKKO-EI (kassakriisi estää rahallisen vaatimuksen)";
    napitEl.style.display = "none";
  } else {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus;
    napitEl.style.display = "";
  }
}

function piirraPaatosvalinta(naytetaanko) {
  const paatosEl = document.getElementById("paatos");

  if (!naytetaanko) {
    paatosEl.classList.add("piilossa");
    return;
  }
  paatosEl.classList.remove("piilossa");

  const valintaEl = document.getElementById("paatos-valinta");
  valintaEl.innerHTML = "";
  const kaytettavissa = paatoskortit.filter(p => onkoPaatosKaytettavissa(pelitila, p));

  for (const paatos of kaytettavissa) {
    const optio = document.createElement("option");
    optio.value = paatos.id;
    optio.textContent = paatos.id + ": " + paatos.paatos;
    valintaEl.appendChild(optio);
  }

  document.getElementById("paatos-toteuta-nappi").disabled = kaytettavissa.length === 0;
}

function piirraUutinen(kortti) {
  const uutinenEl = document.getElementById("uutinen");

  if (!kortti) {
    uutinenEl.classList.add("piilossa");
    return;
  }
  uutinenEl.classList.remove("piilossa");
  document.getElementById("uutinen-teksti").textContent = kortti.id + ": " + kortti.tapahtuma;
}

function piirraKriisi(kriisi) {
  const kriisiEl = document.getElementById("kriisi");
  const uhkaNapitEl = document.getElementById("kriisi-uhka-napit");
  const vaatimusNapitEl = document.getElementById("kriisi-vaatimus-napit");
  const puolustusOsioEl = document.getElementById("kriisi-puolustus-osio");
  const rangaistusNapitEl = document.getElementById("kriisi-rangaistus-napit");

  if (!kriisi) {
    kriisiEl.classList.add("piilossa");
    return;
  }
  kriisiEl.classList.remove("piilossa");

  uhkaNapitEl.classList.add("piilossa");
  vaatimusNapitEl.classList.add("piilossa");
  puolustusOsioEl.classList.add("piilossa");
  rangaistusNapitEl.classList.add("piilossa");

  document.getElementById("kriisi-otsikko").textContent = kriisi.tyyppi;
  const tekstiEl = document.getElementById("kriisi-teksti");
  const kaynnistajanNimi = pelitila.ryhmat[kriisi.kaynnistaja].nimi;

  if (kriisi.vaihe === "uhka") {
    tekstiEl.textContent = kaynnistajanNimi + " nousee sinua vastaan! Neuvotteletko vai taisteletko?";
    uhkaNapitEl.classList.remove("piilossa");
  } else if (kriisi.vaihe === "vaatimus") {
    tekstiEl.textContent = "Vaatimus: " + kriisi.vaatimuskortti.vaatimus;
    vaatimusNapitEl.classList.remove("piilossa");
  } else if (kriisi.vaihe === "puolustus") {
    tekstiEl.textContent = "Ketä kutsut puolustamaan palatsia? Henkivartijat ovat aina mukana.";
    const valintaEl = document.getElementById("kriisi-puolustus-valinta");
    valintaEl.innerHTML = "";
    for (const avain of kriisi.ehdokkaat) {
      const optio = document.createElement("option");
      optio.value = avain;
      optio.textContent = pelitila.ryhmat[avain].nimi;
      valintaEl.appendChild(optio);
    }
    puolustusOsioEl.classList.remove("piilossa");
  } else if (kriisi.vaihe === "rangaistus") {
    tekstiEl.textContent = "Voitit taistelun. Rankaisetko kapinalliset vai armahdatko heidät?";
    rangaistusNapitEl.classList.remove("piilossa");
  }
}

function piirraPeliOhi(viesti) {
  const peliOhiEl = document.getElementById("peli-ohi");

  if (!viesti) {
    peliOhiEl.classList.add("piilossa");
    return;
  }
  peliOhiEl.classList.remove("piilossa");
  document.getElementById("peli-ohi-teksti").textContent = viesti;
}
