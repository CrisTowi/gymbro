const motivationalMessages = [
  'Beast mode activated! You crushed it today! 🔥',
  'Another day, another victory. Keep pushing! 💪',
  "Your future self will thank you for today's effort! 🏆",
  'Consistency is the key to greatness. Well done! ⭐',
  "You showed up and gave it your all. That's what counts! 🎯",
  "Progress isn't always visible, but it's always happening! 📈",
  "Champions are made in the gym. You're building yours! 🏅",
  'Every rep counts. Every set matters. Great work! 💥',
  "You're stronger than yesterday. Keep it up! 🦾",
  "The only bad workout is the one that didn't happen. Proud of you! 👏",
  "Iron sharpens iron. You're forging something great! ⚔️",
  "Discipline beats motivation. And you've got both! 🎖️",
];

export const getMotivationalMessage = (): string => {
  const index = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[index];
};

export const getSessionGrade = (
  completedSets: number,
  totalSets: number
): { grade: string; message: string } => {
  const ratio = completedSets / totalSets;

  if (ratio >= 1) {
    return { grade: 'S', message: 'Perfect session! Every set completed!' };
  }
  if (ratio >= 0.9) {
    return { grade: 'A', message: 'Outstanding work! Nearly perfect!' };
  }
  if (ratio >= 0.75) {
    return { grade: 'B', message: 'Great effort! Solid session!' };
  }
  if (ratio >= 0.5) {
    return { grade: 'C', message: 'Good start! Room to grow!' };
  }
  return { grade: 'D', message: "Showing up is half the battle! You're on track!" };
};
