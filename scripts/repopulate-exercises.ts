/**
 * Re-populates the exercise collection from exercises-i18n.json.
 * Updates src/data/exercises.ts with the i18n shape (name, description, instructions
 * keyed by "en" | "es") while keeping the same exercise IDs for existing references.
 *
 * Run from project root:
 *   npm run repopulate-exercises
 *
 * Prerequisite: run translate-exercises first so scripts/output/exercises-i18n.json exists.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const I18N_PATH = path.join(ROOT, 'scripts', 'output', 'exercises-i18n.json');
const EXERCISES_TS_PATH = path.join(ROOT, 'src', 'data', 'exercises.ts');

const HELPERS = `
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

export function getExercisesByCategory(category: string): Exercise[] {
  return exercises.filter((ex) => ex.category === category);
}

export function getExercisesByTag(tag: string): Exercise[] {
  return exercises.filter((ex) => ex.tags.includes(tag));
}

export function getAllCategories(): string[] {
  return [...new Set(exercises.map((ex) => ex.category))];
}

export function getAlternativeExercises(
  exerciseId: string,
  excludeIds: string[] = []
): Exercise[] {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return [];

  const excluded = new Set([exerciseId, ...excludeIds]);

  return exercises
    .filter((ex) => !excluded.has(ex.id) && ex.category === exercise.category)
    .sort((a, b) => {
      const aSharedTags = a.tags.filter((t) => exercise.tags.includes(t)).length;
      const bSharedTags = b.tags.filter((t) => exercise.tags.includes(t)).length;
      return bSharedTags - aSharedTags;
    });
}

export function getExerciseLocalized(
  exercise: Exercise,
  locale: Locale
): { name: string; description: string; instructions: string[] } {
  return {
    name: exercise.name[locale],
    description: exercise.description[locale],
    instructions: exercise.instructions[locale],
  };
}
`;

function main(): void {
  if (!fs.existsSync(I18N_PATH)) {
    console.error(`Missing ${I18N_PATH}. Run "npm run translate-exercises" first.`);
    process.exit(1);
  }

  const raw = fs.readFileSync(I18N_PATH, 'utf8');
  const data = JSON.parse(raw);

  const header = `import { Exercise, type Locale } from '@/types';

export const exercises: Exercise[] = `;
  const footer = `;${HELPERS}`;

  const content = header + JSON.stringify(data, null, 2) + footer;
  fs.writeFileSync(EXERCISES_TS_PATH, content, 'utf8');
  console.log(`Updated ${EXERCISES_TS_PATH} with ${data.length} exercises (i18n shape).`);
}

main();
