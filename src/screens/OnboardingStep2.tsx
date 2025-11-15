import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

// --- Navigation Props ---
type Step2NavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep2'>;
type Step2RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep2'>;

type Props = {
  navigation: Step2NavigationProp;
  route: Step2RouteProp;
};

const OnboardingStep2 = ({ navigation, route }: Props) => {
  // 1. Get all the data from the previous screen
  const { email, password, dateOfBirth, heightCm, weightKg, gender } = route.params;

  // 2. Create state for *this* screen's data
  // (Your SQL 'user_profiles' table has all these)
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [dietaryType, setDietaryType] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [workoutLocation, setWorkoutLocation] = useState('');
  const [mealFrequency, setMealFrequency] = useState('');
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState('');

  const handleNext = () => {
    // 3. Validation
    if (!primaryGoal || !experienceLevel || !dietaryType || !activityLevel || !workoutLocation || !mealFrequency || !cookingTimeMinutes) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    
    // Alert.alert('DEBUG', 'Navigating to OnboardingStep3...');
    navigation.navigate('OnboardingStep3', {
      // Pass old data
      email, password, dateOfBirth, heightCm, weightKg, gender,
      
      // Pass new data (and sanitize/format it)
      primaryGoal: primaryGoal.toUpperCase(),
      experienceLevel: experienceLevel.toUpperCase(),
      dietaryType: dietaryType.toUpperCase(),
      activityLevel: activityLevel.toUpperCase(),
      workoutLocation: workoutLocation.toUpperCase(),
      mealFrequency: parseInt(mealFrequency), // Convert string to number
      cookingTimeMinutes: parseInt(cookingTimeMinutes) // Convert string to number
    });
  };

  return (
    // We use ScrollView in case the form is too long for the screen
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Goals & Lifestyle</Text>

      <TextInput
        style={styles.input}
        placeholder="Primary Goal (e.g., BUILD_MUSCLE)"
        value={primaryGoal}
        onChangeText={setPrimaryGoal}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Experience (e.g., BEGINNER)"
        value={experienceLevel}
        onChangeText={setExperienceLevel}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Diet (e.g., NON_VEG, VEGAN)"
        value={dietaryType}
        onChangeText={setDietaryType}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Activity Level (e.g., SEDENTARY)"
        value={activityLevel}
        onChangeText={setActivityLevel}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Workout Location (e.g., COMMERCIAL_GYM)"
        value={workoutLocation}
        onChangeText={setWorkoutLocation}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Meals per day (e.g., 4)"
        value={mealFrequency}
        onChangeText={setMealFrequency}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Max cooking time (minutes)"
        value={cookingTimeMinutes}
        onChangeText={setCookingTimeMinutes}
        keyboardType="numeric"
      />
      
      <Button title="Next: Health & Allergies" onPress={handleNext} />
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Use flexGrow for ScrollView
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default OnboardingStep2;