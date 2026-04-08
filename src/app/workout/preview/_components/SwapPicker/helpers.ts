import { type Exercise, type Locale } from '@/types';
import { getExerciseLocalized } from '@/data/exercises';

export function filterAlternatives(
  alternatives: Exercise[],
  query: string,
  locale: Locale
): Exercise[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return alternatives;
  return alternatives.filter((alt) =>
    getExerciseLocalized(alt, locale).name.toLowerCase().includes(trimmed)
  );
}

export function groupByCategory(alternatives: Exercise[]): Record<string, Exercise[]> {
  return alternatives.reduce<Record<string, Exercise[]>>((acc, alt) => {
    if (!acc[alt.category]) acc[alt.category] = [];
    acc[alt.category].push(alt);
    return acc;
  }, {});
}
