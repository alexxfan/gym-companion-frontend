import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createExercise } from '@/lib/workoutService';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateExerciseScreen() {
  const params = useLocalSearchParams();
  const programId = Number(params.program_id);
  const workoutId = Number(params.workout_id);
  
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    setIsSubmitting(true);
    try {
      //create exercise object
      const exercise = {
        exercise_name: exerciseName,
        sets: sets ? parseInt(sets, 10) : 0,
        reps: reps || '0',
        weight: weight || '0'
      };
      
      console.log(`📝 Creating new exercise for workout ${workoutId}:`, exercise);
      const newExercise = await createExercise(programId, workoutId, exercise);
      console.log('Exercise created successfully, ID:', newExercise.exercise_id);
      
      //go back to workout detail page
      router.replace(`/programs/${programId}/workouts/${workoutId}`);
    } catch (error) {
      console.error('Create exercise error:', error);
      Alert.alert('Error', 'Failed to create exercise. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="fitness-center" size={60} color="#34788c" />
        </View>
        
        <Text style={styles.title}>Add New Exercise</Text>
        <Text style={styles.subtitle}>Track your sets, reps, and weights</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Exercise Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bench Press, Squat, Deadlift"
            value={exerciseName}
            onChangeText={setExerciseName}
            maxLength={50}
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of sets (e.g., 3)"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            placeholder="Number or range of reps (e.g., 10 or 8-12)"
            value={reps}
            onChangeText={setReps}
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            placeholder="Weight in kg/lbs or 'bodyweight'"
            value={weight}
            onChangeText={setWeight}
            editable={!isSubmitting}
          />

          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34788c" />
              <Text style={styles.loadingText}>Adding exercise...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Add Exercise</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/*Back*/}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace(`/programs/${programId}/workouts/${workoutId}`)}
        >
          <Text style={styles.backButtonText}>Back to Workout</Text>
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
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
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
});