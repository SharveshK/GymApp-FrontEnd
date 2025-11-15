import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

// --- Navigation Props ---
type Step3NavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep3'>;
type Step3RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep3'>;

type Props = {
  navigation: Step3NavigationProp;
  route: Step3RouteProp;
};

const OnboardingStep3 = ({ navigation, route }: Props) => {
  // 1. Get all the data from the previous screen
  const { ...prevData } = route.params;

  // 2. Create state for *this* screen's data
  const [allergyIds, setAllergyIds] = useState(''); // e.g., "1, 2"
  const [medicalConditionIds, setMedicalConditionIds] = useState('');
  const [dislikedFoodIds, setDislikedFoodIds] = useState('');

  // Helper function to turn a string "1, 2, 3" into a Set<number>
  const parseIds = (idString: string): Set<number> => {
    if (idString.trim() === '') {
      return new Set();
    }
    return new Set(idString.split(',').map(id => parseInt(id.trim(), 10)));
  };

  const handleNext = () => {
    // 3. We will navigate to Step 4, passing *everything*
    // Alert.alert('DEBUG', 'Navigating to OnboardingStep4...'); // 1. Comment this out
    
    // 2. Uncomment this block
    navigation.navigate('OnboardingStep4', {
      ...prevData, // Pass all the old data
      
      // Pass new data
      allergyIds: Array.from(parseIds(allergyIds)),
      medicalConditionIds: Array.from(parseIds(medicalConditionIds)),
      dislikedFoodIds: Array.from(parseIds(dislikedFoodIds)),
    });
  };

 return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Health & Preferences</Text> 
      <Text style={styles.subtitle}>
        For now, enter the IDs from the database, separated by commas.
        (e.g., "1, 3")
      </Text>

      <TextInput
        style={styles.input} 
        placeholder="Allergy IDs (e.g., 1, 2)"
        value={allergyIds}
        onChangeText={setAllergyIds} 
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Medical Condition IDs (e.g., 1)"
        value={medicalConditionIds}
        onChangeText={setMedicalConditionIds} 
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Disliked Food IDs (e.g., 2, 3)"
        value={dislikedFoodIds}
        onChangeText={setDislikedFoodIds} 
        keyboardType="numeric"
      />
      
      <Button title="Next: Equipment" onPress={handleNext} />
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
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

export default OnboardingStep3;