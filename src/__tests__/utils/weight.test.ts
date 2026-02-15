import { lbsToKg, kgToLbs, formatWeight, formatWeightCompact } from '@/utils/weight';

describe('weight utils', () => {
  describe('lbsToKg', () => {
    it('converts 0 lbs to 0 kg', () => {
      expect(lbsToKg(0)).toBe(0);
    });

    it('converts 100 lbs to approximately 45.4 kg', () => {
      expect(lbsToKg(100)).toBe(45.4);
    });

    it('converts 225 lbs correctly', () => {
      expect(lbsToKg(225)).toBe(102.1);
    });

    it('converts 315 lbs correctly', () => {
      expect(lbsToKg(315)).toBe(142.9);
    });
  });

  describe('kgToLbs', () => {
    it('converts 0 kg to 0 lbs', () => {
      expect(kgToLbs(0)).toBe(0);
    });

    it('converts 100 kg to approximately 220.5 lbs', () => {
      expect(kgToLbs(100)).toBe(220.5);
    });

    it('is the inverse of lbsToKg (approximately)', () => {
      const original = 135;
      const converted = kgToLbs(lbsToKg(original));
      expect(Math.abs(converted - original)).toBeLessThan(1);
    });
  });

  describe('formatWeight', () => {
    it('formats weight with kg equivalent', () => {
      expect(formatWeight(135)).toBe('135 lbs (61.2 kg)');
    });

    it('formats weight without kg when showKg is false', () => {
      expect(formatWeight(135, false)).toBe('135 lbs');
    });
  });

  describe('formatWeightCompact', () => {
    it('formats small numbers directly', () => {
      expect(formatWeightCompact(500)).toBe('500');
    });

    it('formats thousands with k suffix', () => {
      expect(formatWeightCompact(1500)).toBe('1.5k');
    });

    it('formats exact thousands', () => {
      expect(formatWeightCompact(2000)).toBe('2.0k');
    });
  });
});
