const test = require("node:test");
const assert = require("node:assert/strict");
const { kasitteleKassaraportti } = require("../js/moottori/talous.js");

test("kassaraportti vähentää kuukausikulut kassasta", () => {
  const tila = { kassa: 1000000, kuukausikulut: 45000, kassakriisi: false };
  kasitteleKassaraportti(tila);
  assert.equal(tila.kassa, 955000);
});

test("kassakriisi ei aktivoidu kun kassaa jää jäljelle", () => {
  const tila = { kassa: 50000, kuukausikulut: 45000, kassakriisi: false };
  kasitteleKassaraportti(tila);
  assert.equal(tila.kassa, 5000);
  assert.equal(tila.kassakriisi, false);
});

test("kassakriisi aktivoituu kun kassa menee tasan nollaan", () => {
  const tila = { kassa: 45000, kuukausikulut: 45000, kassakriisi: false };
  kasitteleKassaraportti(tila);
  assert.equal(tila.kassa, 0);
  assert.equal(tila.kassakriisi, true);
});

test("kassakriisi aktivoituu kun kassa menee pakkaselle", () => {
  const tila = { kassa: 10000, kuukausikulut: 45000, kassakriisi: false };
  kasitteleKassaraportti(tila);
  assert.equal(tila.kassa, -35000);
  assert.equal(tila.kassakriisi, true);
});
