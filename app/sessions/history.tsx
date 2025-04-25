import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import API from '@/lib/api';

interface SessionSummary {
  session_id: number;
  workout_name: string;
  program_name: string;
  date: string;
  exercises: {
    completed: boolean;
    exercise_name: string;
  }[];
}

export default function SessionHistoryScreen() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<SessionSummary[]>([]);

  const router = useRouter();

  const fetchSessionHistory = useCallback(async () => {
    try {
      console.log('📦 Fetching workout session history...');
      const response = await API.get('/api/session/history');
      if (response.data) {
        setSessions(response.data);
        setFilteredSessions(response.data);
        console.log('Sessions loaded:', response.data.length);
      } else {
        console.warn('Empty session history');
      }
    } catch (error) {
      console.error('Failed to fetch session history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionHistory();
  }, [fetchSessionHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessionHistory();
  };

  const filterSessions = (text: string) => {
    setSearchDate(text);
    const filtered = sessions.filter(session =>
      new Date(session.date).toLocaleDateString().includes(text)
    );
    setFilteredSessions(filtered);
  };

  const renderSessionItem = ({ item }: { item: SessionSummary }) => {
    const dateStr = new Date(item.date).toLocaleDateString();
    const progress =
      (item.exercises.filter(ex => ex.completed).length / item.exercises.length) * 100 || 0;

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => router.push(`/sessions/${item.session_id}`)}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.workoutName}>{item.workout_name}</Text>
          <Text style={styles.programName}>{item.program_name}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress: {Math.round(progress)}%</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout History</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Filter by date (e.g. 4/25/2025)"
        value={searchDate}
        onChangeText={filterSessions}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#34788c" />
          <Text style={{ marginTop: 20 }}>Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={item => item.session_id.toString()}
          renderItem={renderSessionItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No sessions found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  searchInput: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  sessionCard: {
    backgroundColor: '#f1f8fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  sessionHeader: {
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34788c',
  },
  programName: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#34788c',
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
