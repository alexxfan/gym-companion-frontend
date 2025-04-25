import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import API from '@/lib/api';
import { getWorkoutById } from '@/lib/workoutService';
import { MaterialIcons } from '@expo/vector-icons';

interface Exercise {
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: string | number;
  weight: string | number;
}

interface Workout {
  workout_id: number;
  workout_name: string;
  program_id: number;
}

export default function StartSessionScreen() {
  const params = useLocalSearchParams();
  const programId = Number(params.program_id);
  const workoutId = Number(params.workout_id);
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    fetchWorkoutDetails();
  }, [programId, workoutId]);
  
  const fetchWorkoutDetails = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching workout details for Program ID: ${programId}, Workout ID: ${workoutId}`);
      
      const data = await getWorkoutById(programId, workoutId);
      
      if (data && data.workout) {
        setWorkout(data.workout);
        setExercises(data.exercises || []);
        console.log('Workout loaded successfully:', data.workout.workout_name);
      } else {
        setError('Failed to load workout data');
        console.error('API returned empty data');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      setError('Failed to load workout');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartSession = async () => {
    try {
      setStarting(true);
      console.log('Starting workout session...');
      
      const response = await API.post(`/api/session/start/${programId}/${workoutId}`, {
        date: new Date().toISOString(), //current date/time
        notes: notes
      });
      
      if (response.data && response.data.session_id) {
        console.log('Session started successfully:', response.data);
        
        //go to the active session screen
        router.replace(`/sessions/${response.data.session_id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start workout session. Please try again.');
      setStarting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34788c" />
        <Text style={{ marginTop: 20 }}>Loading workout details...</Text>
      </View>
    );
  }
  
  if (error || !workout) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          {error || 'Workout not found'}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonAltText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="play-circle-filled" size={60} color="#34788c" />
          <Text style={styles.title}>Start Workout Session</Text>
          <Text style={styles.workoutName}>{workout.workout_name}</Text>
        </View>
        
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises in this Workout</Text>
          
          {exercises.length === 0 ? (
            <Text style={styles.emptyMessage}>No exercises in this workout</Text>
          ) : (
            exercises.map((exercise) => (
              <View key={exercise.exercise_id} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseDetail}>Sets: {exercise.sets}</Text>
                  <Text style={styles.exerciseDetail}>Reps: {exercise.reps}</Text>
                  <Text style={styles.exerciseDetail}>Weight: {exercise.weight}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Session Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes for this session (optional)"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            editable={!starting}
          />
        </View>
        
        {starting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34788c" />
            <Text style={styles.loadingText}>Starting session...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartSession}
            disabled={exercises.length === 0}
          >
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={starting}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  workoutName: {
    fontSize: 20,
    color: '#34788c',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exerciseDetail: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 14,
    color: '#4a5568',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  startButton: {
    backgroundColor: '#34788c',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#34788c',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonAlt: {
    backgroundColor: '#34788c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  backButtonAltText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#34788c',
  },
});