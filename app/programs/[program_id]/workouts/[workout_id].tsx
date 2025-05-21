import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  getWorkoutById, 
  deleteWorkout, 
  Exercise, 
  Workout 
} from '@/lib/workoutService';
import API from '@/lib/api';
import { Platform } from 'react-native';



export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const workoutId = Number(params.workout_id);
  const programId = Number(params.program_id);

  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId, programId]);
  
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
  
  const handleDeleteAction = async () => {
    try {
      console.log(`Deleting workout with Program ID: ${programId}, Workout ID: ${workoutId}`);
      setIsDeleting(true);
      
      await deleteWorkout(programId, workoutId);
      
      console.log('Workout deleted successfully');
      router.replace(`/programs/${programId}`);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
      Alert.alert('Error', 'Failed to delete workout');
    }
  };
  
  const handleStartWorkout = async () => {
    if (exercises.length === 0) {
      const message = 'You cannot start a workout with no exercises. Please add at least one exercise first.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Cannot Start Workout', message, [{ text: 'OK' }]);
      }

      return;
    }

    try {
      const response = await API.post(`/api/session/start/${programId}/${workoutId}`, {
        date: new Date().toISOString(),
        notes: ''
      });

      if (response.data?.session_id) {
        router.replace(`/programs/${programId}/workouts/${workoutId}/start-session`);
      } else {
        throw new Error('Invalid session response');
      }
    } catch (err) {
      console.error('Failed to start session:', err);

      if (Platform.OS === 'web') {
        window.alert('Could not start workout session');
      } else {
        Alert.alert('Error', 'Could not start workout session');
      }
    }
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34788c" />
        <Text style={{ marginTop: 20 }}>Loading workout...</Text>
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
          onPress={() => router.replace(`/programs/${programId}`)}
        >
          <Text style={styles.backButtonText}>Back to Program</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={{ marginTop: 20 }}>Deleting workout...</Text>
      </View>
    );
  }
  
  if (showConfirmDelete) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Workout?</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this workout? This will also delete all exercises.
          </Text>
          
          <View style={styles.confirmButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowConfirmDelete(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmDeleteButton}
              onPress={handleDeleteAction}
            >
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{workout.workout_name}</Text>
          <Text style={styles.sectionTitle}>Exercises</Text>
  
          {exercises.length === 0 && (
            <Text style={styles.emptyMessage}>No exercises added yet</Text>
          )}
        </>
      }
      data={exercises}
      keyExtractor={(item) => item.exercise_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{item.exercise_name}</Text>
          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseDetail}>Sets: {item.sets}</Text>
            <Text style={styles.exerciseDetail}>Reps: {item.reps}</Text>
            <Text style={styles.exerciseDetail}>Weight: {item.weight}</Text>
          </View>
          <View style={styles.exerciseActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(
                `/programs/${programId}/workouts/${workoutId}/exercises/${item.exercise_id}/edit`
              )}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={
        <>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`/programs/${programId}/workouts/${workoutId}/exercises/create`)}
          >
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => setShowConfirmDelete(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Workout</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <Text style={styles.startButtonText}>Start This Workout</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace(`/programs/${programId}`)}
          >
            <Text style={styles.backButtonText}>Back to Program</Text>
          </TouchableOpacity>
        </>
      }
      contentContainerStyle={styles.container}
    />
  );
  

}

const styles = StyleSheet.create({
  container: {
  flexGrow: 1,
  padding: 24,
  backgroundColor: '#fff',
},

  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
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
    marginBottom: 12,
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
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#34788c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  addButton: {
    marginTop: 24,
    backgroundColor: '#34788c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  deleteButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  backButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#34788c',
    fontWeight: '600',
  },
  backButtonAlt: {
    backgroundColor: '#34788c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  // Confirmation dialog styles
  confirmBox: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f1f1f1',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#e74c3c',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#34788c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
});