import { getMotivationalMessage, getSessionGrade } from '@/utils/motivation';

describe('motivation utils', () => {
  describe('getMotivationalMessage', () => {
    it('returns a non-empty string', () => {
      const message = getMotivationalMessage();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('getSessionGrade', () => {
    it('returns S grade for perfect completion', () => {
      const result = getSessionGrade(20, 20);
      expect(result.grade).toBe('S');
    });

    it('returns A grade for 90%+', () => {
      const result = getSessionGrade(19, 20);
      expect(result.grade).toBe('A');
    });

    it('returns B grade for 75%+', () => {
      const result = getSessionGrade(16, 20);
      expect(result.grade).toBe('B');
    });

    it('returns C grade for 50%+', () => {
      const result = getSessionGrade(11, 20);
      expect(result.grade).toBe('C');
    });

    it('returns D grade for under 50%', () => {
      const result = getSessionGrade(5, 20);
      expect(result.grade).toBe('D');
    });

    it('includes a message for each grade', () => {
      const grades = [
        getSessionGrade(20, 20),
        getSessionGrade(18, 20),
        getSessionGrade(15, 20),
        getSessionGrade(10, 20),
        getSessionGrade(3, 20),
      ];
      grades.forEach((g) => {
        expect(g.message).toBeTruthy();
        expect(g.message.length).toBeGreaterThan(0);
      });
    });
  });
});
