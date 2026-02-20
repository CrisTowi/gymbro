#!/usr/bin/env node
/**
 * Validates i18n usage: ensures all translation keys used in the codebase
 * exist in both en.json and es.json. Run from project root: node scripts/validate-i18n.js
 *
 * Usage:
 *   node scripts/validate-i18n.js           # validate only
 *   node scripts/validate-i18n.js --report  # also list unused keys in JSON
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const MESSAGES_DIR = path.join(ROOT, 'messages');

function flattenMessages(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenMessages(value, fullKey));
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function collectUsedKeys(dir, acc = { used: new Map() }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next') {
        collectUsedKeys(full, acc);
      }
      continue;
    }
    if (!/\.(tsx?|jsx?)$/.test(e.name)) continue;
    const content = fs.readFileSync(full, 'utf8');
    // Map variable name -> namespace: const t = useTranslations('nav') or const tSettings = useTranslations('settings')
    const varToNs = new Map();
    const assignMatches = content.matchAll(/(\w+)\s*=\s*useTranslations\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const m of assignMatches) {
      varToNs.set(m[1], m[2]);
    }
    // t('key') or tSettings("key") - match any identifier that we know is a translation function
    const tCallMatches = content.matchAll(/\b(\w+)\s*\(\s*['"]([^'"]+)['"]/g);
    for (const m of tCallMatches) {
      const varName = m[1];
      const key = m[2];
      const namespace = varToNs.get(varName);
      if (namespace) {
        if (!acc.used.has(namespace)) acc.used.set(namespace, new Set());
        acc.used.get(namespace).add(key);
      }
    }
  }
  return acc;
}

function main() {
  const reportUnused = process.argv.includes('--report');

  const enPath = path.join(MESSAGES_DIR, 'en.json');
  const esPath = path.join(MESSAGES_DIR, 'es.json');
  if (!fs.existsSync(enPath) || !fs.existsSync(esPath)) {
    console.error('Missing messages/en.json or messages/es.json');
    process.exit(1);
  }

  const en = flattenMessages(loadJson(enPath));
  const es = flattenMessages(loadJson(esPath));

  const { used } = collectUsedKeys(SRC_DIR);
  const missingEn = [];
  const missingEs = [];
  for (const [namespace, keys] of used) {
    for (const key of keys) {
      const fullKey = `${namespace}.${key}`;
      if (en[fullKey] === undefined) missingEn.push(fullKey);
      if (es[fullKey] === undefined) missingEs.push(fullKey);
    }
  }

  let failed = false;
  if (missingEn.length) {
    console.error('Missing in messages/en.json:');
    missingEn.forEach((k) => console.error('  -', k));
    failed = true;
  }
  if (missingEs.length) {
    console.error('Missing in messages/es.json:');
    missingEs.forEach((k) => console.error('  -', k));
    failed = true;
  }

  if (reportUnused) {
    const usedFull = new Set();
    for (const [ns, keys] of used) {
      for (const k of keys) usedFull.add(`${ns}.${k}`);
    }
    const allEnKeys = Object.keys(en);
    const unused = allEnKeys.filter((k) => !usedFull.has(k));
    if (unused.length) {
      console.log('\nUnused keys in en.json (not referenced in src):');
      unused.forEach((k) => console.log('  -', k));
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log('i18n validation OK: all used keys exist in en.json and es.json');
}

main();
