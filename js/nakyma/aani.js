// Jännitysjaksojen äänet (Sasu, pelitestaus elokuu 2026: "taistelusekvenssiin kuuluu
// jännitys... taistelun ääniä").
//
// Kaikki äänet syntetisoidaan Web Audiolla lennossa - ei äänitiedostoja, ei latauksia, ei
// tekijänoikeuskysymyksiä, ja peli pysyy yhtenä tiedostona paketoituna. Jos selain ei anna
// AudioContextia (tai käyttäjä on vaimentanut), kaikki funktiot ovat hiljaisia no-oppeja
// eivätkä koskaan kaada peliä.

let aaniPaalla = true;
let konteksti = null;

function aaniKonteksti() {
  if (!aaniPaalla) return null;
  try {
    if (!konteksti) {
      const Konstruktori = window.AudioContext || window.webkitAudioContext;
      if (!Konstruktori) return null;
      konteksti = new Konstruktori();
    }
    // Selaimet käynnistävät kontekstin vasta käyttäjän eleen jälkeen.
    if (konteksti.state === "suspended") konteksti.resume();
    return konteksti;
  } catch (e) {
    return null;
  }
}

function onkoAaniPaalla() {
  return aaniPaalla;
}

function vaihdaAani() {
  aaniPaalla = !aaniPaalla;
  return aaniPaalla;
}

// Lyhyt kohinapurske alipäästösuodattimen läpi = laukaus.
function soitaLaukaus(voimakkuus) {
  const ctx = aaniKonteksti();
  if (!ctx) return;

  const kesto = 0.16;
  const naytteita = Math.floor(ctx.sampleRate * kesto);
  const puskuri = ctx.createBuffer(1, naytteita, ctx.sampleRate);
  const data = puskuri.getChannelData(0);
  for (let i = 0; i < naytteita; i++) {
    // Eksponentiaalisesti vaimeneva kohina: terävä alku, nopea häntä.
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / naytteita, 3);
  }

  const lahde = ctx.createBufferSource();
  lahde.buffer = puskuri;

  const suodatin = ctx.createBiquadFilter();
  suodatin.type = "lowpass";
  suodatin.frequency.value = 700 + Math.random() * 900;

  const vahvistus = ctx.createGain();
  vahvistus.gain.value = (voimakkuus || 0.25) * (0.6 + Math.random() * 0.4);

  lahde.connect(suodatin);
  suodatin.connect(vahvistus);
  vahvistus.connect(ctx.destination);
  lahde.start();
}

// Epäsäännöllistä tulitusta annetun keston ajan. Palauttaa funktion jolla sen voi katkaista.
function aloitaTaisteluAanet(kestoMs) {
  if (!aaniKonteksti()) return () => {};

  let ajastin = null;
  const loppuu = Date.now() + kestoMs;

  function seuraava() {
    if (Date.now() >= loppuu) return;
    soitaLaukaus(0.22);
    // Sarjatulta: välillä tiheää, välillä taukoa.
    const viive = Math.random() < 0.35 ? 60 + Math.random() * 60 : 150 + Math.random() * 320;
    ajastin = setTimeout(seuraava, viive);
  }
  seuraava();

  return () => { if (ajastin) clearTimeout(ajastin); };
}

// Matala jännityssyke odotukseen (lainan vastausta odotellessa).
function soitaOdotusPulssi() {
  const ctx = aaniKonteksti();
  if (!ctx) return;

  const osk = ctx.createOscillator();
  osk.type = "sine";
  osk.frequency.value = 110;

  const vahvistus = ctx.createGain();
  const nyt = ctx.currentTime;
  vahvistus.gain.setValueAtTime(0, nyt);
  vahvistus.gain.linearRampToValueAtTime(0.12, nyt + 0.05);
  vahvistus.gain.exponentialRampToValueAtTime(0.001, nyt + 0.5);

  osk.connect(vahvistus);
  vahvistus.connect(ctx.destination);
  osk.start(nyt);
  osk.stop(nyt + 0.55);
}

// Lopputuloksen sointu: nouseva = voitto, laskeva = tappio.
function soitaLopputulos(voitto) {
  const ctx = aaniKonteksti();
  if (!ctx) return;

  const savelet = voitto ? [196, 262, 330, 392] : [262, 220, 175, 131];
  savelet.forEach((taajuus, i) => {
    const osk = ctx.createOscillator();
    osk.type = voitto ? "triangle" : "sawtooth";
    osk.frequency.value = taajuus;

    const vahvistus = ctx.createGain();
    const alku = ctx.currentTime + i * 0.13;
    vahvistus.gain.setValueAtTime(0, alku);
    vahvistus.gain.linearRampToValueAtTime(0.16, alku + 0.03);
    vahvistus.gain.exponentialRampToValueAtTime(0.001, alku + 0.42);

    osk.connect(vahvistus);
    vahvistus.connect(ctx.destination);
    osk.start(alku);
    osk.stop(alku + 0.45);
  });
}

if (typeof module !== "undefined") {
  module.exports = { onkoAaniPaalla, vaihdaAani, soitaLaukaus, aloitaTaisteluAanet, soitaOdotusPulssi, soitaLopputulos };
}
