import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMealById, deleteMeal, Meal, MealItem } from '@/lib/mealplanService';
import { MaterialIcons } from '@expo/vector-icons';

export default function MealDetailScreen() {
  const params = useLocalSearchParams();
  const meal_id = params['meal-id'] || '';
  const plan_id = params['plan-id'] || '';
  
  //convert and validate IDs
  const mealId = typeof meal_id === 'string' 
    ? Number(meal_id.replace(/[^0-9]/g, '')) 
    : Array.isArray(meal_id) 
      ? Number(meal_id[0]) 
      : 0;
      
  const planId = typeof plan_id === 'string' 
    ? Number(plan_id.replace(/[^0-9]/g, '')) 
    : Array.isArray(plan_id) 
      ? Number(plan_id[0]) 
      : 0;
  
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [foodItems, setFoodItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchMealDetails();
  }, [mealId, planId]);
  
  const fetchMealDetails = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching meal details for Plan ID: ${planId}, Meal ID: ${mealId}`);
      
      const data = await getMealById(planId, mealId);
      
      if (data && data.meal) {
        setMeal(data.meal);
        setFoodItems(data.foods || []);
        console.log('Meal loaded successfully:', data.meal.meal_type);
      } else {
        setError('Failed to load meal data');
        console.error('API returned empty data');
      }
    } catch (error) {
      console.error('Error loading meal:', error);
      setError('Failed to load meal');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAction = async () => {
    try {
      console.log(`Deleting meal with Plan ID: ${planId}, Meal ID: ${mealId}`);
      setIsDeleting(true);
      
      await deleteMeal(planId, mealId);
      
      console.log('Meal deleted successfully');
      router.replace(`/meal-plans/${planId}`);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };
  
  //calculate nutrition totals
  const calculateTotals = () => {
    if (!foodItems || foodItems.length === 0) return { proteins: 0, carbs: 0, fats: 0 };
    
    return foodItems.reduce((acc, item) => {
      return {
        proteins: acc.proteins + (item.proteins || 0),
        carbs: acc.carbs + (item.carbohydrates || 0),
        fats: acc.fats + (item.fats || 0)
      };
    }, { proteins: 0, carbs: 0, fats: 0 });
  };
  
  const nutritionTotals = calculateTotals();
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#179ea0" />
        <Text style={{ marginTop: 20 }}>Loading meal...</Text>
      </View>
    );
  }
  
  if (error || !meal) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          {error || 'Meal not found'}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.replace(`/meal-plans/${planId}`)}
        >
          <Text style={styles.backButtonText}>Back to Meal Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={{ marginTop: 20 }}>Deleting meal...</Text>
      </View>
    );
  }
  
  //confirm delete dialog
  if (showConfirmDelete) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Meal?</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this meal? This will also delete all food items.
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
      <Text style={styles.title}>{meal.meal_type}</Text>
      
      <View style={styles.nutritionCard}>
        <Text style={styles.nutritionTitle}>Nutrition Summary</Text>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{meal.total_calories || 0}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionTotals.proteins.toFixed(1)}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionTotals.carbs.toFixed(1)}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionTotals.fats.toFixed(1)}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>
  
      <Text style={styles.sectionTitle}>Food Items</Text>
      {foodItems.length === 0 ? (
        <Text style={styles.emptyMessage}>No food items added yet</Text>
      ) : (
        <FlatList
          data={foodItems}
          keyExtractor={(item) => item.food_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.foodCard}>
              <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{item.food_name}</Text>
                <Text style={styles.foodCalories}>{item.calories} kcal</Text>
              </View>
              <View style={styles.macrosContainer}>
                {item.proteins > 0 && (
                  <Text style={styles.macroItem}>Protein: {item.proteins}g</Text>
                )}
                {item.carbohydrates > 0 && (
                  <Text style={styles.macroItem}>Carbs: {item.carbohydrates}g</Text>
                )}
                {item.fats > 0 && (
                  <Text style={styles.macroItem}>Fat: {item.fats}g</Text>
                )}
              </View>
              <View style={styles.foodActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push(`/meal-plans/${planId}/meals/${mealId}/foods/${item.food_id}/edit`)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
  
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push(`/meal-plans/${planId}/meals/${mealId}/foods/create`)}
      >
        <Text style={styles.addButtonText}>Add Food Item</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => setShowConfirmDelete(true)}
      >
        <Text style={styles.deleteButtonText}>Delete Meal</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace(`/meal-plans/${planId}`)}
      >
        <Text style={styles.backButtonText}>Back to Meal Plan</Text>
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
    marginBottom: 24,
    textAlign: 'center'
  },
  nutritionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#179ea0',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
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
    textAlign: 'center',
  },
  foodCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#179ea0',
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  macroItem: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    fontSize: 12,
    color: '#666',
  },
  foodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#179ea0',
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
  backButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#179ea0',
    fontWeight: '600',
  },
  backButtonAlt: {
    backgroundColor: '#179ea0',
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
  }
});