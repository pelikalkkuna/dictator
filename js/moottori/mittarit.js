function rajaaMittari(arvo) {
  return Math.max(0, Math.min(9, arvo));
}

if (typeof module !== "undefined") {
  module.exports = { rajaaMittari };
}
