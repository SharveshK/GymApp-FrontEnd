import React, { useState } from 'react';
import { View, StyleSheet, Button, TextInput, Text, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { RouteProp } from '@react-navigation/native';

// --- Navigation Props ---
type Step4NavigationProp = StackNavigationProp<AuthStackParamList, 'OnboardingStep4'>;
type Step4RouteProp = RouteProp<AuthStackParamList, 'OnboardingStep4'>;

type Props = {
  navigation: Step4NavigationProp;
  route: Step4RouteProp;
};

const OnboardingStep4 = ({ navigation, route }: Props) => {
  // 1. Get all the data from the previous screen
  const { ...prevData } = route.params;

  // 2. Create state for *this* screen's data
  const [equipmentIds, setEquipmentIds] = useState(''); // e.g., "1, 2"
  const [customEquipmentNames, setCustomEquipmentNames] = useState(''); // e.g., "TRX, 20kg Kettlebell"

  // Helper function to turn a string "1, 2, 3" into a Set<number>
  const parseIds = (idString: string): Set<number> => {
    if (idString.trim() === '') {
      return new Set();
    }
    return new Set(idString.split(',').map(id => parseInt(id.trim(), 10)));
  };

  // Helper function to turn a string "a, b, c" into a Set<string>
  const parseNames = (nameString: string): Set<string> => {
    if (nameString.trim() === '') {
      return new Set();
    }
    return new Set(nameString.split(',').map(name => name.trim()));
  };


  const handleNext = () => {
    // Alert.alert('DEBUG', 'Navigating to Final Submit Screen...');
    navigation.navigate('OnboardingStep5_Submit', {
      ...prevData, // Pass all the old data
      
      // Pass new data
      equipmentIds: Array.from(parseIds(equipmentIds)),
      customEquipmentNames: Array.from(parseNames(customEquipmentNames)),
    });
    // We will build this screen next
    // navigation.navigate('OnboardingStep5_Submit', {
    //   ...prevData, // Pass all the old data
      
    //   // Pass new data
    //   equipmentIds: Array.from(parseIds(equipmentIds)),
    //   customEquipmentNames: Array.from(parseNames(customEquipmentNames)),
    // });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Equipment</Text>
      <Text style={styles.subtitle}>
        (Separate multiple items with a comma)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Equipment IDs (e.g., 1, 2)"
        value={equipmentIds}
        onChangeText={setEquipmentIds}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Custom Equipment (e.g., TRX, Rings)"
        value={customEquipmentNames}
        onChangeText={setCustomEquipmentNames}
        autoCapitalize="words"
      />
      
      <Button title="Next: Review & Submit" onPress={handleNext} />
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

export default OnboardingStep4;