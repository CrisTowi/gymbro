export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  description: string;
  instructions: string[];
  tags: string[];
  referenceUrl?: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'forearms'
  | 'traps';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'ez-bar'
  | 'smith-machine'
  | 'resistance-band';

export type RoutineType = 'push' | 'pull' | 'legs' | 'full-body';

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
  notes?: string;
}

export interface Routine {
  id: RoutineType;
  name: string;
  description: string;
  color: string;
  icon: string;
  exercises: RoutineExercise[];
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WeeklyPlan {
  [key: string]: RoutineType | null;
}

export const DEFAULT_WEEKLY_PLAN: WeeklyPlan = {
  monday: 'push',
  tuesday: 'pull',
  wednesday: null,
  thursday: 'legs',
  friday: null,
  saturday: 'full-body',
  sunday: null,
};

export interface SetLog {
  setNumber: number;
  reps: number;
  weightLbs: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion 1-10
  timestamp?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
}

export interface SessionLog {
  id: string;
  date: string;
  routineId: RoutineType;
  startTime: string;
  endTime?: string;
  exercises: ExerciseLog[];
  completed: boolean;
  totalWeightLbs: number;
  duration?: number; // in seconds
  personalRecords?: PersonalRecord[];
}

export interface PersonalRecord {
  exerciseId: string;
  type: 'max-weight' | 'max-reps' | 'max-volume';
  value: number;
  previousValue: number;
}

export interface ExerciseHistory {
  exerciseId: string;
  date: string;
  maxWeightLbs: number;
  totalVolumeLbs: number; // weight * reps across all sets
  bestSet: {
    reps: number;
    weightLbs: number;
  };
}

export interface TimerState {
  isRunning: boolean;
  totalSeconds: number;
  remainingSeconds: number;
}

export type TimeRange = 'this-month' | 'this-year' | 'all-time' | 'yearly';
