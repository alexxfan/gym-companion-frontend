// app/ai-generator/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AIGeneratorScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="auto-awesome" size={60} color="#435465" />
        <Text style={styles.title}>AI Training Assistant</Text>
        <Text style={styles.subtitle}>
          Generate personalized workout and meal plans powered by AI
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Workout Program*/}
        <TouchableOpacity 
          style={[styles.card, { borderLeftColor: '#34788c' }]}
          onPress={() => router.push('/ai-generation/ai-programs')}
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="fitness-center" size={40} color="#34788c" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Workout Program</Text>
              <Text style={styles.cardDescription}>
                Create a personalized workout program based on your fitness level and goals
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardFooterText, { color: '#34788c' }]}>Generate Now</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#34788c" />
          </View>
        </TouchableOpacity>

        {/* Meal Plan*/}
        <TouchableOpacity 
          style={[styles.card, { borderLeftColor: '#179ea0' }]}
          onPress={() => router.push('/ai-generation/ai-meal-plans')}
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="restaurant" size={40} color="#179ea0" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Meal Plan</Text>
              <Text style={styles.cardDescription}>
                Get a nutrition plan tailored to your dietary preferences and fitness goals
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardFooterText, { color: '#179ea0' }]}>Generate Now</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#179ea0" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <MaterialIcons name="info-outline" size={24} color="#666" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Our AI assistant creates personalized plans based on your information. The generated plans will be saved to your account and can be accessed anytime.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginTop: 20,
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
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  cardFooterText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  backButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#435465',
    fontSize: 16,
    fontWeight: '600',
  }
});
