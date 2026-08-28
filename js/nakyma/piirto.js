function muotoileRaha(maara) {
  return maara.toLocaleString("fi-FI");
}

function muotoileEtumerkilla(luku) {
  return (luku >= 0 ? "+" : "−") + Math.abs(luku);
}

function piirraKuukausi() {
  document.getElementById("kuukausi-teksti").textContent = "Kuukausi " + pelitila.kuukausi;
}

// GDD 4: vaihe vaiheelta -navigointi - pelaajalle näytetään missä kohtaa kuukautta ollaan.
function piirraVaihe(vaihe) {
  const vaiheEl = document.getElementById("vaihe-teksti");

  if (!vaihe) {
    vaiheEl.classList.add("piilossa");
    return;
  }
  vaiheEl.classList.remove("piilossa");
  vaiheEl.textContent = "Vaihe " + vaihe.numero + "/" + KUUKAUSIVAIHEET.length + " — " + vaihe.nimi;
}

// GDD 4 vaihe 1. Sasu (pelitestaus): kassa näytetään enää kerran kuukaudessa, tässä.
function piirraKassavaihe(teksti) {
  const kassavaiheEl = document.getElementById("kassavaihe");

  if (!teksti) {
    kassavaiheEl.classList.add("piilossa");
    return;
  }
  kassavaiheEl.classList.remove("piilossa");
  kassavaiheEl.classList.toggle("kriisi", pelitila.kassakriisi);
  document.getElementById("kassavaihe-teksti").textContent = teksti;
}

// ---------------------------------------------------------------- vaikutusten esikatselu

// Sasu (pelitestaus elokuu 2026): "On OK tehdä päätös heti, mutta haluttaessa saa katsoa
// päätöksen vaikutukset." Näyttää KORTIN omat luvut (GDD 5/6:n taulukot), ei pelin tilaa -
// tilannekuva pysyy edelleen poliisiraportin takana.
function kuvaaMittarimuutokset(muutokset, otsikko, rivit) {
  if (!muutokset) return;
  for (const avain in muutokset) {
    const arvo = muutokset[avain];
    const nimi = pelitila.ryhmat[avain] ? pelitila.ryhmat[avain].nimi : avain;
    if (arvo && typeof arvo === "object") {
      // A3:n kaltainen satunnaisväli { min, max }.
      const pienin = Math.min(arvo.min, arvo.max);
      const suurin = Math.max(arvo.min, arvo.max);
      rivit.push({ teksti: otsikko + " " + nimi + " " + muotoileEtumerkilla(suurin) + "…" + muotoileEtumerkilla(pienin), suunta: suurin });
    } else {
      rivit.push({ teksti: otsikko + " " + nimi + " " + muotoileEtumerkilla(arvo), suunta: arvo });
    }
  }
}

function kuvaaVaikutukset(kortti) {
  const rivit = [];

  kuvaaMittarimuutokset(kortti.suosio, "Suosio", rivit);
  kuvaaMittarimuutokset(kortti.voima, "Voima", rivit);

  if (typeof kortti.kertaluontoinen === "number") {
    rivit.push({
      teksti: "Kassa " + (kortti.kertaluontoinen >= 0 ? "+" : "−") + muotoileRaha(Math.abs(kortti.kertaluontoinen)),
      suunta: kortti.kertaluontoinen
    });
  }
  if (typeof kortti.kuukausikulutMuutos === "number") {
    rivit.push({
      teksti: "Kuukausikulut " + (kortti.kuukausikulutMuutos >= 0 ? "+" : "−")
        + muotoileRaha(Math.abs(kortti.kuukausikulutMuutos)) + "/kk",
      suunta: -kortti.kuukausikulutMuutos
    });
  }

  // Erikoispäätökset laskevat summansa vasta ajohetkellä, joten niistä kerrotaan sanallisesti.
  const erikoisselitteet = {
    HENKIVARTIJAT: "Henkivartijoiden voima +2",
    SVEITSI: "Siirtää puolet kassasta Sveitsin tilille (siirtomaksu 2 000)",
    SUURVALTA_VENAJA: "Venäjän apu riippuu siitä kuinka paljon enemmän Venäjä suosii sinua kuin USA",
    SUURVALTA_USA: "USA:n apu riippuu siitä kuinka paljon enemmän USA suosii sinua kuin Venäjä",
    HELIKOPTERI: "Mahdollistaa helikopteripaon (voi olla rikki)",
    PIKASOTA: "Käynnistää sodan Leftotoa vastaan",
    ESKALAATIO: "Käynnistää sotauhkan kierteen"
  };
  if (kortti.erikoinen && erikoisselitteet[kortti.erikoinen]) {
    rivit.push({ teksti: erikoisselitteet[kortti.erikoinen], suunta: 0 });
  }

  if (rivit.length === 0) {
    rivit.push({ teksti: "Ei suoria mitattavia vaikutuksia.", suunta: 0 });
  }
  return rivit;
}

