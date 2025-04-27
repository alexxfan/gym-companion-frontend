import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getPrograms, Program } from '@/lib/workoutService';
import { getMealPlans, MealPlan } from '@/lib/mealplanService';
import { getSessionHistory, SessionSummary } from '@/lib/sessionService'; // make sure this exists



export default function HomeScreen() {
  const { isLoggedIn, user, isLoading} = useAuth();
  const router = useRouter();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    //only redirect if not loading AND not logged in
    if (!isLoading && !isLoggedIn) {
      const timeout = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);

      return () => clearTimeout(timeout);
    }
    //if logged in, get data
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn, isLoading]);
  
  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      
      //get recent programs
      const programsData = await getPrograms();
      setPrograms(programsData.slice(0, 3));
      
      //get recent meal plans
      const mealPlansData = await getMealPlans();
      setMealPlans(mealPlansData.slice(0, 3));

      //get recent sessions
      const sessionData = await getSessionHistory();
      setSessions(sessionData.slice(0, 3));

      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#435465" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/*Welcome*/}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}!` : '!'}
        </Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>
      
      {/*AI*/}
      <TouchableOpacity 
        style={styles.aiAssistantContainer}
        onPress={() => router.push('/ai-generation')}
      >
        <View style={styles.aiAssistantContent}>
          <MaterialIcons name="auto-awesome" size={36} color="#fff" style={styles.aiIcon} />
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>AI Training Assistant</Text>
            <Text style={styles.aiDescription}>Create personalized workout & meal plans</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={28} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#34788c' }]}
          onPress={() => router.push('/programs/create')}
        >
          <MaterialIcons name="fitness-center" size={24} color="white" />
          <Text style={styles.quickActionText}>New Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: '#179ea0' }]}
          onPress={() => router.push('/meal-plans/create')}
        >
          <MaterialIcons name="restaurant" size={24} color="white" />
          <Text style={styles.quickActionText}>New Meal Plan</Text>
        </TouchableOpacity>
      </View>
      
      {/*Programs*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Workout Programs</Text>
          <TouchableOpacity onPress={() => router.push('/programs')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {loadingData ? (
          <ActivityIndicator size="small" color="#34788c" style={{ marginVertical: 20 }} />
        ) : programs.length > 0 ? (
          programs.map(program => (
            <TouchableOpacity 
              key={program.program_id}
              style={styles.programCard}
              onPress={() => router.push(`/programs/${program.program_id}`)}
            >
              <View style={styles.programCardContent}>
                <MaterialIcons name="fitness-center" size={24} color="#34788c" style={styles.cardIcon} />
                <View>
                  <Text style={styles.programName}>{program.program_name}</Text>
                  <Text style={styles.programDate}>
                    Created: {new Date(program.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workout programs yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/programs/create')}
            >
              <Text style={styles.createButtonText}>Create One</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <TouchableOpacity onPress={() => router.push('/sessions/history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingData ? (
          <ActivityIndicator size="small" color="#34788c" style={{ marginVertical: 20 }} />
        ) : sessions.length > 0 ? (
          sessions.map(session => (
            <TouchableOpacity
              key={session.session_id}
              style={styles.programCard}
              onPress={() => router.push(`/sessions/${session.session_id}`)}
            >
              <View style={styles.programCardContent}>
                <MaterialIcons name="history" size={24} color="#34788c" style={styles.cardIcon} />
                <View>
                  <Text style={styles.programName}>{session.workout_name}</Text>
                  <Text style={styles.programDate}>
                    {new Date(session.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions yet</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/programs')}
            >
              <Text style={styles.createButtonText}>Start a Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      
      {/*Meal Plans*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Meal Plans</Text>
          <TouchableOpacity onPress={() => router.push('/meal-plans')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {loadingData ? (
          <ActivityIndicator size="small" color="#179ea0" style={{ marginVertical: 20 }} />
        ) : mealPlans.length > 0 ? (
          mealPlans.map(plan => (
            <TouchableOpacity 
              key={plan.meal_plan_id}
              style={styles.mealPlanCard}
              onPress={() => router.push(`/meal-plans/${plan.meal_plan_id}`)}
            >
              <View style={styles.programCardContent}>
                <MaterialIcons name="restaurant" size={24} color="#179ea0" style={styles.cardIcon} />
                <View>
                  <Text style={styles.programName}>{plan.meal_plan_name}</Text>
                  <Text style={styles.programDate}>
                    Created: {new Date(plan.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No meal plans yet</Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: '#179ea0' }]}
              onPress={() => router.push('/meal-plans/create')}
            >
              <Text style={styles.createButtonText}>Create One</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/*Tips (filler)*/}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Fitness Tips</Text>
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={24} color="#FFC107" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Stay hydrated! Aim to consume at least 2 litres of water a day.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={24} color="#FFC107" style={styles.tipIcon} />
          <Text style={styles.tipText}>
            Consistent workouts are more effective than occasional intense sessions. Aim for regular exercise!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeSection: {
    padding: 24,
    paddingTop: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  aiAssistantContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 15,
    backgroundColor: '#435465',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiAssistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    marginRight: 12,
  },
  aiTextContainer: {
    flexDirection: 'column',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  aiDescription: {
    fontSize: 14,
    color: '#e0e0e0',
    flex: 1,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    color: '#435465',
    fontWeight: '600',
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  mealPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  programCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // overflow: 'hidden', 
  },
  cardIcon: {
    marginRight: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  programDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#34788c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tipsSection: {
    margin: 20,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});