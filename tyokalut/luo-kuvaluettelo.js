// Luo kuvat/LUETTELO.md korttidatasta: jokaisen tarvittavan kuvatiedoston nimi ja se
// tapahtumateksti johon kuva liittyy. Aja: node tyokalut/luo-kuvaluettelo.js
//
// Luettelo on tarkistuslista kuvastoa tehdessä. Aja uudelleen jos kortteja lisätään.

const fs = require("fs");
const path = require("path");

const { audienssikortit } = require("../js/data/audienssit.js");
const { paatoskortit } = require("../js/data/paatokset.js");
const { uutiskortit } = require("../js/data/uutiset.js");
const { kriisikortit } = require("../js/data/kriisikortit.js");

// Draamakuvat eivät tule korttidatasta vaan paa.js:n tapahtumapoluista.
const DRAAMAKUVAT = [
  ["sota-hyokkays", "Ritimba hyökkää Leftotoon (A1 tai D16)"],
  ["sota-puolustus", "Leftoto hyökkää N1-eskalaation jälkeen"],
  ["sota-yllatys", "Leftoton yllätyshyökkäys ilman varoitusta (N3)"],
  ["taistelu-palatsista", "Kriisin puolustustaistelu palatsilla"],
  ["laina-moskova", "Lainapyyntö Neuvostoliitolle, vastausta odotetaan"],
  ["laina-washington", "Lainapyyntö Yhdysvalloille, vastausta odotetaan"],
  ["attentaatti-torjuttu", "Attentaattiyritys epäonnistui, henkivartijat pelastivat"],
  ["attentaatti-onnistui", "Attentaatti onnistui, diktaattori kuoli"],
  ["pako-helikopteri", "Pako helikopterilla onnistui"],
  ["pako-vuoristo", "Pako vuoriston kautta onnistui"],
  ["pako-kiinni", "Pakoyritys epäonnistui, diktaattori jäi kiinni"],
  ["loppu-pako", "Loppuruutu: selvisi hengissä"],
  ["loppu-kuolema", "Loppuruutu: valtakausi päättyi kuolemaan"]
];

// Korttidata on osin ryhmitelty objekteiksi (audienssit ryhmittäin, uutiset isot/pienet/
// ehdolliset, kriisikortit tyypeittäin) - litistetään yhdeksi listaksi.
function litista(data) {
  if (Array.isArray(data)) return data;
  return Object.values(data).flat();
}

function rivit(kortit, tekstikentta) {
  return litista(kortit).map(k => `| \`${k.id}.webp\` | ${k[tekstikentta]} |`).join("\n");
}

function osio(otsikko, kansio, koko, taulukko) {
  return `## ${otsikko}\n\nKansio: \`kuvat/${kansio}/\` — koko **${koko}**\n\n| Tiedosto | Tapahtuma |\n| --- | --- |\n${taulukko}\n`;
}

const audienssiRivit = rivit(audienssikortit, "vaatimus");
const kriisiRivit = rivit(kriisikortit, "vaatimus");

const draamaRivit = DRAAMAKUVAT
  .map(([tunnus, kuvaus]) => `| \`${tunnus}.webp\` | ${kuvaus} |`)
  .join("\n");

const maarat = {
  audienssit: litista(audienssikortit).length,
  paatokset: litista(paatoskortit).length,
  uutiset: litista(uutiskortit).length,
  kriisit: litista(kriisikortit).length,
  draama: DRAAMAKUVAT.length
};
const yhteensa = Object.values(maarat).reduce((a, b) => a + b, 0);

const sisalto = `# Kuvaluettelo

Luotu automaattisesti korttidatasta: \`node tyokalut/luo-kuvaluettelo.js\`.
Älä muokkaa käsin — muutokset katoavat seuraavassa ajossa.

**Kuvia yhteensä ${yhteensa}.**

## Koot ja muoto

| Tyyppi | Kuvasuhde | Koko | Käyttö |
| --- | --- | --- | --- |
| Kortti | 16:9 | **1024 × 576** | audienssit, päätökset, uutiset, kriisivaatimukset |
| Draama | 3:2 | **1024 × 683** | sota, taistelu, laina, attentaatti, pako, loppuruutu |

- **Muoto:** WebP, laatu ~78. Tavoite alle 50 kt per kuva.
- **Nimi:** täsmälleen alla oleva tiedostonimi, isot kirjaimet mukaan lukien (\`A3.webp\`, ei \`a3.webp\`).
- **Sijoitus:** kuva rajautuu \`object-fit: cover\` -säännöllä, joten pidä tärkeä sisältö keskellä —
  reunoilta voi leikkautua kapealla näytöllä.
- Puuttuva kuva ei riko peliä: tilalle piirtyy paikanvaraaja joka kertoo tiedoston nimen.

## Tyyliohje

Peli sijoittuu 1960–70-luvun kuvitteelliseen latinalaisamerikkalaiseen Ritimban tasavaltaan.
Käytä samaa tyyliprompttia kaikissa kuvissa, jotta kuvasto pysyy yhtenäisenä.

${osio(`Audienssit (${maarat.audienssit})`, "audienssit", "1024 × 576", audienssiRivit)}
${osio(`Presidentin päätökset (${maarat.paatokset})`, "paatokset", "1024 × 576", rivit(paatoskortit, "paatos"))}
${osio(`Uutiset (${maarat.uutiset})`, "uutiset", "1024 × 576", rivit(uutiskortit, "tapahtuma"))}
${osio(`Kriisivaatimukset (${maarat.kriisit})`, "kriisit", "1024 × 576", kriisiRivit)}
${osio(`Draamahetket (${maarat.draama})`, "draama", "1024 × 683", draamaRivit)}`;

const kohde = path.join(__dirname, "..", "kuvat", "LUETTELO.md");
fs.mkdirSync(path.dirname(kohde), { recursive: true });
fs.writeFileSync(kohde, sisalto, "utf8");
console.log("Kirjoitettu:", kohde, `(${yhteensa} kuvaa)`);
