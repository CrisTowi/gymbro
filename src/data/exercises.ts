import { Exercise } from '@/types';

export const exercises: Exercise[] = [
  // CHEST
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    description: 'Classic compound chest exercise performed on a flat bench.',
    instructions: [
      'Lie flat on a bench with feet on the floor',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack and lower the bar to mid-chest',
      'Press the bar back up to lockout',
    ],
    tags: ['push', 'compound', 'chest'],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'dumbbell',
    description: 'Upper chest focused pressing movement on an inclined bench.',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Press dumbbells up from shoulder level',
      'Lower with control to chest level',
      'Keep feet flat on the floor',
    ],
    tags: ['push', 'compound', 'upper-chest'],
  },
  {
    id: 'cable-flyes',
    name: 'Cable Flyes',
    category: 'chest',
    secondaryMuscles: ['shoulders'],
    equipment: 'cable',
    description: 'Isolation chest exercise using cable machine for constant tension.',
    instructions: [
      'Set cables at shoulder height',
      'Step forward with slight lean',
      'Bring hands together in hugging motion',
      'Squeeze chest at the peak, return slowly',
    ],
    tags: ['push', 'isolation', 'chest'],
  },
  {
    id: 'dumbbell-chest-press',
    name: 'Dumbbell Chest Press',
    category: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'dumbbell',
    description: 'Flat bench press using dumbbells for greater range of motion.',
    instructions: [
      'Lie flat on bench with dumbbells at chest level',
      'Press dumbbells up until arms are extended',
      'Lower slowly to starting position',
      'Keep core engaged throughout',
    ],
    tags: ['push', 'compound', 'chest'],
  },

  // SHOULDERS
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    equipment: 'barbell',
    description: 'Standing barbell press overhead for shoulder development.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold bar at shoulder level with overhand grip',
      'Press bar overhead to full lockout',
      'Lower bar back to shoulders with control',
    ],
    tags: ['push', 'compound', 'shoulders'],
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    category: 'shoulders',
    secondaryMuscles: ['traps'],
    equipment: 'dumbbell',
    description: 'Isolation exercise targeting the lateral deltoid.',
    instructions: [
      'Stand with dumbbells at your sides',
      'Raise arms out to the sides until parallel',
      'Keep slight bend in elbows',
      'Lower slowly with control',
    ],
    tags: ['push', 'isolation', 'shoulders'],
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    category: 'shoulders',
    secondaryMuscles: ['chest'],
    equipment: 'dumbbell',
    description: 'Isolation exercise targeting the anterior deltoid.',
    instructions: [
      'Stand with dumbbells in front of thighs',
      'Raise one arm to shoulder height',
      'Lower slowly and alternate arms',
      'Keep core engaged and avoid swinging',
    ],
    tags: ['push', 'isolation', 'shoulders'],
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    category: 'shoulders',
    secondaryMuscles: ['triceps'],
    equipment: 'dumbbell',
    description: 'Rotating shoulder press hitting all three deltoid heads.',
    instructions: [
      'Start with dumbbells at chest level, palms facing you',
      'Rotate palms outward as you press overhead',
      'Reverse the motion on the way down',
      'Keep movement controlled throughout',
    ],
    tags: ['push', 'compound', 'shoulders'],
  },

  // TRICEPS
  {
    id: 'tricep-pushdowns',
    name: 'Tricep Pushdowns',
    category: 'triceps',
    secondaryMuscles: [],
    equipment: 'cable',
    description: 'Cable exercise isolating the triceps.',
    instructions: [
      'Stand facing cable machine with rope or bar attachment',
      'Keep elbows pinned to your sides',
      'Push the weight down until arms are fully extended',
      'Return slowly to starting position',
    ],
    tags: ['push', 'isolation', 'triceps'],
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: 'bodyweight',
    description: 'Compound bodyweight exercise for triceps.',
    instructions: [
      'Grip parallel bars and support your weight',
      'Lower body by bending elbows to 90 degrees',
      'Keep body upright to target triceps',
      'Press back up to starting position',
    ],
    tags: ['push', 'compound', 'triceps'],
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    category: 'triceps',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    description: 'Overhead extension targeting the long head of the triceps.',
    instructions: [
      'Hold dumbbell overhead with both hands',
      'Lower behind head by bending elbows',
      'Extend arms back to starting position',
      'Keep upper arms stationary throughout',
    ],
    tags: ['push', 'isolation', 'triceps'],
  },

  // BACK
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'core', 'traps'],
    equipment: 'barbell',
    description: 'Full body compound lift focusing on the posterior chain.',
    instructions: [
      'Stand with feet hip-width, bar over mid-foot',
      'Hinge at hips and grip bar outside knees',
      'Drive through feet, extending hips and knees',
      'Stand tall at top, then lower with control',
    ],
    tags: ['pull', 'compound', 'back'],
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    category: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'bodyweight',
    description: 'Classic bodyweight exercise for lat and back development.',
    instructions: [
      'Hang from bar with overhand grip, slightly wider than shoulders',
      'Pull body up until chin clears the bar',
      'Lower with control to full extension',
      'Avoid swinging or kipping',
    ],
    tags: ['pull', 'compound', 'back'],
  },
  {
    id: 'barbell-rows',
    name: 'Barbell Rows',
    category: 'back',
    secondaryMuscles: ['biceps', 'forearms', 'core'],
    equipment: 'barbell',
    description: 'Bent-over row for overall back thickness.',
    instructions: [
      'Hinge forward at hips with slight knee bend',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades together at top',
      'Lower with control, maintaining back position',
    ],
    tags: ['pull', 'compound', 'back'],
  },
  {
    id: 'lat-pulldowns',
    name: 'Lat Pulldowns',
    category: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'cable',
    description: 'Cable exercise targeting the latissimus dorsi.',
    instructions: [
      'Sit at lat pulldown machine with thighs secured',
      'Grip bar wider than shoulder-width',
      'Pull bar to upper chest, squeezing lats',
      'Return to full extension with control',
    ],
    tags: ['pull', 'compound', 'back'],
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    category: 'shoulders',
    secondaryMuscles: ['traps', 'back'],
    equipment: 'cable',
    description: 'Cable exercise targeting rear delts and upper back.',
    instructions: [
      'Set cable at face height with rope attachment',
      'Pull rope toward face, separating hands',
      'Squeeze rear delts and upper back',
      'Return slowly to starting position',
    ],
    tags: ['pull', 'isolation', 'rear-delts'],
  },
  {
    id: 'seated-cable-rows',
    name: 'Seated Cable Rows',
    category: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'cable',
    description: 'Seated rowing movement for mid-back development.',
    instructions: [
      'Sit with feet on platform, knees slightly bent',
      'Pull handle to lower chest',
      'Squeeze shoulder blades together',
      'Return with control, allowing stretch',
    ],
    tags: ['pull', 'compound', 'back'],
  },

  // BICEPS
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    category: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    description: 'Classic isolation exercise for bicep development.',
    instructions: [
      'Stand with dumbbells at sides, palms forward',
      'Curl weights to shoulder level',
      'Squeeze biceps at the top',
      'Lower slowly to full extension',
    ],
    tags: ['pull', 'isolation', 'biceps'],
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    category: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    description: 'Bicep curl variation targeting the brachialis and forearms.',
    instructions: [
      'Hold dumbbells with neutral grip (palms facing each other)',
      'Curl weights to shoulder level',
      'Keep elbows stationary at sides',
      'Lower with control',
    ],
    tags: ['pull', 'isolation', 'biceps'],
  },
  {
    id: 'barbell-curls',
    name: 'Barbell Curls',
    category: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: 'barbell',
    description: 'Heavy compound curl using barbell for maximum bicep loading.',
    instructions: [
      'Stand with barbell, underhand grip at shoulder width',
      'Curl bar to shoulder height',
      'Keep upper arms stationary',
      'Lower with control to full extension',
    ],
    tags: ['pull', 'isolation', 'biceps'],
  },

  // QUADRICEPS
  {
    id: 'squats',
    name: 'Squats',
    category: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings', 'core'],
    equipment: 'barbell',
    description: 'The king of leg exercises for overall lower body development.',
    instructions: [
      'Position bar on upper back, feet shoulder-width',
      'Break at hips and knees simultaneously',
      'Descend until thighs are parallel or below',
      'Drive through feet to stand back up',
    ],
    tags: ['legs', 'compound', 'quadriceps'],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: 'machine',
    description: 'Machine exercise for heavy quadricep loading.',
    instructions: [
      'Sit in leg press machine with back flat against pad',
      'Place feet shoulder-width on platform',
      'Lower platform by bending knees to 90 degrees',
      'Press back up without locking knees',
    ],
    tags: ['legs', 'compound', 'quadriceps'],
  },
  {
    id: 'bulgarian-split-squats',
    name: 'Bulgarian Split Squats',
    category: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: 'dumbbell',
    description: 'Single-leg squat variation for balanced leg development.',
    instructions: [
      'Place rear foot on bench behind you',
      'Hold dumbbells at sides',
      'Lower until front thigh is parallel to floor',
      'Drive through front heel to stand',
    ],
    tags: ['legs', 'compound', 'quadriceps'],
  },
  {
    id: 'leg-extensions',
    name: 'Leg Extensions',
    category: 'quadriceps',
    secondaryMuscles: [],
    equipment: 'machine',
    description: 'Machine isolation exercise for quadricep definition.',
    instructions: [
      'Sit in machine with back against pad',
      'Hook ankles under roller pad',
      'Extend legs until straight',
      'Lower with control, avoid letting weight stack slam',
    ],
    tags: ['legs', 'isolation', 'quadriceps'],
  },

  // HAMSTRINGS
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    equipment: 'barbell',
    description: 'Hip hinge movement focusing on hamstring stretch and load.',
    instructions: [
      'Hold barbell with overhand grip at hip level',
      'Hinge at hips, pushing them backward',
      'Lower bar along legs until hamstring stretch is felt',
      'Drive hips forward to return to standing',
    ],
    tags: ['legs', 'compound', 'hamstrings'],
  },
  {
    id: 'leg-curls',
    name: 'Leg Curls',
    category: 'hamstrings',
    secondaryMuscles: ['calves'],
    equipment: 'machine',
    description: 'Machine isolation exercise for hamstring development.',
    instructions: [
      'Lie face down on leg curl machine',
      'Hook heels under roller pad',
      'Curl weight by bending knees',
      'Lower with control to starting position',
    ],
    tags: ['legs', 'isolation', 'hamstrings'],
  },

  // CALVES
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'calves',
    secondaryMuscles: [],
    equipment: 'machine',
    description: 'Standing calf raise for calf muscle development.',
    instructions: [
      'Stand on calf raise machine with balls of feet on platform',
      'Lower heels below platform for full stretch',
      'Rise up on toes as high as possible',
      'Squeeze at top, lower with control',
    ],
    tags: ['legs', 'isolation', 'calves'],
  },

  // GLUTES
  {
    id: 'hip-thrusts',
    name: 'Hip Thrusts',
    category: 'glutes',
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'barbell',
    description: 'Barbell hip thrust for maximum glute activation.',
    instructions: [
      'Sit on floor with upper back against bench',
      'Roll barbell over hips with pad',
      'Drive hips up until body forms straight line',
      'Squeeze glutes at top, lower with control',
    ],
    tags: ['legs', 'compound', 'glutes'],
  },

  // CORE
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    secondaryMuscles: ['shoulders'],
    equipment: 'bodyweight',
    description: 'Isometric core exercise for stability and endurance.',
    instructions: [
      'Get in push-up position on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and hold position',
      'Breathe steadily throughout',
    ],
    tags: ['core', 'isometric', 'bodyweight'],
  },
  {
    id: 'cable-crunches',
    name: 'Cable Crunches',
    category: 'core',
    secondaryMuscles: [],
    equipment: 'cable',
    description: 'Weighted crunch using cable for progressive overload on abs.',
    instructions: [
      'Kneel facing cable machine with rope attachment',
      'Hold rope behind head',
      'Crunch downward, bringing elbows toward knees',
      'Return to starting position with control',
    ],
    tags: ['core', 'isolation', 'abs'],
  },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((ex) => ex.id === id);
};

export const getExercisesByCategory = (category: string): Exercise[] => {
  return exercises.filter((ex) => ex.category === category);
};

export const getExercisesByTag = (tag: string): Exercise[] => {
  return exercises.filter((ex) => ex.tags.includes(tag));
};

export const getAllCategories = (): string[] => {
  return [...new Set(exercises.map((ex) => ex.category))];
};
