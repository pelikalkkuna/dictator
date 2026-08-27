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
