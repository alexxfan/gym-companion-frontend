import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createMeal } from '@/lib/mealplanService';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateMealScreen() {
  const params = useLocalSearchParams();
  const plan_id = params['plan-id'] || '';
  
  //convert and validate planId
  const planId = typeof plan_id === 'string' 
    ? Number(plan_id.replace(/[^0-9]/g, '')) 
    : Array.isArray(plan_id) 
      ? Number(plan_id[0]) 
      : 0;

  const [mealType, setMealType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!mealType.trim()) {
      Alert.alert('Error', 'Please enter a meal type');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`📝 Creating new meal in plan ${planId}:`, mealType);
      const newMeal = await createMeal(planId, mealType);
      console.log('Meal created successfully, ID:', newMeal.meal_id);
      
      //go back to meal plan detail page
      router.replace(`/meal-plans/${planId}`);
    } catch (error) {
      console.error('Create meal error:', error);
      Alert.alert('Error', 'Failed to create meal. Please try again.');
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
          <MaterialIcons name="restaurant" size={60} color="#179ea0" />
        </View>
        
        <Text style={styles.title}>Add New Meal</Text>
        <Text style={styles.subtitle}>Create a meal for your plan</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Meal Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Breakfast, Lunch, Dinner, Snack"
            value={mealType}
            onChangeText={setMealType}
            maxLength={50}
            editable={!isSubmitting}
          />
          
          <Text style={styles.helpText}>
            You can add specific food items to this meal after creating it.
          </Text>

          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#179ea0" />
              <Text style={styles.loadingText}>Creating meal...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Create Meal</Text>
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
          onPress={() => router.replace(`/meal-plans/${planId}`)}
        >
          <Text style={styles.backButtonText}>Back to Meal Plan</Text>
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
    color: '#179ea0',
    fontWeight: '600',
  },
});