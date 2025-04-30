import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import API from '@/lib/api';

//match backend
interface MealPlanRequest {
    height: number;
    weight: number;
    age: number;
    gender: string;
    fitnessGoals: string[];
    dietaryPreferences?: string[];
    allergies?: string[];
    mealsPerDay: number;
    calorieTarget?: number;
}

export default function AIMealGenerator() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [fitnessGoals, setFitnessGoals] = useState('');
    const [dietaryPreferences, setDietaryPreferences] = useState('');
    const [allergies, setAllergies] = useState('');
    const [mealsPerDay, setMealsPerDay] = useState('3');
    const [customCalories, setCustomCalories] = useState(false);
    const [calorieTarget, setCalorieTarget] = useState('');

    const validateForm = () => {
        let errorMessage = '';
        
        if (!height || !weight || !age || !gender || !fitnessGoals || !mealsPerDay) {
            errorMessage = 'Please fill in all required fields.';
        } else if (isNaN(Number(height)) || isNaN(Number(weight)) || isNaN(Number(age)) || isNaN(Number(mealsPerDay))) {
            errorMessage = 'Height, weight, age, and meals per day must be numbers.';
        } else if (customCalories && (isNaN(Number(calorieTarget)) || Number(calorieTarget) <= 0)) {
            errorMessage = 'Please enter a valid calorie target or disable custom calories.';
        }
        
        if (errorMessage) {
            if (Platform.OS === 'web') {
                //web
                window.alert('Missing Information: ' + errorMessage);
            } else {
                //mobile
                Alert.alert('Missing Information', errorMessage);
            }
            return false;
        }
        return true;
    };

    //web specific
    const navigateToMealPlan = (planId: string | number) => {
        if (Platform.OS === 'web') {
            // For web, immediately redirect
            window.location.href = `/meal-plans/${planId}`;
        } else {
            // For mobile, use the router
            router.push(`/meal-plans/${String(planId)}`);
        }
    };

    //form submission
    const handleGeneratePlan = async () => {
        if (!validateForm()) return;

        try {
            setIsGenerating(true);

            //form data to API request format
            const planRequest: MealPlanRequest = {
                height: Number(height),
                weight: Number(weight),
                age: Number(age),
                gender,
                fitnessGoals: fitnessGoals.split(',').map(goal => goal.trim()),
                mealsPerDay: Number(mealsPerDay),
            };

            //optional fields if provided
            if (dietaryPreferences.trim()) {
                planRequest.dietaryPreferences = dietaryPreferences.split(',').map(pref => pref.trim());
            }

            if (allergies.trim()) {
                planRequest.allergies = allergies.split(',').map(allergy => allergy.trim());
            }

            if (customCalories && calorieTarget) {
                planRequest.calorieTarget = Number(calorieTarget);
            }

            console.log('Sending meal plan request:', planRequest);

            //call the AI API endpoint
            const response = await API.post('/api/ai/meal-plan', planRequest);
            console.log('AI meal plan response:', response.data);

            //check if plan was generated and saved successfully
            if (response.data && response.data.meal_plan_id) {
                if (Platform.OS === 'web') {
                    // On web, redirect immediately
                    navigateToMealPlan(response.data.meal_plan_id);
                } else {
                    // On mobile, show alert with navigation option
                    Alert.alert(
                        'Success!',
                        `Your meal plan has been generated.`,
                        [
                            {
                                text: 'View Plan',
                                onPress: () => navigateToMealPlan(response.data.meal_plan_id)
                            }
                        ]
                    );
                }
            } else if (response.data && response.data.rawResponse) {
                Alert.alert(
                    'Plan Generated but Not Saved',
                    'The meal plan was generated but could not be saved. Please try again.',
                    [{ text: 'OK' }]
                );
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error generating meal plan:', error);
            Alert.alert(
                'Error',
                'Failed to generate meal plan. Please try again later.'
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <MaterialIcons name="restaurant" size={60} color="#179ea0" />
                    <Text style={styles.title}>AI Meal Plan Generator</Text>
                    <Text style={styles.subtitle}>
                        Create a personalised 3-day nutrition plan based on your goals
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {/*information*/}
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your height in centimeters"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your weight in kilograms"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your age"
                        keyboardType="numeric"
                        value={age}
                        onChangeText={setAge}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                        {Platform.OS === 'ios' ? (
                            <View style={styles.iosPicker}>
                                <Picker
                                    selectedValue={gender}
                                    onValueChange={(itemValue) => setGender(itemValue)}
                                    enabled={!isGenerating}
                                    itemStyle={styles.iosPickerItem}
                                >
                                    <Picker.Item label="Male" value="male" />
                                    <Picker.Item label="Female" value="female" />
                                    <Picker.Item label="Other" value="other" />
                                </Picker>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={gender}
                                onValueChange={(itemValue) => setGender(itemValue)}
                                enabled={!isGenerating}
                                style={styles.picker}
                            >
                                <Picker.Item label="Male" value="male" />
                                <Picker.Item label="Female" value="female" />
                                <Picker.Item label="other" value="other" />
                            </Picker>
                        )}
                    </View>

                    {/*Diet*/}
                    <Text style={styles.sectionTitle}>Diet Details</Text>

                    <Text style={styles.label}>Fitness Goals (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., weight loss, muscle gain, maintenance"
                        value={fitnessGoals}
                        onChangeText={setFitnessGoals}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Meals Per Day</Text>
                    <View style={styles.pickerContainer}>
                        {Platform.OS === 'ios' ? (
                            <View style={styles.iosPicker}>
                                <Picker
                                    selectedValue={mealsPerDay}
                                    onValueChange={(itemValue) => setMealsPerDay(itemValue)}
                                    enabled={!isGenerating}
                                    itemStyle={styles.iosPickerItem}
                                >
                                    {[2, 3, 4, 5, 6].map(num => (
                                        <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={mealsPerDay}
                                onValueChange={(itemValue) => setMealsPerDay(itemValue)}
                                enabled={!isGenerating}
                                style={styles.picker}
                            >
                                {[2, 3, 4, 5, 6].map(num => (
                                    <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                                ))}
                            </Picker>
                        )}
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>Set Custom Calorie Target</Text>
                        <Switch
                            value={customCalories}
                            onValueChange={setCustomCalories}
                            disabled={isGenerating}
                            trackColor={{ false: '#d0d0d0', true: '#a0d8d8' }}
                            thumbColor={customCalories ? '#179ea0' : '#f4f3f4'}
                        />
                    </View>

                    {customCalories && (
                        <TextInput
                            style={styles.input}
                            placeholder="Daily calorie target"
                            keyboardType="numeric"
                            value={calorieTarget}
                            onChangeText={setCalorieTarget}
                            editable={!isGenerating}
                        />
                    )}

                    {/*Preferences*/}
                    <Text style={styles.sectionTitle}>Dietary Preferences (Optional)</Text>

                    <Text style={styles.label}>Dietary Preferences (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., vegetarian, vegan, keto, paleo"
                        value={dietaryPreferences}
                        onChangeText={setDietaryPreferences}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Allergies/Restrictions (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., nuts, dairy, gluten, shellfish"
                        value={allergies}
                        onChangeText={setAllergies}
                        editable={!isGenerating}
                    />

                    {isGenerating ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#179ea0" />
                            <Text style={styles.loadingText}>Generating your personalised meal plan...</Text>
                            <Text style={styles.noteText}>This may take a minute or two.</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={handleGeneratePlan}
                        >
                            <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    disabled={isGenerating}
                >
                    <Text style={styles.backButtonText}>Back</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginTop: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        marginHorizontal: 20,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#179ea0',
        marginTop: 20,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 8,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    noteText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    generateButton: {
        backgroundColor: '#179ea0',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        color: '#179ea0',
        fontSize: 16,
        fontWeight: '600',
    },
    iosPicker: {
        width: '100%',
        height: 150,
    },
    iosPickerItem: {
        height: 150,
        fontSize: 16,
        color: '#333',
    },
});