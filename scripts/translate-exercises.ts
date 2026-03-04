/**
 * Backend script: exercises i18n + translation
 *
 * 1. Loads all exercises from the exercises collection (src/data/exercises)
 * 2. Restructures each record so translatable fields use lang keys: "en", "es"
 *    (name, description, instructions)
 * 3. Uses Spanish from scripts/exercises-es.json (or API/placeholder) and writes to JSON
 *
 * Run from project root:
 *   npm run translate-exercises
 *
 * Spanish: by default uses scripts/exercises-es.json for real Spanish.
 * Optional: USE_LIBRE_TRANSLATE=1 tries LibreTranslate API for any missing ES (rate-limited).
 */

import * as fs from 'fs';
import * as path from 'path';
import { exercises } from '../src/data/exercises';

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'scripts', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'exercises-i18n.json');
const ES_TRANSLATIONS_PATH = path.join(__dirname, 'exercises-es.json');

interface TranslatedString {
  en: string;
  es: string;
}

interface TranslatedInstructions {
  en: string[];
  es: string[];
}

interface ExerciseI18n {
  id: string;
  name: TranslatedString;
  category: string;
  secondaryMuscles: string[];
  equipment: string;
  description: TranslatedString;
  instructions: TranslatedInstructions;
  tags: string[];
  referenceUrl?: string;
}

interface ExerciseEsEntry {
  name: string;
  description: string;
  instructions: string[];
}

function loadSpanishTranslations(): Record<string, ExerciseEsEntry> | null {
  try {
    const raw = fs.readFileSync(ES_TRANSLATIONS_PATH, 'utf8');
    return JSON.parse(raw) as Record<string, ExerciseEsEntry>;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  console.log('Loading exercises from collection…');
  const total = exercises.length;
  console.log(`Found ${total} exercises.`);

  const esTranslations = loadSpanishTranslations();
  if (esTranslations) {
    console.log('Loaded Spanish translations from exercises-es.json');
  } else {
    console.log('No exercises-es.json found; using placeholder for "es" fields.');
  }

  console.log('Building i18n JSON (en/es)…');
  const result: ExerciseI18n[] = [];

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const es = esTranslations?.[ex.id];

    const nameEn = ex.name.en;
    const nameEs = es?.name ?? ex.name.es ?? `[ES] ${ex.name.en}`;
    const descEn = ex.description.en;
    const descEs = es?.description ?? ex.description.es ?? `[ES] ${ex.description.en}`;
    const instrEn = ex.instructions.en;
    const instrEs =
      es?.instructions && es.instructions.length === ex.instructions.en.length
        ? es.instructions
        : ex.instructions.es?.length === ex.instructions.en.length
          ? ex.instructions.es
          : ex.instructions.en.map((s) => `[ES] ${s}`);

    const entry: ExerciseI18n = {
      id: ex.id,
      name: { en: nameEn, es: nameEs },
      category: ex.category,
      secondaryMuscles: [...ex.secondaryMuscles],
      equipment: ex.equipment,
      description: { en: descEn, es: descEs },
      instructions: { en: [...instrEn], es: instrEs },
      tags: [...ex.tags],
      ...(ex.referenceUrl != null && { referenceUrl: ex.referenceUrl }),
    };
    result.push(entry);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

  console.log(`\nDone. Written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
