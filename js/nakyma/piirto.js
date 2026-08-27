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
