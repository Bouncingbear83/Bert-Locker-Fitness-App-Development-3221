export interface Exercise {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  description: string;
  muscleGroup?: string;
  exerciseCategory?: 'reps' | 'time' | 'distance';
  instructions?: string;
  isCustom?: boolean;
  media?: {
    gif?: {
      type: 'file' | 'url';
      data: string;
      preview: string;
    };
    videos?: Array<{
      url: string;
      title: string;
    }>;
  };
}

export const exercises: Exercise[] = [
  // Chest
  {
    id: '1',
    name: 'Bench Press',
    category: 'Chest',
    primaryMuscles: ['Chest', 'Triceps', 'Shoulders'],
    description: 'Classic compound movement for chest development',
    exerciseCategory: 'reps'
  },
  {
    id: '2',
    name: 'Push-ups',
    category: 'Chest',
    primaryMuscles: ['Chest', 'Triceps', 'Core'],
    description: 'Bodyweight exercise for chest and core strength',
    exerciseCategory: 'reps'
  },
  {
    id: '3',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    primaryMuscles: ['Upper Chest', 'Shoulders', 'Triceps'],
    description: 'Targets upper chest with dumbbells',
    exerciseCategory: 'reps'
  },
  {
    id: '4',
    name: 'Dips',
    category: 'Chest',
    primaryMuscles: ['Lower Chest', 'Triceps', 'Shoulders'],
    description: 'Compound movement targeting lower chest',
    exerciseCategory: 'reps'
  },

  // Back
  {
    id: '5',
    name: 'Pull-ups',
    category: 'Back',
    primaryMuscles: ['Lats', 'Biceps', 'Rhomboids'],
    description: 'Bodyweight exercise for back and biceps',
    exerciseCategory: 'reps'
  },
  {
    id: '6',
    name: 'Deadlift',
    category: 'Back',
    primaryMuscles: ['Lower Back', 'Hamstrings', 'Glutes'],
    description: 'King of all exercises - full body compound movement',
    exerciseCategory: 'reps'
  },
  {
    id: '7',
    name: 'Barbell Rows',
    category: 'Back',
    primaryMuscles: ['Lats', 'Rhomboids', 'Biceps'],
    description: 'Compound pulling exercise for back thickness',
    exerciseCategory: 'reps'
  },
  {
    id: '8',
    name: 'Lat Pulldowns',
    category: 'Back',
    primaryMuscles: ['Lats', 'Biceps', 'Rear Delts'],
    description: 'Machine exercise for lat development',
    exerciseCategory: 'reps'
  },

  // Legs
  {
    id: '9',
    name: 'Squats',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    description: 'The king of leg exercises',
    exerciseCategory: 'reps'
  },
  {
    id: '10',
    name: 'Lunges',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    description: 'Unilateral leg exercise for balance and strength',
    exerciseCategory: 'reps'
  },
  {
    id: '11',
    name: 'Leg Press',
    category: 'Legs',
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    description: 'Machine exercise for leg development',
    exerciseCategory: 'reps'
  },
  {
    id: '12',
    name: 'Romanian Deadlift',
    category: 'Legs',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    description: 'Hip-hinge movement targeting hamstrings',
    exerciseCategory: 'reps'
  },
  {
    id: '13',
    name: 'Calf Raises',
    category: 'Legs',
    primaryMuscles: ['Calves'],
    description: 'Isolation exercise for calf development',
    exerciseCategory: 'reps'
  },

  // Shoulders
  {
    id: '14',
    name: 'Overhead Press',
    category: 'Shoulders',
    primaryMuscles: ['Shoulders', 'Triceps', 'Core'],
    description: 'Compound movement for shoulder strength',
    exerciseCategory: 'reps'
  },
  {
    id: '15',
    name: 'Lateral Raises',
    category: 'Shoulders',
    primaryMuscles: ['Side Delts'],
    description: 'Isolation exercise for shoulder width',
    exerciseCategory: 'reps'
  },
  {
    id: '16',
    name: 'Rear Delt Flyes',
    category: 'Shoulders',
    primaryMuscles: ['Rear Delts', 'Rhomboids'],
    description: 'Targets rear deltoids and upper back',
    exerciseCategory: 'reps'
  },

  // Arms
  {
    id: '17',
    name: 'Bicep Curls',
    category: 'Arms',
    primaryMuscles: ['Biceps'],
    description: 'Classic isolation exercise for biceps',
    exerciseCategory: 'reps'
  },
  {
    id: '18',
    name: 'Tricep Dips',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    description: 'Bodyweight exercise for triceps',
    exerciseCategory: 'reps'
  },
  {
    id: '19',
    name: 'Hammer Curls',
    category: 'Arms',
    primaryMuscles: ['Biceps', 'Forearms'],
    description: 'Neutral grip curl for biceps and forearms',
    exerciseCategory: 'reps'
  },
  {
    id: '20',
    name: 'Tricep Extensions',
    category: 'Arms',
    primaryMuscles: ['Triceps'],
    description: 'Isolation exercise for triceps',
    exerciseCategory: 'reps'
  },

  // Core
  {
    id: '21',
    name: 'Plank',
    category: 'Core',
    primaryMuscles: ['Core', 'Shoulders'],
    description: 'Isometric exercise for core stability',
    exerciseCategory: 'time'
  },
  {
    id: '22',
    name: 'Crunches',
    category: 'Core',
    primaryMuscles: ['Abs'],
    description: 'Basic abdominal exercise',
    exerciseCategory: 'reps'
  },
  {
    id: '23',
    name: 'Russian Twists',
    category: 'Core',
    primaryMuscles: ['Obliques', 'Core'],
    description: 'Rotational exercise for obliques',
    exerciseCategory: 'reps'
  },
  {
    id: '24',
    name: 'Mountain Climbers',
    category: 'Core',
    primaryMuscles: ['Core', 'Shoulders', 'Legs'],
    description: 'Dynamic exercise for core and cardio',
    exerciseCategory: 'time'
  },
  {
    id: '25',
    name: 'Dead Bug',
    category: 'Core',
    primaryMuscles: ['Core', 'Hip Flexors'],
    description: 'Core stability exercise',
    exerciseCategory: 'reps'
  },
  {
    id: '26',
    name: 'Side Plank',
    category: 'Core',
    primaryMuscles: ['Obliques', 'Core'],
    description: 'Lateral core stability exercise',
    exerciseCategory: 'time'
  },

  // Cardio Examples
  {
    id: '27',
    name: 'Running',
    category: 'Cardio',
    primaryMuscles: ['Legs', 'Cardiovascular'],
    description: 'Cardiovascular endurance exercise',
    exerciseCategory: 'distance'
  },
  {
    id: '28',
    name: 'Rowing',
    category: 'Cardio',
    primaryMuscles: ['Back', 'Arms', 'Legs', 'Cardiovascular'],
    description: 'Full body cardio exercise',
    exerciseCategory: 'distance'
  },
  {
    id: '29',
    name: 'Jump Rope',
    category: 'Cardio',
    primaryMuscles: ['Calves', 'Cardiovascular'],
    description: 'High intensity cardio exercise',
    exerciseCategory: 'time'
  },
  {
    id: '30',
    name: 'Burpees',
    category: 'Cardio',
    primaryMuscles: ['Full Body', 'Cardiovascular'],
    description: 'High intensity full body exercise',
    exerciseCategory: 'reps'
  },
  {
    id: '31',
    name: 'Cycling',
    category: 'Cardio',
    primaryMuscles: ['Legs', 'Cardiovascular'],
    description: 'Low impact cardiovascular exercise',
    exerciseCategory: 'distance'
  },
  {
    id: '32',
    name: 'High Knees',
    category: 'Cardio',
    primaryMuscles: ['Legs', 'Core', 'Cardiovascular'],
    description: 'Dynamic cardio warm-up exercise',
    exerciseCategory: 'time'
  }
];

export const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];