const assert = require('node:assert/strict');
const {calculate} = require('../docs/javascripts/baudrate.js');
const base = {sysMHz: 112, apbMHz: 72, prs: 1, os: 4, target: 9600};
const example = calculate({...base, sysMHz: 40, apbMHz: 20, prs: 4});
assert.equal(example.brg, 103);
assert.ok(Math.abs(example.actual - 9615.384615384615) < 1e-8);
assert.ok(Math.abs(example.errorPct - 0.16025641025641027) < 1e-8);
assert.equal(calculate(base).brg, 728);
assert.equal(calculate(base).cycles, 11664);
assert.equal(calculate({...base, os: 16}).brg, 181);
assert.equal(calculate({...base, target: 1}).brg, 65535);
assert.equal(calculate({...base, target: 1}).limited, true);
assert.equal(calculate({...base, target: 100000000}).brg, 1);
assert.equal(calculate({...base, target: 100000000}).limited, true);
for (const change of [{sysMHz: NaN}, {target: 0}, {target: -1}, {target: Infinity},
  {prs: 1.5}, {prs: 16}, {prs: -1}, {os: 8}, {sysMHz: 39}, {sysMHz: 201},
  {apbMHz: 0}, {apbMHz: 73}, {sysMHz: 72, apbMHz: 72}, {apbMHz: 28}]) {
  assert.ok(calculate({...base, ...change}).error, JSON.stringify(change));
}
// Independent exhaustive search checks nearest actual baud, including boundaries.
for (const os of [4, 16]) {
  for (const target of [50, 2400, 4800, 9600, 19200, 38400, 76800, 115200, 921600, 9000000]) {
    const result = calculate({...base, os, target});
    let minimum = Infinity;
    for (let brg = 1; brg <= 65535; brg++) {
      minimum = Math.min(minimum, Math.abs(28000000 / (os * (brg + 1)) - target));
    }
    assert.ok(Math.abs(Math.abs(result.actual - target) - minimum) < 1e-8);
  }
}
console.log('PASS: specification examples, frame timing, invalid inputs, clock constraints, BRG limits and 20 exhaustive nearest-baud checks.');
