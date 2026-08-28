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

// GDD 4: vaihe vaiheelta -navigointi - pelaajalle näytetään missä kohtaa kuukautta ollaan.
function piirraVaihe(vaihe) {
  const vaiheEl = document.getElementById("vaihe-teksti");

  if (!vaihe) {
    vaiheEl.classList.add("piilossa");
    return;
  }
  vaiheEl.classList.remove("piilossa");
  vaiheEl.textContent = "Vaihe " + vaihe.numero + "/8 — " + vaihe.nimi;
}

// GDD 4 vaiheet 1, 4 ja 6. Vaihe 1 näyttää kuukauden avauksen, vaiheet 4 ja 6 kertovat
// mitä juuri tehty audienssi tai päätös teki kassalle.
function piirraKassavaihe(teksti) {
  const kassavaiheEl = document.getElementById("kassavaihe");

  if (!teksti) {
    kassavaiheEl.classList.add("piilossa");
    return;
  }
  kassavaiheEl.classList.remove("piilossa");
  document.getElementById("kassavaihe-teksti").textContent = teksti;
}

// GDD 12. Kolme tilaa: ostotarjous (napit), ostettu raportti (sisältö) tai piilossa.
function piirraPoliisiraportti(tila) {
  const paneeliEl = document.getElementById("poliisiraportti");
  const napitEl = document.getElementById("poliisiraportti-napit");
  const sisaltoEl = document.getElementById("poliisiraportti-sisalto");

  if (!tila) {
    paneeliEl.classList.add("piilossa");
    return;
  }
  paneeliEl.classList.remove("piilossa");
  napitEl.classList.add("piilossa");
  sisaltoEl.classList.add("piilossa");

  const tekstiEl = document.getElementById("poliisiraportti-teksti");

  if (tila.raportti) {
    tekstiEl.textContent = "Salaisen poliisin tiedustelu:";
    sisaltoEl.classList.remove("piilossa");

    const listaEl = document.getElementById("poliisiraportti-lista");
    listaEl.innerHTML = "";
    for (const rivi of tila.raportti.rivit) {
      const li = document.createElement("li");
      li.textContent = rivi.nimi + " — suosio " + rivi.suosio + ", voima " + rivi.voima;
      if (rivi.merkki) {
        li.appendChild(document.createTextNode(" "));
        const merkkiEl = document.createElement("span");
        merkkiEl.className = "poliisiraportti-merkki";
        merkkiEl.textContent = rivi.merkki;
        li.appendChild(merkkiEl);
      }
      listaEl.appendChild(li);
    }

    document.getElementById("poliisiraportti-voimat").textContent =
      "Oma voima (henkivartijat): " + tila.raportti.omaVoima
      + " — Vallankumousvoima: " + Math.round(tila.raportti.vallankumousvoima);
    return;
  }

  if (!tila.saatavuus.saatavilla) {
    tekstiEl.textContent = tila.saatavuus.syy;
    return;
  }

  tekstiEl.textContent = tila.saatavuus.ilmainen
    ? "Ensimmäinen raportti on ilmainen. Ostatko sen?"
    : "Raportti maksaa " + muotoileRaha(tila.saatavuus.hinta) + ". Ostatko sen?";
  napitEl.classList.remove("piilossa");
}

// GDD 9.5 / 12 (Sasu, elokuu 2026): "Tilannekuvan saa ostaa salaisen poliisin raportissa."
// Yläpalkki listaa ryhmät nimeltä muttei paljasta suosiota eikä voimaa - muuten raportin
// ostamisesta ei olisi hyötyä eikä puolustusvalinnassa olisi jännitettä ("pelaaja valitsee
// MUISTINSA varassa", "jos säästit nuo tuhannet, taistelet sokkona").
function piirraRyhmat() {
  const listaEl = document.getElementById("ryhmat-lista");
  listaEl.innerHTML = "";
  for (const avain in pelitila.ryhmat) {
    const rivi = document.createElement("li");
    rivi.textContent = pelitila.ryhmat[avain].nimi;
    listaEl.appendChild(rivi);
  }
}

function piirraAudienssi(nykyinenAudienssi) {
  const audienssiEl = document.getElementById("audienssi");
  const tekstiEl = document.getElementById("audienssi-teksti");
  const napitEl = document.getElementById("audienssi-napit");
  const vihjeEl = document.getElementById("audienssi-swipe-vihje");

  audienssiEl.style.transform = "";
  audienssiEl.style.opacity = "";

  if (!nykyinenAudienssi) {
    audienssiEl.classList.add("piilossa");
    return;
  }

  audienssiEl.classList.remove("piilossa");

  // GDD 4.1: kaikkien kolmen ryhmän pakat tyhjät — audienssia ei pidetä tässä kuussa.
  if (nykyinenAudienssi.tyhja) {
    tekstiEl.textContent = "Yksikään ryhmä ei pyydä audienssia tässä kuussa.";
    napitEl.style.display = "none";
    vihjeEl.style.display = "none";
    return;
  }

  const esittajanNimi = pelitila.ryhmat[nykyinenAudienssi.ryhmaAvain].nimi;

  if (nykyinenAudienssi.pakkoEi) {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus + " — PAKKO-EI (kassakriisi estää rahallisen vaatimuksen)";
    napitEl.style.display = "none";
    vihjeEl.style.display = "none";
  } else if (nykyinenAudienssi.ratkaistu) {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus
      + " — " + (nykyinenAudienssi.hyvaksytty ? "HYVÄKSYTTY" : "HYLÄTTY");
    napitEl.style.display = "none";
    vihjeEl.style.display = "none";
  } else {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus;
    napitEl.style.display = "";
    vihjeEl.style.display = "";
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

function piirraAttentaatti(viesti) {
  const attentaattiEl = document.getElementById("attentaatti");

  if (!viesti) {
    attentaattiEl.classList.add("piilossa");
    return;
  }
  attentaattiEl.classList.remove("piilossa");
  document.getElementById("attentaatti-teksti").textContent = viesti;
}

function piirraPeliOhi(viesti, pisteet) {
  const peliOhiEl = document.getElementById("peli-ohi");
  const pisteetEl = document.getElementById("peli-ohi-pisteet");

  if (!viesti) {
    peliOhiEl.classList.add("piilossa");
    pisteetEl.classList.add("piilossa");
    return;
  }
  peliOhiEl.classList.remove("piilossa");
  document.getElementById("peli-ohi-teksti").textContent = viesti;

  if (!pisteet) {
    pisteetEl.classList.add("piilossa");
    return;
  }
  pisteetEl.classList.remove("piilossa");

  document.getElementById("peli-ohi-titteli").textContent =
    pisteet.titteli.titteli + " (" + Math.floor(pisteet.yhteensa) + " pistettä) — " + pisteet.titteli.kuvaus;

  const listaEl = document.getElementById("peli-ohi-pisteet-lista");
  listaEl.innerHTML = "";
  const rivit = [
    "Kokonaissuosio: " + pisteet.suosio,
    "Kuukaudet vallassa: " + pisteet.kuukaudet,
    "Swiss-bonus: " + pisteet.swiss
  ];
  for (const rivi of rivit) {
    const li = document.createElement("li");
    li.textContent = rivi;
    listaEl.appendChild(li);
  }
}
