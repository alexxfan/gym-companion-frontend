import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMealPlanById, deleteMealPlan, MealPlan, Meal } from '@/lib/mealplanService';

export default function MealPlanDetailScreen() {
  const params = useLocalSearchParams();
  const plan_id = params.plan_id || params['plan-id'] || '';
  
  // Convert and validate planId safely - handle string, array, or other types
  const planId = typeof plan_id === 'string' 
    ? Number(plan_id.replace(/[^0-9]/g, '')) 
    : Array.isArray(plan_id) 
      ? Number(plan_id[0]) 
      : 0;
      
  const isValidId = !isNaN(planId) && Number.isInteger(planId) && planId > 0;
  
  const router = useRouter();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isValidId) {
      fetchMealPlanDetails();
    } else {
      setLoading(false);
    }
  }, [planId]);
  
  const fetchMealPlanDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching meal plan details for ID:', planId);
      const data = await getMealPlanById(planId);
      
      if (data && data.plan) {
        setPlan(data.plan);
        setMeals(data.meals || []);
        console.log('✅ Meal plan loaded successfully:', data.plan.meal_plan_name);
      } else {
        setError('Failed to load meal plan data');
        console.error('❌ API returned empty data');
      }
    } catch (error) {
      console.error('❌ Error loading meal plan:', error);
      setError('Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAction = async () => {
    try {
      console.log('🗑️ Deleting meal plan with ID:', planId);
      setIsDeleting(true);
      
      await deleteMealPlan(planId);
      
      console.log('✅ Meal plan deleted successfully');
      router.replace('/meal-plans');
    } catch (error) {
      console.error('❌ Delete error:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  
  if (!isValidId) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          Invalid meal plan ID: {String(plan_id)}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.replace('/meal-plans')}
        >
          <Text style={styles.backButtonText}>Back to Meal Plans</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#179ea0" />
        <Text style={{ marginTop: 20 }}>Loading meal plan...</Text>
      </View>
    );
  }
  
  if (error || !plan) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          {error || 'Meal plan not found'}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.replace('/meal-plans')}
        >
          <Text style={styles.backButtonText}>Back to Meal Plans</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={{ marginTop: 20 }}>Deleting meal plan...</Text>
      </View>
    );
  }
  
  // Show confirmation UI instead of using Alert
  if (showConfirmDelete) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Meal Plan?</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this meal plan? This will also delete all meals and food items.
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
      <Text style={styles.title}>{plan.meal_plan_name}</Text>
      <Text style={styles.date}>Created: {new Date(plan.date).toLocaleDateString()}</Text>
  
      <Text style={styles.sectionTitle}>Meals</Text>
      {meals.length === 0 ? (
        <Text style={styles.emptyMessage}>No meals added yet</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.meal_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.mealCard}
              onPress={() => router.push(`/meal-plans/${planId}/meals/${item.meal_id}`)}
            >
              <Text style={styles.mealName}>{item.meal_type}</Text>
              <Text style={styles.mealTime}>{item.total_calories} kcal</Text>
            </TouchableOpacity>
          )}
        />
      )}
  
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push(`/meal-plans/${planId}/meals/create`)}
      >
        <Text style={styles.addButtonText}>Add New Meal</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          console.log('🧨 Delete button pressed');
          setShowConfirmDelete(true);
        }}
      >
        <Text style={styles.deleteButtonText}>Delete Meal Plan</Text>
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
  mealCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    marginTop: 24,
    backgroundColor: '#179ea0',
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
  backButtonAlt: {
    backgroundColor: '#179ea0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  backButtonText: {
    color: '#fff',
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