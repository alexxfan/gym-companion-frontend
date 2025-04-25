import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createMealPlan } from '@/lib/mealplanService';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateMealPlanScreen() {
  const [planName, setPlanName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a meal plan name');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Creating new meal plan:', planName);
      const newPlan = await createMealPlan(planName);
      console.log('Meal plan created successfully, ID:', newPlan.meal_plan_id);
      
      //navigate directly back to meal plans page
      router.replace('/meal-plans');
    } catch (error) {
      console.error('Create meal plan error:', error);
      Alert.alert('Error', 'Failed to create meal plan. Please try again.');
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
        
        <Text style={styles.title}>Create New Meal Plan</Text>
        <Text style={styles.subtitle}>Plan your nutrition for better results</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Meal Plan Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., High Protein, Keto Diet, Bulking"
            value={planName}
            onChangeText={setPlanName}
            maxLength={50}
            editable={!isSubmitting}
          />
          
          <Text style={styles.helpText}>
            Your meal plan will contain different meals throughout the day, and each meal will include food items.
          </Text>

          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#179ea0" />
              <Text style={styles.loadingText}>Creating meal plan...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Create Meal Plan</Text>
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
          onPress={() => router.replace('/meal-plans')}
        >
          <Text style={styles.backButtonText}>Back to Meal Plans</Text>
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