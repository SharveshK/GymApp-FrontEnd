import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

// --- Navigation Props ---
type Step1NavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep1'>;
type Step1RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep1'>;

type Props = {
  navigation: Step1NavigationProp;
  route: Step1RouteProp;
};

const OnboardingStep1 = ({ navigation, route }: Props) => {
  // 1. Get the email and password from the previous screen
  const { email, password } = route.params;

  // 2. Create state for *this* screen's data
  const [dateOfBirth, setDateOfBirth] = useState(''); // e.g., "YYYY-MM-DD"
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [gender, setGender] = useState(''); // e.g., "MALE", "FEMALE"

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handleNext = () => {
    // Basic validation
    if (!dateOfBirth || !heightCm || !weightKg || !gender) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    
    // Validation passed, so now we navigate
    navigation.navigate('OnboardingStep2', {
      email,
      password,
      dateOfBirth,
      heightCm: parseFloat(heightCm),
      weightKg: parseFloat(weightKg),
      gender: gender.toUpperCase(), // We also format the data
    });
  };
  // --- END OF FIX ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Physical Profile</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />
      <TextInput
        style={styles.input}
        placeholder="Height (in cm)"
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Weight (in kg)"
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Gender (e.g., MALE, FEMALE, OTHER)"
        value={gender}
        onChangeText={setGender}
        autoCapitalize="characters"
      />
      
      <Button title="Next: Your Goals" onPress={handleNext} />
    </View>
  );
};

// --- Styles (Same as Login) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default OnboardingStep1;