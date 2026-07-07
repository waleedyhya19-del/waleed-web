#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'messages');
const ar = JSON.parse(fs.readFileSync(path.join(root, 'ar.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'en.json'), 'utf8'));

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const arFlat = flatten(ar);
const enFlat = flatten(en);

const arKeys = new Set(Object.keys(arFlat));
const enKeys = new Set(Object.keys(enFlat));

const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));

const untranslated = [];
for (const k of arKeys) {
  if (enKeys.has(k) && arFlat[k] === enFlat[k] && typeof arFlat[k] === 'string' && !/^[A-Z_]+$|^\d/.test(arFlat[k])) {
    // heuristic: same string in both languages usually = untranslated
    untranslated.push(k);
  }
}

let bad = false;
if (missingInAr.length) {
  bad = true;
  console.error(`\nMissing in ar.json (${missingInAr.length}):`);
  missingInAr.forEach((k) => console.error(`  - ${k}`));
}
if (missingInEn.length) {
  bad = true;
  console.error(`\nMissing in en.json (${missingInEn.length}):`);
  missingInEn.forEach((k) => console.error(`  - ${k}`));
}
if (untranslated.length) {
  console.warn(`\nPotentially untranslated (identical AR/EN, ${untranslated.length}):`);
  untranslated.slice(0, 20).forEach((k) => console.warn(`  - ${k}`));
  if (untranslated.length > 20) console.warn(`  … +${untranslated.length - 20} more`);
}

if (bad) {
  console.error('\ni18n parity check FAILED.');
  process.exit(1);
}
console.log(`\ni18n parity OK: ${arKeys.size} keys.`);
