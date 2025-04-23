import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProgramById, deleteProgram, Program, Workout } from '@/lib/workoutService';

export default function ProgramDetailScreen() {
  const { program_id } = useLocalSearchParams();
  
  // Convert and validate programId safely
  const programId = Number(program_id);
  const isValidId = !isNaN(programId) && Number.isInteger(programId) && programId > 0;
  
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  useEffect(() => {
    if (isValidId) {
      fetchProgramDetails();
    }
  }, [programId]);
  
  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching program details for ID:', programId);
      const data = await getProgramById(programId);
      setProgram(data.program);
      setWorkouts(data.workouts);
      console.log('✅ Program details loaded successfully');
    } catch (error) {
      console.error('❌ Error loading program:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAction = async () => {
    try {
      console.log('🗑️ Directly deleting program with ID:', programId);
      setIsDeleting(true);
      
      // Call the API
      await deleteProgram(programId);
      
      console.log('✅ Program deleted successfully, navigating away');
      router.replace('/programs');
    } catch (error) {
      console.error('❌ Delete error:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  
  if (!isValidId) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Invalid program ID</Text>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#435465" />
      </View>
    );
  }
  
  if (isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text>Deleting program...</Text>
      </View>
    );
  }
  
  if (!program) return <Text>Program not found.</Text>;
  
  // Show confirmation UI instead of using Alert
  if (showConfirmDelete) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Program?</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this program? This will also delete all workouts and exercises.
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
    <View style={styles.container}>
      <Text style={styles.title}>{program.program_name}</Text>
      <Text style={styles.date}>Created: {new Date(program.date).toLocaleDateString()}</Text>
  
      <Text style={styles.sectionTitle}>Workouts</Text>
      {workouts.length === 0 ? (
        <Text style={styles.emptyMessage}>No workouts added yet</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.workout_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.workoutCard}
              onPress={() => router.push(`/programs/${programId}/workouts/${item.workout_id}`)}
            >
              <Text style={styles.workoutName}>{item.workout_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
  
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push(`/programs/${programId}/workouts`)}
      >
        <Text style={styles.addButtonText}>Add Workout</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          console.log('🧨 Delete button pressed');
          setShowConfirmDelete(true);
        }}
      >
        <Text style={styles.deleteButtonText}>Delete Program</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace('/programs')}
      >
        <Text style={styles.backButtonText}>Back to Programs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 10 
  },
  date: { 
    fontSize: 14, 
    color: '#666',
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
  workoutCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
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
    color: '#435465',
    fontWeight: '600',
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
  }
});