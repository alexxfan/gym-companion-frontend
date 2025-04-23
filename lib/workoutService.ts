// lib/workoutService.ts
import API from './api';
import { getItem } from './storage';
import axios from 'axios';

// Program types
export interface Program {
  program_id: number;
  user_id: number;
  program_name: string;
  date: string;
}

export interface Workout {
  workout_id: number;
  program_id: number;
  workout_name: string;
}

export interface Exercise {
  exercise_id: number;
  workout_id: number;
  exercise_name: string;
  sets: number;
  reps: string | number;
  weight: string | number;
}

// Programs
export const getPrograms = async (): Promise<Program[]> => {
  const response = await API.get('/api/gym/programs');
  return response.data;
};

export const getProgramById = async (programId: number): Promise<{program: Program, workouts: Workout[]}> => {
  const response = await API.get(`/api/gym/programs/${programId}`);
  return response.data;
};

export const createProgram = async (programName: string): Promise<Program> => {
  const response = await API.post('/api/gym/programs', { program_name: programName });
  return response.data;
};

export const deleteProgram = async (programId: number) => {
    try {
      console.log('📡 Deleting program with ID:', programId);
      
      // Make sure we're using the DELETE method with the correct URL
      const response = await API.delete(`/api/gym/programs/${programId}`);
      
      console.log('✅ Delete response status:', response.status);
      console.log('✅ Delete response data:', response.data);
      
      return response.data;
    } catch (err) {
      console.error('❌ Delete request failed:', err);
      throw err; // Re-throw to be caught by the component
    }
  };
  

// Workouts
export const getWorkouts = async (programId: number): Promise<Workout[]> => {
  const response = await API.get(`/api/gym/programs/${programId}/workouts`);
  return response.data;
};

export const getWorkoutById = async (programId: number, workoutId: number): Promise<{workout: Workout, exercises: Exercise[]}> => {
  const response = await API.get(`/api/gym/programs/${programId}/workouts/${workoutId}`);
  return response.data;
};

export const createWorkout = async (programId: number, workoutName: string): Promise<Workout> => {
  const response = await API.post(`/api/gym/programs/${programId}/workouts`, { workout_name: workoutName });
  return response.data;
};

export const deleteWorkout = async (programId: number, workoutId: number): Promise<void> => {
  await API.delete(`/api/gym/programs/${programId}/workouts/${workoutId}`);
};

// Exercises
export const getExercises = async (programId: number, workoutId: number): Promise<Exercise[]> => {
  const response = await API.get(`/api/gym/programs/${programId}/workouts/${workoutId}/exercises`);
  return response.data;
};

export const getExerciseById = async (programId: number, workoutId: number, exerciseId: number): Promise<Exercise> => {
  const response = await API.get(`/api/gym/programs/${programId}/workouts/${workoutId}/exercises/${exerciseId}`);
  return response.data;
};

export const createExercise = async (
  programId: number,
  workoutId: number,
  exercise: { exercise_name: string, sets?: number, reps?: number | string, weight?: number | string }
): Promise<Exercise> => {
  const response = await API.post(`/api/gym/programs/${programId}/workouts/${workoutId}/exercises`, exercise);
  return response.data;
};

export const updateExercise = async (
  programId: number,
  workoutId: number,
  exerciseId: number,
  updates: { sets?: number, reps?: number | string, weight?: number | string }
): Promise<Exercise> => {
  const response = await API.put(`/api/gym/programs/${programId}/workouts/${workoutId}/exercises/${exerciseId}`, updates);
  return response.data;
};

export const deleteExercise = async (programId: number, workoutId: number, exerciseId: number): Promise<void> => {
  await API.delete(`/api/gym/programs/${programId}/workouts/${workoutId}/exercises/${exerciseId}`);
};