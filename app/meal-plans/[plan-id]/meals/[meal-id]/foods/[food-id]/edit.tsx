import { useState, useEffect } from 'react';
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
import { getFoods, updateFood, deleteFood } from '@/lib/mealplanService';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditFoodScreen() {
  const params = useLocalSearchParams();
  const meal_id = params['meal-id'] || '';
  const plan_id = params['plan-id'] || '';
  const food_id = params['food-id'] || '';
  
  //convert id
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
      
  const foodId = typeof food_id === 'string' 
    ? Number(food_id.replace(/[^0-9]/g, '')) 
    : Array.isArray(food_id) 
      ? Number(food_id[0]) 
      : 0;
  
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchFoodDetails();
  }, [foodId]);

  const fetchFoodDetails = async () => {
    try {
      setIsLoading(true);
      console.log(`🔍 Fetching food details for ID: ${foodId}`);
      
      const foods = await getFoods(planId, mealId);
      const foodItem = foods.find(item => item.food_id === foodId);
      
      if (foodItem) {
        setFoodName(foodItem.food_name);
        setCalories(foodItem.calories.toString());
        setProteins(foodItem.proteins.toString());
        setCarbs(foodItem.carbohydrates.toString());
        setFats(foodItem.fats.toString());
        console.log('Food item loaded successfully:', foodItem.food_name);
      } else {
        setError('Failed to load food item data');
        console.error('API returned empty data or item not found');
      }
    } catch (error) {
      console.error('Error loading food item:', error);
      setError('Failed to load food item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        food_name: foodName,
        calories: calories ? parseFloat(calories) : 0,
        proteins: proteins ? parseFloat(proteins) : 0,
        carbohydrates: carbs ? parseFloat(carbs) : 0,
        fats: fats ? parseFloat(fats) : 0
      };
      
      console.log(`📝 Updating food item ${foodId}:`, updates);
      await updateFood(planId, mealId, foodId, updates);
      console.log('Food item updated successfully');
      
      //back to meal detaill page
      router.replace(`/meal-plans/${planId}/meals/${mealId}`);
    } catch (error) {
      console.error('Update food error:', error);
      Alert.alert('Error', 'Failed to update food item. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAction = async () => {
    try {
      console.log(`Deleting food item with ID: ${foodId}`);
      setIsDeleting(true);
      
      await deleteFood(planId, mealId, foodId);
      
      console.log('Food item deleted successfully');
      router.replace(`/meal-plans/${planId}/meals/${mealId}`);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
      Alert.alert('Error', 'Failed to delete food item');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#179ea0" />
        <Text style={{ marginTop: 20 }}>Loading food details...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.backButtonAlt}
          onPress={() => router.replace(`/meal-plans/${planId}/meals/${mealId}`)}
        >
          <Text style={styles.backButtonText}>Back to Meal</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isDeleting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={{ marginTop: 20 }}>Deleting food item...</Text>
      </View>
    );
  }
  
  //show confirmation
  if (showConfirmDelete) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete Food Item?</Text>
          <Text style={styles.confirmText}>
            Are you sure you want to delete this food item?
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="restaurant" size={60} color="#179ea0" />
        </View>
        
        <Text style={styles.title}>Edit Food Item</Text>
        <Text style={styles.subtitle}>Update nutrition details</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chicken Breast, Brown Rice, Banana"
            value={foodName}
            onChangeText={setFoodName}
            maxLength={50}
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            placeholder="Total calories (e.g., 250)"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Protein in grams (e.g., 30)"
            value={proteins}
            onChangeText={setProteins}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Carbohydrates (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Carbs in grams (e.g., 40)"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
          
          <Text style={styles.label}>Fat (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="Fat in grams (e.g., 10)"
            value={fats}
            onChangeText={setFats}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#179ea0" />
              <Text style={styles.loadingText}>Updating food item...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdate}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Update Food Item</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowConfirmDelete(true)}
                disabled={isSubmitting}
              >
                <Text style={styles.deleteButtonText}>Delete Food Item</Text>
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
          onPress={() => router.replace(`/meal-plans/${planId}/meals/${mealId}`)}
        >
          <Text style={styles.backButtonText}>Back to Meal</Text>
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
    centered: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
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
      color: '#179ea0',
    },
    button: {
      backgroundColor: '#179ea0',
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