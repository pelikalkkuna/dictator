function piirraKaikki() {
  piirraKuukausi();
  piirraKassaraportti();
  piirraRyhmat();
}

document.addEventListener("DOMContentLoaded", () => {
  piirraKaikki();

  document.getElementById("seuraava-kuukausi-nappi").addEventListener("click", () => {
    pelitila.kuukausi += 1;
    kasitteleKassaraportti(pelitila);
    piirraKaikki();
  });
});
