/* Check wire ordering, parity, frame lengths, boundaries, and invalid inputs. */
const assert = require('node:assert/strict');
const {buildFrame} = require('../docs/javascripts/frame-explorer.js');
const sample = buildFrame('8N1', 0x55);
assert.deepEqual(sample.bits.map(b => b.value), [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
assert.equal(sample.bits.length, 10);
for (let data = 0; data < 256; data++) {
  const even = buildFrame('8E1', data);
  assert.equal(even.bits.length, 11);
  assert.equal(even.bits.filter(b => ['data', 'parity'].includes(b.kind)).reduce((p, b) => p ^ b.value, 0), 0);
  const decoded = even.bits.filter(b => b.kind === 'data').reduce((value, b, i) => value | (b.value << i), 0);
  assert.equal(decoded, data);
}
const wide = buildFrame('9N2', 0x100);
assert.equal(wide.bits.length, 12);
assert.equal(wide.bits[9].value, 1);
assert.deepEqual(wide.bits.slice(-2).map(b => b.value), [1, 1]);
for (const [format, data] of [['8N1', 256], ['9N2', 512], ['8N1', -1], ['8N1', NaN], ['8N1', 1.5], ['unknown', 0]]) assert.equal(buildFrame(format, data), null);
console.log('PASS: LSB ordering, 256 even-parity payloads, 9-bit data, stop bits, lengths, and invalid inputs.');
