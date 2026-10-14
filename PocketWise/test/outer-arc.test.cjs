const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const match = app.match(/  function outerArcLengths\([\s\S]*?\n  \}/);
assert.ok(match, 'outerArcLengths helper exists');
const outerArcLengths = vm.runInNewContext(`(${match[0].trim().replace(/^function /, 'function ')})`, {});

const loss = outerArcLengths(200, 700, -500);
assert.equal(loss.incomeLen, 200 / 900 * 100, 'income remains proportional during a loss');
assert.equal(loss.expenseLen, 700 / 900 * 100, 'expenses remain proportional during a loss');
assert.equal(loss.isLoss, true, 'loss state is still identified for text and styling');

const gain = outerArcLengths(700, 200, 500);
assert.equal(gain.incomeLen, 700 / 900 * 100, 'income arc reflects its exact share');
assert.equal(gain.expenseLen, 200 / 900 * 100, 'expense arc reflects its exact share');
assert.equal(gain.incomeLen + gain.expenseLen, 100, 'active arcs use the complete path without an artificial gap');

const even = outerArcLengths(560000, 560000, 0);
assert.equal(even.incomeLen, 50, 'equal income and expenses occupy exactly the left half');
assert.equal(even.expenseLen, 50, 'equal income and expenses occupy exactly the right half');
assert.equal(even.incomeLen, even.expenseLen, 'zero net balance meets exactly at the midpoint');

const empty = outerArcLengths(0, 0, 0);
assert.equal(empty.incomeLen, 0, 'empty state hides green segment');
assert.equal(empty.expenseLen, 0, 'empty state hides red segment and leaves the neutral track');
console.log('PASS proportional arcs during losses and gains');
console.log('PASS zero net balance meets exactly at midpoint');
console.log('PASS empty month leaves a neutral track');
