const test = require("node:test");
const assert = require("node:assert/strict");
const { rajaaMittari } = require("../js/moottori/mittarit.js");

test("arvo väliltä 0-9 pysyy muuttumattomana", () => {
  assert.equal(rajaaMittari(5), 5);
  assert.equal(rajaaMittari(0), 0);
  assert.equal(rajaaMittari(9), 9);
});

test("yli 9 menevä arvo rajautuu 9:ään eikä kerry", () => {
  assert.equal(rajaaMittari(10), 9);
  assert.equal(rajaaMittari(15), 9);
});

test("alle 0 menevä arvo rajautuu 0:aan", () => {
  assert.equal(rajaaMittari(-1), 0);
  assert.equal(rajaaMittari(-100), 0);
});
