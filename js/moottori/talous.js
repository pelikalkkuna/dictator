function kasitteleKassaraportti(tila) {
  tila.kassa -= tila.kuukausikulut;
  tila.kassakriisi = tila.kassa <= 0;
  return tila;
}

if (typeof module !== "undefined") {
  module.exports = { kasitteleKassaraportti };
}
