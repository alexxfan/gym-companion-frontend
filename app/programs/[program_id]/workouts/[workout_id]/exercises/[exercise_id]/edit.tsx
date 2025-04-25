import { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getExerciseById, updateExercise, deleteExercise } from '@/lib/workoutService';

export default function EditExerciseScreen() {
  const router = useRouter();
  const { program_id, workout_id, exercise_id } = useLocalSearchParams();

  //parse params
  const programId = typeof program_id === 'string' ? parseInt(program_id) : NaN;
  const workoutId = typeof workout_id === 'string' ? parseInt(workout_id) : NaN;
  const exerciseId = typeof exercise_id === 'string' ? parseInt(exercise_id) : NaN;

  const isValidParams = ![programId, workoutId, exerciseId].some(id => isNaN(id));

  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isValidParams) fetchExerciseDetails();
    else setError('Invalid parameters provided.');
  }, [exerciseId]);

  const fetchExerciseDetails = async () => {
    try {
      setIsLoading(true);
      const exercise = await getExerciseById(programId, workoutId, exerciseId);
      if (exercise) {
        setExerciseName(exercise.exercise_name);
        setSets(String(exercise.sets));
        setReps(String(exercise.reps));
        setWeight(String(exercise.weight));
      } else {
        throw new Error('Exercise not found');
      }
    } catch (err) {
      console.error('Failed to fetch exercise:', err);
      setError('Could not load exercise details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        exercise_name: exerciseName,
        sets: parseInt(sets) || 0,
        reps: parseInt(reps) || 0,
        weight: parseFloat(weight) || 0,
      };

      await updateExercise(programId, workoutId, exerciseId, updates);
      router.replace(`/programs/${programId}/workouts/${workoutId}`);
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Update Failed', 'Could not update the exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExercise(programId, workoutId, exerciseId);
      router.replace(`/programs/${programId}/workouts/${workoutId}`);
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Delete Failed', 'Could not delete the exercise.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (!isValidParams) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Invalid route parameters</Text>
      </View>
    );
  }

  if (isLoading || isSubmitting || isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDeleting ? '#e74c3c' : '#34788c'} />
        <Text style={{ marginTop: 20 }}>{isDeleting ? 'Deleting...' : 'Loading...'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Exercise Name</Text>
          <TextInput style={styles.input} value={exerciseName} onChangeText={setExerciseName} />

          <Text style={styles.label}>Sets</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} />

          <Text style={styles.label}>Reps</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => setShowConfirmDelete(true)}>
          <Text style={styles.deleteButtonText}>Delete Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace(`/programs/${programId}/workouts/${workoutId}`)}>
          <Text style={styles.backButtonText}>Back to Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {showConfirmDelete && (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Exercise?</Text>
          <Text style={styles.confirmText}>This action is irreversible.</Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmDelete(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDelete}>
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    },
    iconContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 40,
    },
    formContainer: {
      backgroundColor: '#f8f9fa',
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 15,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: '#fff',
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
    button: {
      backgroundColor: '#34788c',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    backButton: {
      marginTop: 10,
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
  });
  


  