function piirraVaikutukset(elementtiId, kortti) {
  const el = document.getElementById(elementtiId);

  if (!kortti) {
    el.classList.add("piilossa");
    return;
  }
  el.classList.remove("piilossa");
  el.innerHTML = "";

  const lista = document.createElement("ul");
  for (const rivi of kuvaaVaikutukset(kortti)) {
    const li = document.createElement("li");
    li.textContent = rivi.teksti;
    if (rivi.suunta > 0) li.className = "nousee";
    else if (rivi.suunta < 0) li.className = "laskee";
    lista.appendChild(li);
  }
  el.appendChild(lista);
}

// ---------------------------------------------------------------- poliisiraportti

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

// ---------------------------------------------------------------- audienssi ja päätös

function piirraAudienssi(nykyinenAudienssi) {
  const audienssiEl = document.getElementById("audienssi");
  const tekstiEl = document.getElementById("audienssi-teksti");
  const napitEl = document.getElementById("audienssi-napit");
  const vihjeEl = document.getElementById("audienssi-swipe-vihje");
  const vaikutusNappiEl = document.getElementById("audienssi-vaikutukset-nappi");

  audienssiEl.style.transform = "";
  audienssiEl.style.opacity = "";
  piirraVaikutukset("audienssi-vaikutukset", null);

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
    // Ratkaisun jälkeen vaikutukset näytetään aina - päätös on jo tehty.
    if (nykyinenAudienssi.hyvaksytty) piirraVaikutukset("audienssi-vaikutukset", nykyinenAudienssi.kortti);
  } else {
    tekstiEl.textContent = esittajanNimi + ": " + nykyinenAudienssi.kortti.vaatimus;
    napitEl.style.display = "";
    vihjeEl.style.display = "";
    vaikutusNappiEl.style.display = "";
    vaikutusNappiEl.textContent = "Näytä vaikutukset";
  }
}

function piirraPaatosvalinta(naytetaanko) {
  const paatosEl = document.getElementById("paatos");

  if (!naytetaanko) {
    paatosEl.classList.add("piilossa");
    piirraVaikutukset("paatos-vaikutukset", null);
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
  // Päätöksen vaikutukset näkyvät suoraan, koska valikosta selaillaan vaihtoehtoja.
  if (kaytettavissa.length > 0) {
    piirraVaikutukset("paatos-vaikutukset", kaytettavissa[0]);
  } else {
    piirraVaikutukset("paatos-vaikutukset", null);
  }
}

// Sasu (pelitestaus): päätöksestä ei aiemmin kerrottu mitään - Venäjän laina saattoi tuottaa
// nolla markkaa täysin hiljaa, eikä helikopterin ostosta jäänyt mitään merkkiä.
function piirraPaatosTulos(teksti) {
  const el = document.getElementById("paatos-tulos");

  if (!teksti) {
    el.classList.add("piilossa");
    return;
  }
  el.classList.remove("piilossa");
  document.getElementById("paatos-tulos-teksti").textContent = teksti;
}

// ---------------------------------------------------------------- jännitysjakso

// Sasu (pelitestaus): "Sota meni vauhdilla. Siinä kuin joku pikku uutinen. Taistelusekvenssiin
// kuuluu jännitys." Sama koskee suurvaltalainan odotusta.
function piirraSekvenssi(tila) {
  const el = document.getElementById("sekvenssi");
  const tulosEl = document.getElementById("sekvenssi-tulos");

  if (!tila) {
    el.classList.add("piilossa");
    return;
  }
  el.classList.remove("piilossa");
  el.classList.toggle("odotus", tila.tyyli === "odotus");

  document.getElementById("sekvenssi-otsikko").textContent = tila.otsikko;
  document.getElementById("sekvenssi-teksti").textContent = tila.teksti;

  if (tila.tulos) {
    tulosEl.classList.remove("piilossa");
    tulosEl.textContent = tila.tulos;
  } else {
    tulosEl.classList.add("piilossa");
  }
}

// ---------------------------------------------------------------- uutiset, kriisi, loppu

// Sasu (pelitestaus): "Uutisissa ei tule N##-merkkiä vaan ihan pelkkä tapahtuma."
function piirraUutinen(kortti) {
  const uutinenEl = document.getElementById("uutinen");

  if (!kortti) {
    uutinenEl.classList.add("piilossa");
    return;
  }
  uutinenEl.classList.remove("piilossa");
  document.getElementById("uutinen-teksti").textContent = kortti.tapahtuma;
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

  // Sasu (pelitestaus): ryhmät näkyvät vain poliisiraportissa tai pelin päättyessä.
  const ryhmatEl = document.getElementById("peli-ohi-ryhmat");
  ryhmatEl.innerHTML = "";
  for (const avain in pelitila.ryhmat) {
    const ryhma = pelitila.ryhmat[avain];
    const li = document.createElement("li");
    li.textContent = ryhma.nimi + " — suosio " + ryhma.suosio + ", voima " + ryhma.voima;
    ryhmatEl.appendChild(li);
  }
}
