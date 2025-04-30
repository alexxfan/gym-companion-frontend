import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import API from '@/lib/api';
import { MaterialIcons } from '@expo/vector-icons';
import EditableValue from '@/components/EditableValue';
import { Platform } from 'react-native';


interface ExerciseLog {
  log_id: number;
  session_id: number;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

interface Session {
  session_id: number;
  user_id: number;
  workout_id: number;
  date: string;
  notes: string;
  workout_name: string;
  program_name: string;
  exercises: ExerciseLog[];
}

export default function SessionDetailScreen() {
  const params = useLocalSearchParams();
  const sessionId = Number(params.session_id);
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);
  
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching session details for Session ID: ${sessionId}`);
      
      const response = await API.get(`/api/session/${sessionId}`);
      
      if (response.data) {
        setSession(response.data);
        console.log('Session loaded successfully:', response.data);
      } else {
        setError('Failed to load session data');
        console.error('API returned empty data');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompletionToggle = async (logId: number, completed: boolean) => {
    try {
      setUpdating(prev => ({ ...prev, [logId]: true }));
      console.log(`Updating exercise log ${logId} to completed=${completed}`);
      
      const response = await API.put(`/api/session/log/${logId}`, {
        completed
      });
      
      if (response.data) {
        //update session state
        setSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            exercises: prev.exercises.map(ex => 
              ex.log_id === logId ? { ...ex, completed } : ex
            )
          };
        });
        
        console.log('Exercise log updated successfully');
      } else {
        throw new Error('Failed to update exercise log');
      }
    } catch (error) {
      console.error('Failed to update exercise log:', error);
      Alert.alert('Error', 'Failed to update exercise status.');
    } finally {
      setUpdating(prev => ({ ...prev, [logId]: false }));
    }
  };
  
  const handleUpdateSets = async (logId: number, sets: number) => {
    try {
      setUpdating(prev => ({ ...prev, [logId]: true }));
      
      const response = await API.put(`/api/session/log/${logId}`, {
        sets
      });
      
      if (response.data) {
        //update session state
        setSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            exercises: prev.exercises.map(ex => 
              ex.log_id === logId ? { ...ex, sets } : ex
            )
          };
        });
      } else {
        throw new Error('Failed to update sets');
      }
    } catch (error) {
      console.error('Failed to update sets:', error);
      Alert.alert('Error', 'Failed to update sets.');
    } finally {
      setUpdating(prev => ({ ...prev, [logId]: false }));
    }
  };
  
  const handleUpdateReps = async (logId: number, reps: number | string) => {
    try {
      setUpdating(prev => ({ ...prev, [logId]: true }));
      
      const response = await API.put(`/api/session/log/${logId}`, {
        reps
      });
      
      if (response.data) {
        //update session state
        setSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            exercises: prev.exercises.map(ex => 
              ex.log_id === logId ? { ...ex, reps } : ex
            )
          };
        });
      } else {
        throw new Error('Failed to update reps');
      }
    } catch (error) {
      console.error('Failed to update reps:', error);
      Alert.alert('Error', 'Failed to update reps.');
    } finally {
      setUpdating(prev => ({ ...prev, [logId]: false }));
    }
  };
  
  const handleUpdateWeight = async (logId: number, weight: number | string) => {
    try {
      setUpdating(prev => ({ ...prev, [logId]: true }));
      
      const response = await API.put(`/api/session/log/${logId}`, {
        weight
      });
      
      if (response.data) {
        //update session state
        setSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            exercises: prev.exercises.map(ex => 
              ex.log_id === logId ? { ...ex, weight } : ex
            )
          };
        });
      } else {
        throw new Error('Failed to update weight');
      }
    } catch (error) {
      console.error('Failed to update weight:', error);
      Alert.alert('Error', 'Failed to update weight.');
    } finally {
      setUpdating(prev => ({ ...prev, [logId]: false }));
    }
  };
  
  //calculate progress
  const calculateProgress = () => {
    if (!session || !session.exercises || session.exercises.length === 0) return 0;
    
    const completedExercises = session.exercises.filter(ex => ex.completed).length;
    return (completedExercises / session.exercises.length) * 100;
  };
  
  const progressPercentage = session ? calculateProgress() : 0;
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#34788c" />
        <Text style={{ marginTop: 20 }}>Loading session...</Text>
      </View>
    );
  }
  
  if (error || !session) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          {error || 'Session not found'}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.replace('/sessions/history')}
        >
          <Text style={styles.backButtonAltText}>Go to Session History</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Workout Session</Text>
        <Text style={styles.subtitle}>{session.workout_name}</Text>
        <Text style={styles.programName}>{session.program_name}</Text>
        
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.date}>
            {new Date(session.date).toLocaleDateString('en-GB')}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Progress: {Math.round(progressPercentage)}%
        </Text>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      {session.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Session Notes:</Text>
          <Text style={styles.notesText}>{session.notes}</Text>
        </View>
      ) : null}
      
      <Text style={styles.sectionTitle}>Exercises</Text>
      
      {session.exercises.map((exercise) => (
        <View
          key={exercise.log_id}
          style={[
            styles.exerciseCard,
            exercise.completed ? styles.completedExercise : {},
          ]}
        >
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
            <View style={styles.switchContainer}>
              {updating[exercise.log_id] ? (
                <ActivityIndicator size="small" color="#34788c" />
              ) : (
                <Switch
                  value={exercise.completed}
                  onValueChange={(value) =>
                    handleCompletionToggle(exercise.log_id, value)
                  }
                  trackColor={{ false: '#d1d1d1', true: '#aed3e3' }}
                  thumbColor={exercise.completed ? '#34788c' : '#f4f3f4'}
                />
              )}
            </View>
          </View>

          <View style={styles.exerciseDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sets:</Text>
              <EditableValue
                label="Sets"
                value={exercise.sets}
                onSubmit={(val) => handleUpdateSets(exercise.log_id, val)}
              />
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Reps:</Text>
              <EditableValue
                label="Reps"
                value={exercise.reps}
                onSubmit={(val) => handleUpdateReps(exercise.log_id, val)}
              />
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <EditableValue
                label="Weight"
                value={exercise.weight}
                onSubmit={(val) => handleUpdateWeight(exercise.log_id, val)}
              />
            </View>
          </View>
        </View>
      ))}

      
      <TouchableOpacity
        style={styles.finishButton}
        onPress={() => {
          if (progressPercentage === 100) {
            router.replace('/sessions/history');
          } else {
            if (Platform.OS === 'web') {
              //web
              const confirmFinish = window.confirm(
                'You still have exercises to complete. Are you sure you want to finish this session?'
              );
              if (confirmFinish) {
                router.replace('/sessions/history');
              }
            } else {
              //mobile
              Alert.alert(
                'Session Incomplete',
                'You still have exercises to complete. Are you sure you want to finish this session?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Finish Anyway',
                    onPress: () => router.replace('/sessions/history'),
                  },
                ]
              );
            }
          }
        }}
      >
        <Text style={styles.finishButtonText}>
          {progressPercentage === 100 ? 'Complete Workout' : 'Finish Workout'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/sessions/history')}
      >
        <Text style={styles.backButtonText}>Back to History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34788c',
    marginBottom: 4,
  },
  programName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34788c',
    borderRadius: 6,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  completedExercise: {
    borderLeftColor: '#34788c',
    backgroundColor: '#f1f8fa',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  switchContainer: {
    width: 50,
    alignItems: 'flex-end',
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4a5568',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34788c',
    textDecorationLine: 'underline',
  },
  finishButton: {
    backgroundColor: '#34788c',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
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
});