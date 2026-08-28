// Tapahtumakuvat.
//
// Sovittu Sasun kanssa (elokuu 2026): korttitapahtumat 1024 × 576 (16:9), draamahetket
// 1024 × 683 (3:2). Kuvat generoidaan Geminillä ja tallennetaan WebP-muodossa.
//
// Kuvaa EI viedä korttidataan erikseen, vaan polku johdetaan kortin tunnuksesta:
//
//     kuvat/audienssit/A3.webp      kuvat/paatokset/D12.webp
//     kuvat/uutiset/N22.webp        kuvat/kriisit/C1.webp
//     kuvat/draama/sota-hyokkays.webp
//
// Näin 109 korttia saa kuvansa ilman yhtäkään datamuutosta: riittää että tiedosto ilmestyy
// oikealla nimellä oikeaan kansioon. Puuttuva kuva ei riko mitään - selain ei löydä
// tiedostoa, jolloin tilalle piirretään paikanvaraaja joka kertoo minkä niminen tiedosto
// puuttuu. Paikanvaraajat saa pois asetaPuuttuvienNaytto(false):lla kun kuvasto on valmis.

const KUVAT_JUURI = "kuvat";

const KUVAKOOT = {
  kortti: { suhde: "16 / 9", leveys: 1024, korkeus: 576 },
  draama: { suhde: "3 / 2", leveys: 1024, korkeus: 683 }
};

let naytaPuuttuvat = true;

function asetaPuuttuvienNaytto(naytetaanko) {
  naytaPuuttuvat = !!naytetaanko;
}

// Yhden tiedoston paketointi (tyokalut/paketoi.py) täyttää tämän kartan data-URI:eilla,
// koska paketissa ei ole erillisiä kuvatiedostoja. Normaalissa ajossa kartta on tyhjä ja
// kuvat haetaan kuvat/-kansiosta.
const KUVAT_UPOTETUT = {};

function kuvanOsoite(kansio, tunnus) {
  const avain = kansio + "/" + tunnus;
  return KUVAT_UPOTETUT[avain] || (KUVAT_JUURI + "/" + avain + ".webp");
}

function piirraPaikanvaraaja(paikka, kansio, tunnus) {
  paikka.innerHTML = "";

  if (!naytaPuuttuvat) {
    paikka.classList.add("piilossa");
    paikka.style.aspectRatio = "";
    return;
  }

  paikka.classList.add("puuttuu");
  const merkki = document.createElement("span");
  merkki.textContent = "kuva puuttuu · " + kansio + "/" + tunnus + ".webp";
  paikka.appendChild(merkki);
}

// Täyttää kuvapaikan. tunnus = null piilottaa paikan kokonaan.
// tyyppi on "kortti" (16:9) tai "draama" (3:2) - kuvasuhde asetetaan etukäteen, jotta
// sivun asettelu ei hyppää kun kuva latautuu.
function piirraKuva(paikkaId, kansio, tunnus, tyyppi, vaihtoehtoinenTeksti) {
  const paikka = document.getElementById(paikkaId);
  if (!paikka) return;

  paikka.innerHTML = "";
  paikka.className = "kuvapaikka";

  if (!tunnus) {
    paikka.classList.add("piilossa");
    paikka.style.aspectRatio = "";
    return;
  }

  const koko = KUVAKOOT[tyyppi] || KUVAKOOT.kortti;
  paikka.style.aspectRatio = koko.suhde;

  const kuva = document.createElement("img");
  kuva.src = kuvanOsoite(kansio, tunnus);
  kuva.alt = vaihtoehtoinenTeksti || "";
  kuva.loading = "lazy";
  kuva.decoding = "async";
  kuva.width = koko.leveys;
  kuva.height = koko.korkeus;
  kuva.addEventListener("error", () => piirraPaikanvaraaja(paikka, kansio, tunnus));

  paikka.appendChild(kuva);
}

if (typeof module !== "undefined") {
  module.exports = { KUVAKOOT, KUVAT_UPOTETUT, kuvanOsoite, piirraKuva, asetaPuuttuvienNaytto };
}
