import { formatTime, formatDuration, getDayOfWeek, getRelativeDate } from '@/utils/time';

describe('time utils', () => {
  describe('formatTime', () => {
    it('formats 0 seconds', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('formats seconds under a minute', () => {
      expect(formatTime(45)).toBe('0:45');
    });

    it('formats exact minutes', () => {
      expect(formatTime(120)).toBe('2:00');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(90)).toBe('1:30');
    });

    it('pads single digit seconds', () => {
      expect(formatTime(65)).toBe('1:05');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration(30)).toBe('30s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('formats hours, minutes and seconds', () => {
      expect(formatDuration(3723)).toBe('1h 2m 3s');
    });
  });

  describe('getDayOfWeek', () => {
    it('returns correct day for a known date', () => {
      // Use explicit time to avoid timezone issues
      const sunday = new Date('2026-02-15T12:00:00');
      expect(getDayOfWeek(sunday)).toBe('sunday');
    });

    it('returns a string for current date', () => {
      const result = getDayOfWeek();
      const validDays = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday',
      ];
      expect(validDays).toContain(result);
    });
  });

  describe('getRelativeDate', () => {
    it('returns "Today" for today\'s date', () => {
      const today = new Date().toISOString();
      expect(getRelativeDate(today)).toBe('Today');
    });

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getRelativeDate(yesterday.toISOString())).toBe('Yesterday');
    });

    it('returns "X days ago" for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(getRelativeDate(threeDaysAgo.toISOString())).toBe('3 days ago');
    });
  });
});
