// `npm test` — program-name mapping (node:test, no extra dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, planLabel, planTitle, programName } from './content.js';

const GP = 'GP Gulf Licensing Examination', SP = 'Specialist Gulf Licensing Examination';
const AI = "AI-Live Patient – Doctor's Clinical Foundation", FY = 'Final-Year Medicine Practical Examination';

test('every approved alias maps to its full name', () => {
  for (const [alias, full] of [
    ['GP', GP], ['GP License Exam', GP], ['GP Gulf Licensing Exam', GP],
    ['Specialist', SP], ['Specialist License Exam', SP],
    ['AI-Live Patient', AI], ["Doctor's Clinical Foundation", AI],
    ['Final Year Medicine Practical', FY], ['Final Year Practical Exam', FY], ['Final-Year Practical Exam', FY],
  ]) assert.equal(programName(alias), full, alias);
});

test('whitespace, case, hyphen and apostrophe variants are normalised', () => {
  assert.equal(programName('  gp  '), GP);
  assert.equal(programName('gp   license   EXAM'), GP);
  assert.equal(programName('AI Live Patient'), AI);          // the built-in label
  assert.equal(programName('ai – live patient'), AI);
  assert.equal(programName('Doctor’s Clinical Foundation'), AI);
  assert.equal(programName('final year-practical exam'), FY);
  assert.equal(programName('FINAL-YEAR  medicine practical'), FY);   // the built-in label
  for (const full of [GP, SP, AI, FY]) assert.equal(programName(full), full);   // full names are stable
});

test('unknown names are shown exactly as entered', () => {
  for (const s of ['Final Year Medicine', 'GP Plus', 'Nursing Prometric', '', 'G P']) assert.equal(programName(s), s);
  assert.equal(programName(undefined), undefined);
});

test('plan labels map only the program part; ids, slugs and prices are untouched', () => {
  const gp = DEFAULTS.plans.find(g => g.id === 'gp');
  const before = JSON.stringify(DEFAULTS.plans);
  assert.equal(planLabel(gp, gp.cards[0]), `${GP} — Plan A`);
  assert.equal(planTitle('GP License Exam — Plan A'), `${GP} — Plan A`);
  assert.equal(planTitle('Unknown — 3 months'), 'Unknown — 3 months');
  assert.equal(JSON.stringify(DEFAULTS.plans), before);
  assert.deepEqual(DEFAULTS.plans.map(g => g.id), ['gp', 'specialist', 'ai', 'final']);
});
