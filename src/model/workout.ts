export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string; // "8-10"
  rpe: number;
  calories: number; // Est calories for this specific exercise
  notes?: string;
}

export interface AiWorkoutPlanData {
  workoutName: string;
  focus: string; // e.g. "Hypertrophy"
  estimatedDurationMin: number;
  estimatedCalories: number;
  muscleGroups: string[];
  exercises: ExerciseItem[];
}

export interface WorkoutResponse {
  workoutId: number;
  userId: number;
  workoutDate: string;
  status: 'PENDING' | 'COMPLETED';
  workoutData: string; // Stringified JSON
}