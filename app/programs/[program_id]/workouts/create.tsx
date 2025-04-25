import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createWorkout } from '@/lib/workoutService';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateWorkoutScreen() {
  const params = useLocalSearchParams();
  const programId = Number(params.program_id);
  
  const [workoutName, setWorkoutName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`📝 Creating new workout in program ${programId}:`, workoutName);
      const newWorkout = await createWorkout(programId, workoutName);
      console.log('Workout created successfully, ID:', newWorkout.workout_id);
      
      //go to the workout detail page
      router.replace(`/programs/${programId}/workouts/${newWorkout.workout_id}`);
    } catch (error) {
      console.error('Create workout error:', error);
      Alert.alert('Error', 'Failed to create workout. Please try again.');
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
        
        <Text style={styles.title}>Create New Workout</Text>
        <Text style={styles.subtitle}>Add a workout to your program</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chest Day, Leg Day, Full Body"
            value={workoutName}
            onChangeText={setWorkoutName}
            maxLength={50}
            editable={!isSubmitting}
          />
          
          <Text style={styles.helpText}>
            Your workout will contain different exercises with sets, reps, and weights.
          </Text>

          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#34788c" />
              <Text style={styles.loadingText}>Creating workout...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Create Workout</Text>
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
          onPress={() => router.replace(`/programs/${programId}`)}
        >
          <Text style={styles.backButtonText}>Back to Program</Text>
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
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
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