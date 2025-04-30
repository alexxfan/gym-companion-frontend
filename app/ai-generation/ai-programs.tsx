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
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import API from '@/lib/api';

//match backend
interface WorkoutPlanRequest {
    height: number;
    weight: number;
    age: number;
    gender: string;
    fitnessLevel: string;
    fitnessGoals: string[];
    workoutFrequency: number;
    preferredExercises?: string[];
    healthConditions?: string[];
    equipment?: string[];
}

export default function AIWorkoutGenerator() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);

    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [fitnessLevel, setFitnessLevel] = useState('beginner');
    const [fitnessGoals, setFitnessGoals] = useState('');
    const [workoutFrequency, setWorkoutFrequency] = useState('3');
    const [preferredExercises, setPreferredExercises] = useState('');
    const [healthConditions, setHealthConditions] = useState('');
    const [equipment, setEquipment] = useState('');

    const validateForm = () => {
        let errorTitle = '';
        let errorMessage = '';
        
        if (!height || !weight || !age || !gender || !fitnessLevel || !fitnessGoals || !workoutFrequency) {
            errorTitle = 'Missing Information';
            errorMessage = 'Please fill in all required fields.';
        } else if (isNaN(Number(height)) || isNaN(Number(weight)) || isNaN(Number(age)) || isNaN(Number(workoutFrequency))) {
            errorTitle = 'Invalid Input';
            errorMessage = 'Height, weight, age, and workout frequency must be numbers.';
        }
        if (errorMessage) {
            if (Platform.OS === 'web') {
                //web
                window.alert(errorTitle + ': ' + errorMessage);
            } else {
                //mobile
                Alert.alert(errorTitle, errorMessage);
            }
            return false;
        }
        return true;
    };

    const navigateToProgram = (planId: string | number) => {
        if (Platform.OS === 'web') {
            // For web, immediately redirect
            window.location.href = `/programs/${planId}`;
        } else {
            // For mobile, use the router
            router.push(`/programs/${String(planId)}`);

        }
    };

    //form submission
    const handleGeneratePlan = async () => {
        if (!validateForm()) return;

        try {
            setIsGenerating(true);

            //form data to API request format
            const planRequest: WorkoutPlanRequest = {
                height: Number(height),
                weight: Number(weight),
                age: Number(age),
                gender,
                fitnessLevel,
                fitnessGoals: fitnessGoals.split(',').map(goal => goal.trim()),
                workoutFrequency: Number(workoutFrequency),
            };

            //optional fields if provided
            if (preferredExercises.trim()) {
                planRequest.preferredExercises = preferredExercises.split(',').map(ex => ex.trim());
            }

            if (healthConditions.trim()) {
                planRequest.healthConditions = healthConditions.split(',').map(condition => condition.trim());
            }

            if (equipment.trim()) {
                planRequest.equipment = equipment.split(',').map(item => item.trim());
            }

            console.log('Sending workout program request:', planRequest);

            //call the AI API endpoint
            const response = await API.post('/api/ai/workout-plan', planRequest);
            console.log('AI workout program response:', response.data);

            //check if plan was generated and saved successfully
            if (response.data && response.data.program_id) {
                if (Platform.OS === 'web') {
                    // On web, redirect immediately
                    navigateToProgram(response.data.program_id);
                } else {
                    // On mobile, show alert with navigation option
                    Alert.alert(
                        'Success!',
                        `Your workout program has been generated.`,
                        [
                            {
                                text: 'View Plan',
                                onPress: () => navigateToProgram(response.data.program_id)
                            }
                        ]
                    );
                }
            } else if (response.data && response.data.rawResponse) {
                Alert.alert(
                    'Plan Generated but Not Saved',
                    'The workout program was generated but could not be saved. Please try again.',
                    [{ text: 'OK' }]
                );
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error generating workout program:', error);
            Alert.alert(
                'Error',
                'Failed to generate workout program. Please try again later.'
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
                    <MaterialIcons name="fitness-center" size={60} color="#34788c" />
                    <Text style={styles.title}>AI Workout Program Generator</Text>
                    <Text style={styles.subtitle}>
                        Create a personalised workout program based on your fitness goals
                    </Text>
                </View>

                <View style={styles.formContainer}>
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
                            </Picker>
                        )}
                    </View>

                    <Text style={styles.label}>Fitness Level</Text>
                    <View style={styles.pickerContainer}>
                        {Platform.OS === 'ios' ? (
                            <View style={styles.iosPicker}>
                                <Picker
                                    selectedValue={fitnessLevel}
                                    onValueChange={(itemValue) => setFitnessLevel(itemValue)}
                                    enabled={!isGenerating}
                                    itemStyle={styles.iosPickerItem}
                                >
                                    <Picker.Item label="Beginner" value="beginner" />
                                    <Picker.Item label="Intermediate" value="intermediate" />
                                    <Picker.Item label="Advanced" value="advanced" />
                                </Picker>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={fitnessLevel}
                                onValueChange={(itemValue) => setFitnessLevel(itemValue)}
                                enabled={!isGenerating}
                                style={styles.picker}
                            >
                                <Picker.Item label="Beginner" value="beginner" />
                                <Picker.Item label="Intermediate" value="intermediate" />
                                <Picker.Item label="Advanced" value="advanced" />
                            </Picker>
                        )}
                    </View>

                    <Text style={styles.label}>Fitness Goals (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., weight loss, muscle gain, endurance"
                        value={fitnessGoals}
                        onChangeText={setFitnessGoals}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Workout Days Per Week</Text>
                    <View style={styles.pickerContainer}>
                        {Platform.OS === 'ios' ? (
                            <View style={styles.iosPicker}>
                                <Picker
                                    selectedValue={workoutFrequency}
                                    onValueChange={(itemValue) => setWorkoutFrequency(itemValue)}
                                    enabled={!isGenerating}
                                    itemStyle={styles.iosPickerItem}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                        <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        ) : (
                            <Picker
                                selectedValue={workoutFrequency}
                                onValueChange={(itemValue) => setWorkoutFrequency(itemValue)}
                                enabled={!isGenerating}
                                style={styles.picker}
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                    <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                                ))}
                            </Picker>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Additional Information (Optional)</Text>

                    <Text style={styles.label}>Preferred Exercises (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., squats, bench press, running"
                        value={preferredExercises}
                        onChangeText={setPreferredExercises}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Health Conditions (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., lower back pain, knee issues"
                        value={healthConditions}
                        onChangeText={setHealthConditions}
                        editable={!isGenerating}
                    />

                    <Text style={styles.label}>Available Equipment (comma-separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., dumbbells, barbell, resistance bands"
                        value={equipment}
                        onChangeText={setEquipment}
                        editable={!isGenerating}
                    />

                    {isGenerating ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#34788c" />
                            <Text style={styles.loadingText}>Generating your personalised workout program...</Text>
                            <Text style={styles.noteText}>This may take a minute or two.</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={handleGeneratePlan}
                        >
                            <Text style={styles.generateButtonText}>Generate Workout Program</Text>
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
        color: '#34788c',
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
    loadingContainer: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#34788c',
    },
    noteText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    generateButton: {
        backgroundColor: '#34788c',
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
        color: '#34788c',
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