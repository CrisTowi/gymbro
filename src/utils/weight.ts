export const lbsToKg = (lbs: number): number => {
  return Math.round(lbs * 0.453592 * 10) / 10;
};

export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

export const formatWeight = (lbs: number, showKg: boolean = true): string => {
  if (showKg) {
    return `${lbs} lbs (${lbsToKg(lbs)} kg)`;
  }
  return `${lbs} lbs`;
};

export const formatWeightCompact = (lbs: number): string => {
  if (lbs >= 1000) {
    return `${(lbs / 1000).toFixed(1)}k`;
  }
  return `${lbs}`;
};
